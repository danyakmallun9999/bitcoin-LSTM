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

class SystemConfig(Base):
    """
    Singleton-like table to store global system settings.
    Row with id=1 is the active config.
    """
    __tablename__ = "system_config"
    
    id = Column(Integer, primary_key=True, index=True)
    active_pair = Column(String, default="BTCUSDT") # Active symbol
    selected_strategy = Column(String, default="LSTMStrategy")
    timeframe = Column(String, default="1m")
    
    # Risk Params
    sl_percent = Column(Float, default=2.0) # Stop Loss %
    tp_percent = Column(Float, default=4.0) # Take Profit %
    trailing_stop = Column(Boolean, default=False)
    
    last_updated = Column(DateTime(timezone=True))
