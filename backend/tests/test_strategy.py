import sys
import os
import asyncio
from datetime import datetime

sys.path.append(os.path.join(os.path.dirname(__file__), "../"))

from app.strategy.implementations.dummy import DummyStrategy
from app.schemas.market_data import KlineData

async def test_strategy_flow():
    print("Testing Strategy Flow...")
    
    # 1. Initialize Strategy
    strategy = DummyStrategy(strategy_id="test_dummy_v1", config={})
    print("[OK] Strategy Initialized.")
    
    # 2. Simulate Incoming Ticks
    print("Simulating 20 ticks...")
    signals_count = 0
    
    for i in range(20):
        # Create fake tick
        fake_tick = KlineData(
            symbol="BTCUSDT",
            interval="1m",
            open_time=datetime.now(),
            open_price=50000.0 + i,
            high_price=50100.0 + i,
            low_price=49900.0 + i,
            close_price=50050.0 + i,
            volume=100.0,
            close_time=datetime.now(),
            is_closed=True
        )
        
        # Feed to strategy
        signal = await strategy.on_tick(fake_tick)
        
        if signal:
            print(f" -> TICK {i}: SIGNAL GENERATED: {signal}")
            signals_count += 1
        else:
            # print(f" -> TICK {i}: No Signal")
            pass
            
    print(f"\n[OK] Test Complete. Generated {signals_count} signals out of 20 ticks.")

if __name__ == "__main__":
    asyncio.run(test_strategy_flow())
