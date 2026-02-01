from pydantic import BaseModel
from datetime import datetime

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
