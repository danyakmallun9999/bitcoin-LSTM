from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, BigInteger
from app.db.session import Base

class MarketTicket(Base):
    """
    Hypertable for storing high-frequency market data.
    """
    __tablename__ = "market_data"
    
    time = Column(DateTime(timezone=True), primary_key=True, index=True)
    symbol = Column(String, primary_key=True, index=True)
    price = Column(Float)
    volume = Column(Float)
    
    # Optional: specialized columns for OHLCV if we store aggregated bars
    open = Column(Float, nullable=True)
    high = Column(Float, nullable=True)
    low = Column(Float, nullable=True)
    close = Column(Float, nullable=True)

class TradeLog(Base):
    """
    Table for recording executed trades.
    """
    __tablename__ = "trade_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    params_id = Column(String, index=True) # Link to Strategy Version
    symbol = Column(String, index=True)
    side = Column(String) # BUY / SELL
    price = Column(Float)
    quantity = Column(Float)
    timestamp = Column(DateTime(timezone=True))
    status = Column(String) # FILLED, PARTIALLY_FILLED
    binance_order_id = Column(BigInteger, unique=True)
