from binance.client import Client, AsyncClient
from app.core.config import settings

class BinanceAdapter:
    def __init__(self, api_key: str | None = None, api_secret: str | None = None):
        self.api_key = api_key or settings.BINANCE_API_KEY
        self.api_secret = api_secret or settings.BINANCE_SECRET_KEY
        self.client = Client(self.api_key, self.api_secret)
        self.async_client = None

    async def get_async_client(self):
        if not self.async_client:
            self.async_client = await AsyncClient.create(self.api_key, self.api_secret)
        return self.async_client

    def ping(self):
        """Test connectivity to the Rest API"""
        return self.client.ping()

    def get_server_time(self):
        return self.client.get_server_time()
    
    def get_price(self, symbol: str = "BTCUSDT"):
        return self.client.get_symbol_ticker(symbol=symbol)

# Global instance for public access
binance_adapter = BinanceAdapter()
