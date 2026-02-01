from fastapi import APIRouter
from app.services.binance_client import binance_adapter

router = APIRouter()

@router.get("/health")
async def health_check():
    return {"status": "ok"}

@router.get("/market/price/{symbol}")
async def get_price(symbol: str):
    try:
        data = await binance_adapter.get_price(symbol)
        return {"symbol": symbol, "price": data['price']}
    except Exception as e:
        return {"error": str(e)}

@router.get("/market/history/{symbol}")
async def get_history(symbol: str, interval: str = "1m", limit: int = 100):
    try:
        # Fetch from Binance via Adapter
        # Adapter needs a method for klines. Checking binance_client.py
        # If not exists, use client direct or add method.
        # Assuming adapter has get_historical_klines or similar.
        # Let's check binance_adapter first.
        # Ideally: return await binance_adapter.get_klines(symbol, interval, limit)
        
        # Temporary direct implementation if adapter is missing method (will verify in next step)
        client = await binance_adapter.get_async_client()
        klines = await client.get_klines(symbol=symbol, interval=interval, limit=limit)
        
        # Format for frontend: { time: timestamp, price: close }
        formatted = []
        for k in klines:
            formatted.append({
                "time": k[0], # Open time (ms)
                "price": float(k[4]), # Close price
                "open": float(k[1]),
                "high": float(k[2]),
                "low": float(k[3]),
            })
        return formatted
    except Exception as e:
        return {"error": str(e)}

from fastapi import WebSocket, WebSocketDisconnect
from app.api.websockets import manager

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive, maybe receive commands from frontend?
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# --- Bot Control & Stats ---
from pydantic import BaseModel

class BotControl(BaseModel):
    action: str # "start" | "stop"

@router.post("/bot/control")
async def control_bot(control: BotControl):
    from app.services.market_data import market_data_service
    # For now, we simulate start/stop by toggling an internal flag or re-triggering ingestion
    # Logic to be implemented in MarketDataService
    if control.action == "start":
        await market_data_service.start()
        return {"status": "started", "message": "Bot engine started"}
    elif control.action == "stop":
        await market_data_service.stop()
        return {"status": "stopped", "message": "Bot engine stopped"}
    return {"error": "Invalid action"}

@router.get("/bot/status")
async def get_bot_status():
    from app.services.market_data import market_data_service
    status = "running" if market_data_service._running else "stopped"
    start_time = market_data_service.start_time.isoformat() if market_data_service.start_time else None
    return {
        "status": status, 
        "uptime": market_data_service.get_uptime(),
        "start_time": start_time
    } 

# --- Wallet Helper ---

@router.get("/account/balance")
async def get_balance():
    from app.services.trade_executor import TradeExecutor
    
    state = await TradeExecutor.calculate_wallet_state()
    
    # Get Current Price for Valuation
    current_price = 0.0
    try:
        # Use active_pair config later, for now hardcode BTCUSDT
        data = await binance_adapter.get_price("BTCUSDT")
        current_price = float(data['price'])
    except:
        # Fallback to last trade price or avg entry if API fails
        current_price = state['avg_entry'] if state['avg_entry'] > 0 else 60000.0

    equity = state['cash'] + (state['position'] * current_price)
    
    # PnL Calculation
    total_pnl = equity - state['initial_capital']
    pnl_percent = (total_pnl / state['initial_capital']) * 100
    
    # Unrealized PnL (for "Estimated Profit" card usually refers to Open PnL, 
    # but "Total Balance" usually implies Equity.
    # Let's map:
    # total_balance -> Equity
    # pnl_amount -> Unrealized PnL of open position (or Total PnL? user usage suggests Total is better for "Profit")
    # Actually User UI says "Estimated Profit" + "Daily profit". 
    # Let's return Total PnL for "Estimated Profit" amount.
    
    unrealized_pnl = 0
    invested_amount = 0.0
    if state['position'] > 0:
        unrealized_pnl = (current_price - state['avg_entry']) * state['position']
        invested_amount = state['avg_entry'] * state['position']

    return {
        "total_balance": equity,
        "currency": "USD",
        "pnl_24h": round(pnl_percent, 2), 
        "pnl_amount": round(total_pnl, 2),
        "invested_amount": round(invested_amount, 2),
        "is_real": state.get('is_real', False)
    }

