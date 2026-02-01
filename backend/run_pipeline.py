import asyncio
import logging
import sys
import os

# Setup Path
sys.path.append(os.path.join(os.path.dirname(__file__), "."))

from app.services.market_data import market_data_service
from app.strategy.registry import strategy_registry
from app.strategy.implementations.dummy import DummyStrategy

# Configure Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def main():
    logger.info("Starting Trading System Pipeline...")

    # 1. Register & Initialize Strategy
    logger.info("Initializing Strategies...")
    strategy_registry.register_class("DummyStrategy", DummyStrategy)
    
    # Create an instance listening to BTCUSDT
    dummy_instance = strategy_registry.create_instance(
        name="DummyStrategy", 
        instance_id="dummy_btc_v1", 
        config={"symbol": "BTCUSDT"}
    )
    logger.info(f"Strategy {dummy_instance.strategy_id} initialized.")

    # 2. Define Callback for Market Service
    async def pipeline_callback(data):
        # This callback is triggered by MarketDataService AFTER saving to DB
        # We can use this to feed specific strategies if needed, 
        # but for now we just log the end-to-end latency or success
        
        # Feed the strategy explicitly here for demonstration
        signal = await dummy_instance.on_tick(data)
        
        log_msg = f"[{data.symbol}] Price: {data.close_price}"
        if signal:
            log_msg += f" >>> SIGNAL: {signal['action']} ({signal['reason']})"
        
        logger.info(log_msg)

    # 3. Start Data Ingestion
    logger.info("Connecting to Binance WebSocket...")
    # Start Kline Socket for BTCUSDT 1m
    await market_data_service.start_kline_socket("BTCUSDT", "1m", pipeline_callback)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Pipeline stopped by user.")
