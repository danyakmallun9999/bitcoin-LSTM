from fastapi import APIRouter
from app.services.binance_client import binance_adapter

router = APIRouter()

@router.get("/health")
async def health_check():
    return {"status": "ok"}

@router.get("/market/price/{symbol}")
async def get_price(symbol: str):
    try:
        data = binance_adapter.get_price(symbol)
        return {"symbol": symbol, "price": data['price']}
    except Exception as e:
        return {"error": str(e)}