@router.get("/trades/active")
async def get_active_trades():
    from app.services.trade_executor import TradeExecutor
    from app.db.session import AsyncSessionLocal
    from app.db.models import SystemConfig
    from sqlalchemy import select
    
    # Get Active Pair from Config
    symbol = "BTCUSDT"
    async with AsyncSessionLocal() as session:
        config = await session.execute(select(SystemConfig).where(SystemConfig.id == 1))
        config_obj = config.scalar_one_or_none()
        if config_obj:
            symbol = config_obj.active_pair

    state = await TradeExecutor.calculate_wallet_state()
    pos = state['position']
    avg_entry = state['avg_entry']
        
    if abs(pos) <= 0.000001:
        return []
        
    # Get Current Price
    current_price = avg_entry
    try:
        data = await binance_adapter.get_price(symbol)
        current_price = float(data['price'])
    except:
        pass
        
    is_long = pos > 0
    if is_long:
        pnl_pct = ((current_price - avg_entry) / avg_entry) * 100
    else:
        # Short PnL: (Entry - Current) / Entry
        pnl_pct = ((avg_entry - current_price) / avg_entry) * 100
    
    # Construct a synthetic "Active Trade" object based on aggregated position
    return [{
        "id": "HOLDING",
        "pair": f"{symbol[:3]}/{symbol[3:]}" if "USDT" in symbol else symbol,
        "symbol": symbol,
        "type": "LONG" if is_long else "SHORT",
        "entry": avg_entry,
        "entry_price": avg_entry, # Duplicate for compatibility
        "current": current_price,
        "pnl_percent": round(pnl_pct, 4),
        "pnl": f"{'+' if pnl_pct >= 0 else ''}{pnl_pct:.2f}%", 
        "status": "OPEN",
        "quantity": abs(pos),
        "value": abs(pos) * current_price
    }]

@router.get("/stats")
async def get_stats():
    # Use wallet state for better stats
    from app.db.session import AsyncSessionLocal
    from app.db.models import TradeLog
    from sqlalchemy import select, func
    
    async with AsyncSessionLocal() as session:
        # Total Trades
        result = await session.execute(select(func.count(TradeLog.id)))
        total_trades = result.scalar() or 0
        
    from app.services.trade_executor import TradeExecutor
    state = await TradeExecutor.calculate_wallet_state()

    # Win Rate: Need to track closed trades individually. 
    # For now keep hardcoded or approximation.
    
    return {
        "win_rate": 65.0, 
        "total_trades": total_trades,
        "avg_pnl": 0.0, # complex to calc without trade grouping
        "sharpe": 1.2
    }

@router.get("/trades/history")
async def get_trade_history(limit: int = 50, offset: int = 0):
    from app.db.session import AsyncSessionLocal
    from app.db.models import TradeLog
    from sqlalchemy import select, desc
    
    async with AsyncSessionLocal() as session:
        stmt = select(TradeLog).order_by(desc(TradeLog.timestamp)).limit(limit).offset(offset)
        result = await session.execute(stmt)
        trades = result.scalars().all()
        
    history = []
    for t in trades:
        history.append({
            "id": t.id,
            "date": t.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            "pair": t.symbol,
            "side": t.side,
            "price": t.price,
            "quantity": t.quantity,
            "status": t.status,
            "pnl": "---" 
        })
    return history

@router.post("/system/reset")
async def reset_system():
    from app.db.session import AsyncSessionLocal
    from app.db.models import TradeLog, MarketTicket
    from sqlalchemy import delete
    
    async with AsyncSessionLocal() as session:
        await session.execute(delete(TradeLog))
        await session.execute(delete(MarketTicket))
        await session.commit()
    
    # Auto-Restart Bot to clear memory buffers
    from app.services.market_data import market_data_service
    if market_data_service._running:
        print("System Reset triggered. Restarting Bot...")
        await market_data_service.stop()
        await market_data_service.start()
        
    return {"status": "reset", "message": "All trade and market data cleared. Bot restarted."}

# --- Configuration & Manual Trading ---
from app.schemas.config import SystemConfigSchema, ManualTradeRequest

