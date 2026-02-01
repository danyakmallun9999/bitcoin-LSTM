from pydantic import BaseModel
from typing import Optional

class SystemConfigSchema(BaseModel):
    active_pair: str = "BTCUSDT"
    selected_strategy: str = "LSTMStrategy"
    timeframe: str = "1m"
    sl_percent: float = 2.0
    tp_percent: float = 4.0
    trailing_stop: bool = False

class ManualTradeRequest(BaseModel):
    symbol: str
    action: str # "BUY" or "SELL"
    type: str = "MARKET"
    quantity: Optional[float] = None # If None, use full balance or fixed amount
