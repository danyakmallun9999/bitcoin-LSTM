from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Trading System"
    API_V1_STR: str = "/api/v1"
    
    # Binance API (Optional for now, defaults to None for public endpoints)
    BINANCE_API_KEY: str | None = None
    BINANCE_SECRET_KEY: str | None = None
    
    class Config:
        env_file = ".env"

settings = Settings()
