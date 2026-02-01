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
    return {"status": status, "uptime": "0h 42m"} # Todo: Calculate real uptime 

@router.get("/account/balance")
async def get_balance():
    # Return mock balance
    return {
        "total_balance": 12450.00,
        "currency": "USD",
        "pnl_24h": 5.24,
        "pnl_amount": 3402.10
    }

@router.get("/stats")
async def get_stats():
    from app.db.session import AsyncSessionLocal
    from app.db.models import TradeLog
    from sqlalchemy import select, func

    async with AsyncSessionLocal() as session:
        # Total Trades
        result = await session.execute(select(func.count(TradeLog.id)))
        total_trades = result.scalar() or 0
        
        # Win Rate (Mock calculation based on trades if we had PnL in logs)
        # For now, let's just return a placeholder or calculate if we add PnL column
        
    return {
        "win_rate": 68.5, # Placeholder until we have closed trade logic
        "total_trades": total_trades,
        "avg_pnl": 1.2,
        "sharpe": 1.4
    }

@router.get("/trades/active")
async def get_active_trades():
    from app.db.session import AsyncSessionLocal
    from app.db.models import TradeLog
    from sqlalchemy import select, desc
    
    async with AsyncSessionLocal() as session:
        # Get latest 10 trades
        stmt = select(TradeLog).order_by(desc(TradeLog.timestamp)).limit(10)
        result = await session.execute(stmt)
        trades = result.scalars().all()
        
    # Map to frontend format
    active_trades = []
    
    # Simple logic: If latest trade is BUY, we consider it OPEN for visualization
    # In reality, we'd check quantity balance. 
    # For this demo, we just show the logs as "Active" if they are recent.
    
    for t in trades:
        # Fetch current price for PnL (Mock or fetch from binance_adapter cache)
        # current_price = ... 
        # For speed let's just use the trade price as base
        
        active_trades.append({
            "id": t.id,
            "pair": t.symbol,
            "type": "LONG" if t.side == "BUY" else "SHORT",
            "entry": t.price,
            "current": t.price, # Todo: fetch real current price
            "pnl": "0.00%", # Todo: calculate diff
            "status": "OPEN" # or FILLED
        })

    return active_trades

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
