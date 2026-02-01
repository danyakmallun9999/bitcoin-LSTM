from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from app.schemas.market_data import KlineData

class BaseStrategy(ABC):
    """
    Abstract Base Class for all Trading Strategies.
    The 'Brain' of the system.
    """
    def __init__(self, strategy_id: str, config: Dict[str, Any]):
        self.strategy_id = strategy_id
        self.config = config
        self.state = {} # Internal state (e.g., accumulated windows)

    @abstractmethod
    async def on_tick(self, data: KlineData) -> Optional[Dict[str, Any]]:
        """
        Called every time a new market update (tick/kline) arrives.
        
        Args:
            data: The latest market data candle.
            
        Returns:
            Optional Dictionary containing a Signal (BUY/SELL) or None.
            Example: {"action": "BUY", "quantity": 0.1, "reason": "RSI_OVERSOLD"}
        """
        pass

    @abstractmethod
    async def train(self, historical_data: Any):
        """
        Method to retrain the internal model.
        """
        pass
    
    def get_state(self) -> Dict[str, Any]:
        """Return current internal state for debugging"""
        return self.state
