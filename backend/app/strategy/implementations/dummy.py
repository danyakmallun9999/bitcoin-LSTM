import random
from typing import Dict, Any, Optional
from app.strategy.base import BaseStrategy
from app.schemas.market_data import KlineData

class DummyStrategy(BaseStrategy):
    """
    A Dummy Strategy that generates random signals.
    Used for verifying the system pipeline.
    """
    async def on_tick(self, data: KlineData) -> Optional[Dict[str, Any]]:
        # Simple logic: 10% chance to buy, 10% to sell
        decision = random.random()
        
        if decision < 0.1:
            return {
                "action": "BUY",
                "symbol": data.symbol,
                "price": data.close_price,
                "reason": "DUMMY_RANDOM_BUY"
            }
        elif decision > 0.9:
            return {
                "action": "SELL",
                "symbol": data.symbol,
                "price": data.close_price,
                "reason": "DUMMY_RANDOM_SELL"
            }
        
        return None

    async def train(self, historical_data: Any):
        print(f"Dummy Strategy {self.strategy_id} 'trained' on {len(historical_data)} data points.")
