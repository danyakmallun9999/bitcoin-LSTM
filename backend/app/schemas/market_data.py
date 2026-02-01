from pydantic import BaseModel
from datetime import datetime
from typing import TypedDict, Literal

class KlineData(BaseModel):
    """
    Standard OHLCV Kline Data
    """
    symbol: str
    interval: str
    open_time: datetime
    open_price: float
    high_price: float
    low_price: float
    close_price: float
    volume: float
    close_time: datetime
    is_closed: bool

class TradeSignal(TypedDict):
    action: Literal["BUY", "SELL", "HOLD"]
    symbol: str
    price: float
    reason: str

class TradeData(BaseModel):
    """
    Individual Trade Data
    """
    symbol: str
    trade_id: int
    price: float
    quantity: float
    time: datetime
    is_buyer_maker: bool

class BacktestRequest(BaseModel):
    symbol: str = "BTCUSDT"
    interval: str = "1h"
    start_str: str = "1 month ago UTC"
    strategy_name: str = "LSTMStrategy"

class BacktestResponse(BaseModel):
    initial_capital: float
    final_value: float
    total_pnl: float
    pnl_pct: float
    max_drawdown: float
    sharpe: float
    num_trades: int
    history: list # Sampled history for chart

