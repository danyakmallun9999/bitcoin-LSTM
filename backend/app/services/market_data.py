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
            while True:
                res = await tscm.recv()
                if res:
                    # Transform raw data to internal schema if needed (or pass raw)
                    # For now passing raw to callback
                    await callback(res)

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
