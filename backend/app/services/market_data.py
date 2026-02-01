import asyncio
import logging
from typing import Callable, List
from binance import AsyncClient, BinanceSocketManager
from app.core.config import settings
from app.services.binance_client import binance_adapter

logger = logging.getLogger(__name__)

class MarketDataService:
    def __init__(self):
        self.active_streams = []
        self._running = False
        self._ingestion_task = None
        self.start_time = None

    async def start(self):
        if self._running:
            return
        logger.info("Starting Market Data Service...")
        self._running = True
        self._ingestion_task = asyncio.create_task(self.ingest_realtime_data())
        from datetime import datetime
        self.start_time = datetime.now()

    async def stop(self):
        if not self._running:
            return
        logger.info("Stopping Market Data Service...")
        self._running = False
        if self._ingestion_task:
            self._ingestion_task.cancel()
            try:
                await self._ingestion_task
            except asyncio.CancelledError:
                pass
            self._ingestion_task = None
        self.active_streams = []
        self.start_time = None

    def get_uptime(self) -> str:
        if not self._running or not self.start_time:
            return "0h 0m"
        
        from datetime import datetime
        now = datetime.now()
        diff = now - self.start_time
        
        hours, remainder = divmod(diff.seconds, 3600)
        minutes, _ = divmod(remainder, 60)
        
        # Add days if needed
        if diff.days > 0:
            return f"{diff.days}d {hours}h {minutes}m"
            
        return f"{hours}h {minutes}m"

    async def start_kline_socket(self, symbol: str, interval: str, callback: Callable):
        """
        Starts a WebSocket stream for a specific symbol/interval.
        """
        client = await binance_adapter.get_async_client()
        bm = BinanceSocketManager(client)
        
        # Format: <symbol>@kline_<interval>
        stream_name = f"{symbol.lower()}@kline_{interval}"
        self.active_streams.append(stream_name)
        
        logger.info(f"Starting Kline Socket for {symbol} {interval}")
        
        # Note: In a real prod environment, we would use a MultiplexSocket or similar
        # to handle multiple streams efficiently.
        socket = bm.kline_socket(symbol=symbol, interval=interval)

        async with socket as tscm:
            from datetime import datetime
            from app.db.session import AsyncSessionLocal
            from app.db.models import MarketTicket
            from app.schemas.market_data import KlineData
            from app.strategy.registry import strategy_registry

            while True:
                res = await tscm.recv()
                if res and 'k' in res:
                    kline = res['k']
                    
                    # 1. Parse Data
                    data_point = KlineData(
                        symbol=res['s'],
                        interval=kline['i'],
                        open_time=datetime.fromtimestamp(kline['t'] / 1000),
                        open_price=float(kline['o']),
                        high_price=float(kline['h']),
                        low_price=float(kline['l']),
                        close_price=float(kline['c']),
                        volume=float(kline['v']),
                        close_time=datetime.fromtimestamp(kline['T'] / 1000),
                        is_closed=kline['x']
                    )

                    # 2. Save to DB (Upsert to avoid duplicates)
                    from sqlalchemy.dialects.postgresql import insert
                    
                    async with AsyncSessionLocal() as session:
                        stmt = insert(MarketTicket).values(
                            time=data_point.close_time,
                            symbol=data_point.symbol,
                            price=data_point.close_price,
                            volume=data_point.volume,
                            open=data_point.open_price,
                            high=data_point.high_price,
                            low=data_point.low_price,
                            close=data_point.close_price
                        )
                        
                        # UPDATE if exists (Upsert)
                        stmt = stmt.on_conflict_do_update(
                            index_elements=['time', 'symbol'],
                            set_={
                                'price': stmt.excluded.price,
                                'volume': stmt.excluded.volume,
                                'open': stmt.excluded.open,
                                'high': stmt.excluded.high,
                                'low': stmt.excluded.low,
                                'close': stmt.excluded.close
                            }
                        )
                        
                        await session.execute(stmt)
                        await session.commit()

                    await callback(data_point)

                    # 3. Feed to Strategies
                    if data_point.is_closed:
                        for strategy_id, strategy in strategy_registry._strategies.items():
                            try:
                                signal = await strategy.on_tick(data_point)
                                
                                from app.api.websockets import manager
                                
                                # Broadcast Log (if available)
                                if hasattr(strategy, 'last_log') and strategy.last_log:
                                    await manager.broadcast({
                                        "type": "LOG",
                                        "data": {
                                            "time": datetime.now().strftime("%H:%M:%S"),
                                            "msg": strategy.last_log,
                                            "type": "info"
                                        }
                                    })
                                    strategy.last_log = "" # Clear after sending
                                
                                # Broadcast Indicators
                                if hasattr(strategy, 'last_indicators') and strategy.last_indicators:
                                    await manager.broadcast({
                                        "type": "INDICATORS",
                                        "data": strategy.last_indicators
                                    })
                                
                                # Broadcast Signal
                                if signal:
                                    print(f"SIGNAL: {signal}")
                                    await manager.broadcast({
                                        "type": "SIGNAL",
                                        "data": signal
                                    })
                                    # Send success log too
                                    await manager.broadcast({
                                        "type": "LOG",
                                        "data": {
                                            "time": datetime.now().strftime("%H:%M:%S"),
                                            "msg": f"Signal: {signal['action']} @ {signal['price']}",
                                            "type": "success"
                                        }
                                    })
                                    
                                    # 5. Execute Trade (Auto-Trading)
                                    from app.services.trade_executor import TradeExecutor
                                    trade = await TradeExecutor.execute_signal(signal)
                                    
                                    if trade:
                                        await manager.broadcast({
                                            "type": "LOG",
                                            "data": {
                                                "time": datetime.now().strftime("%H:%M:%S"),
                                                "msg": f"EXECUTED: {trade.side} {trade.quantity:.4f} @ {trade.price}",
                                                "type": "success"
                                            }
                                        })
                                    
                            except Exception as e:
                                print(f"Strategy Error {strategy_id}: {e}")
                    
                    # 4. Broadcast to Frontend via WebSocket
                    from app.api.websockets import manager
                    # Convert to dict (pydantic model dump)
                    # Use jsonable_encoder if needed, or just dict(). 
                    # datetime might need serialization
                    payload = {
                        "type": "TICK",
                        "data": {
                            "symbol": data_point.symbol,
                            "price": data_point.close_price,
                            "volume": data_point.volume,
                            "time": data_point.close_time.isoformat()
                        }
                    }
                    await manager.broadcast(payload)

    async def ingest_realtime_data(self):
        """
        Main entry point to start ingesting data.
        """
        # 0. Load Config from DB
        from app.db.session import AsyncSessionLocal
        from app.db.models import SystemConfig
        from sqlalchemy import select
        
        active_pair = "BTCUSDT"
        interval = "1m"
        
        async with AsyncSessionLocal() as session:
            result = await session.execute(select(SystemConfig).where(SystemConfig.id == 1))
            system_config = result.scalar_one_or_none()
            if system_config:
                active_pair = system_config.active_pair
                interval = system_config.timeframe
                logger.info(f"Loaded Config: {active_pair} {interval}")

        # 1. Initialize Strategies
        from app.strategy.registry import strategy_registry
        from app.strategy.implementations.lstm_strategy import LSTMStrategy
        
        # Register and Create Instance
        strategy_registry.register_class("LSTMStrategy", LSTMStrategy)
        
        # Config (Point to trained model)
        config = {
            "symbol": active_pair,
            "interval": interval, # Match socket interval
            "model_path": "app/ml/models/lstm_v1.pth",
            "seq_length": 60
        }
        
        try:
            strategy_registry.create_instance("LSTMStrategy", "lstm_v1", config)
            print(f"LSTM Strategy 'lstm_v1' initialized and running for {active_pair}.")
        except Exception as e:
            print(f"Failed to init strategy: {e}")

        # Example callback just logging
        async def process_kline(data):
            # print(f"Update: {data.symbol} Price: {data.close_price} Closed: {data.is_closed}")
            pass

        # Start for Active Pair
        await self.start_kline_socket(active_pair, interval, process_kline)

market_data_service = MarketDataService()
