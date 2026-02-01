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
