from binance.client import Client
from binance import AsyncClient
from app.core.config import settings

class BinanceAdapter:
    def __init__(self, api_key: str | None = None, api_secret: str | None = None):
        self.api_key = api_key or settings.BINANCE_API_KEY
        self.api_secret = api_secret or settings.BINANCE_SECRET_KEY
        self.client = Client(self.api_key, self.api_secret, testnet=settings.BINANCE_TESTNET)
        self.async_client = None

    async def get_async_client(self):
        if not self.async_client:
            self.async_client = await AsyncClient.create(self.api_key, self.api_secret, testnet=settings.BINANCE_TESTNET)
        return self.async_client

    def ping(self):
        """Test connectivity to the Rest API"""
        return self.client.ping()

    def get_server_time(self):
        return self.client.get_server_time()
    
    def get_price(self, symbol: str = "BTCUSDT"):
        return self.client.get_symbol_ticker(symbol=symbol)

    def get_history(self, symbol: str, interval: str, limit: int = 100):
        # Fetch historical klines (Synchronous)
        # Docs: https://python-binance.readthedocs.io/en/latest/binance.html#binance.client.Client.get_klines
        return self.client.get_klines(symbol=symbol, interval=interval, limit=limit)

    def create_order(self, symbol: str, side: str, quantity: float, order_type: str = "MARKET"):
        """
        Executes a real order on Binance.
        """
        # side: BUY or SELL
        # Doc: https://python-binance.readthedocs.io/en/latest/binance.html#binance.client.Client.create_order
        return self.client.create_order(
            symbol=symbol,
            side=side,
            type=order_type,
            quantity=f"{quantity:.4f}" # Format to avoid scientific notation
        )

    def get_bulk_history(self, symbol: str, interval: str, start_str: str, end_str: str | None = None):
        """
        Fetch historical klines over a large range.
        start_str: e.g. "1 month ago UTC" or "01 Feb, 2024"
        """
        # Docs: https://python-binance.readthedocs.io/en/latest/binance.html#binance.client.Client.get_historical_klines
        return self.client.get_historical_klines(symbol, interval, start_str, end_str)

    def get_account(self):
        """
        Fetch account information (balances, etc.)
        """
        return self.client.get_account()

# Global instance for public access
binance_adapter = BinanceAdapter()