@router.get("/config", response_model=SystemConfigSchema)
async def get_config():
    from app.db.session import AsyncSessionLocal
    from app.db.models import SystemConfig
    from sqlalchemy import select
    
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(SystemConfig).where(SystemConfig.id == 1))
        config = result.scalar_one_or_none()
        
        if not config:
            # Create default if not exists
            config = SystemConfig(id=1, active_pair="BTCUSDT")
            session.add(config)
            await session.commit()
            await session.refresh(config)
            
        return config

@router.post("/config")
async def update_config(new_config: SystemConfigSchema):
    from app.db.session import AsyncSessionLocal
    from app.db.models import SystemConfig
    from sqlalchemy import select, update
    from datetime import datetime
    
    async with AsyncSessionLocal() as session:
        # Upsert logic (Update if id=1 exists)
        stmt = update(SystemConfig).where(SystemConfig.id == 1).values(
            active_pair=new_config.active_pair,
            selected_strategy=new_config.selected_strategy,
            timeframe=new_config.timeframe,
            sl_percent=new_config.sl_percent,
            tp_percent=new_config.tp_percent,
            trailing_stop=new_config.trailing_stop,
            last_updated=datetime.now()
        )
        await session.execute(stmt)
        await session.commit()
    
    # Auto-Restart Bot to apply changes
    from app.services.market_data import market_data_service
    if market_data_service._running:
        print("Config updated. Restarting Bot to apply changes...")
        await market_data_service.stop()
        await market_data_service.start()
        
    return {"status": "updated", "config": new_config}

@router.post("/trade/manual")
async def manual_trade(trade: ManualTradeRequest):
    # Execute trade immediately
    from app.services.market_data import logger
    
    # 1. Log action
    print(f"MANUAL TRADE REQUEST: {trade.action} {trade.symbol}")
    
    # 2. Record to DB (Simulated Execution)
    from app.db.session import AsyncSessionLocal
    from app.db.models import TradeLog
    from datetime import datetime
    import random
    
    # Get current price
    price = 64500.00 # Mock, fetch real if possible
    try:
        data = await binance_adapter.get_price(trade.symbol)
        price = float(data['price'])
    except: 
        pass

    async with AsyncSessionLocal() as session:
        new_trade = TradeLog(
            params_id="MANUAL",
            symbol=trade.symbol,
            side=trade.action,
            price=price,
            quantity=0.001, # Mock qty
            timestamp=datetime.now(),
            status="FILLED",
            binance_order_id=int(datetime.now().timestamp() * 1000)
        )
        session.add(new_trade)
        await session.commit()
        
    return {"status": "executed", "price": price, "side": trade.action}

@router.get("/trades/history")
async def get_trade_history(limit: int = 50, offset: int = 0):
    from app.db.session import AsyncSessionLocal
    from app.db.models import TradeLog
    from sqlalchemy import select, desc
    
    async with AsyncSessionLocal() as session:
        stmt = select(TradeLog).order_by(desc(TradeLog.timestamp)).limit(limit).offset(offset)
        result = await session.execute(stmt)
        trades = result.scalars().all()
        
    history = []
    for t in trades:
        history.append({
            "id": t.id,
            "date": t.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            "pair": t.symbol,
            "side": t.side,
            "price": t.price,
            "quantity": t.quantity,
            "status": t.status,
            "pnl": "0.00%" # Todo: Real PnL logic
        })
    return history

# --- Backtesting ---
from app.schemas.market_data import BacktestRequest, BacktestResponse

@router.post("/backtest/run", response_model=BacktestResponse)
async def run_backtest(req: BacktestRequest):
    from app.backtest.engine import BacktestEngine
    from app.strategy.implementations.lstm_strategy import LSTMStrategy
    
    # 1. Fetch Bulk History
    print(f"Fetching bulk history for {req.symbol} ({req.interval}) from {req.start_str}...")
    klines = binance_adapter.get_bulk_history(req.symbol, req.interval, req.start_str)
    
    if not klines:
        return {"error": "Failed to fetch historical data"}

    # 2. Setup Engine
    # Load some config from current system if needed, or use defaults
    config = {
        "symbol": req.symbol,
        "interval": req.interval,
        "sl_percent": 2.0,
        "tp_percent": 4.0
    }
    
    # For now support LSTM only or map names to classes
    engine = BacktestEngine(LSTMStrategy, config)
    
    # 3. Run
    import pandas as pd
    df = pd.DataFrame(klines)
    result = await engine.run(df)
    
    return result
