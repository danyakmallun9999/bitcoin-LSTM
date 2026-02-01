import asyncio
from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.core.config import settings
from app.api.endpoints import router as api_router
from app.services.market_data import market_data_service

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize connections & Start Ingestion
    task = asyncio.create_task(market_data_service.ingest_realtime_data())
    yield
    # Shutdown: Close connections
    # task.cancel()

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {"message": "Trading System " + settings.PROJECT_NAME + " is running"}
