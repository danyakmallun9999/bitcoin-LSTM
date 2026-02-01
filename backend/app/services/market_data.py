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

                    # 3. Feed to Strategies
                    # In real app, we iterate over active strategies subscribed to this symbol
                    # For now, we just broadcast to all for testing
                    # Note: We usually only trade on 'Closed' candles to avoid repainting
                    if data_point.is_closed:
                        # Iterate all running strategies (simplified)
                        # In reality, strategies are instances in the registry
                        # For this demo, let's assume we have a way to get instances
                        pass 
                    
                    await callback(data_point)

    async def ingest_realtime_data(self):
        """
        Main entry point to start ingesting data.
        """
        # Example callback just logging
        async def process_kline(msg):
            kline = msg['k']
            is_closed = kline['x']
            close_price = kline['c']
            print(f"Update: {msg['s']} Price: {close_price} Closed: {is_closed}")

        # Start for BTCUSDT
        await self.start_kline_socket("BTCUSDT", "1m", process_kline)

market_data_service = MarketDataService()
