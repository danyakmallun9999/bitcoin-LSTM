import asyncio
import os
import sys
import pandas as pd
from datetime import datetime, timedelta

# Add backend directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), "../"))

from app.services.binance_client import binance_adapter
from binance.client import AsyncClient

DATA_DIR = os.path.join(os.path.dirname(__file__), "../../database/data/historical")
os.makedirs(DATA_DIR, exist_ok=True)

async def download_historical_data(symbol: str, interval: str, start_str: str, end_str: str = None):
    print(f"Downloading {symbol} {interval} from {start_str}...")
    
    client = await binance_adapter.get_async_client()
    
    # helper from python-binance that handles pagination automatically
    klines = await client.get_historical_klines(
        symbol=symbol, 
        interval=interval, 
        start_str=start_str,
        end_str=end_str
    )
    
    print(f"Downloaded {len(klines)} candles.")
    
    # Process into DataFrame
    # Kline format: [Open time, Open, High, Low, Close, Volume, Close time, Quote asset volume, Number of trades, Taker buy base, Taker buy quote, Ignore]
    df = pd.DataFrame(klines, columns=[
        'open_time', 'open', 'high', 'low', 'close', 'volume', 
        'close_time', 'quote_volume', 'trades', 'taker_buy_base', 'taker_buy_quote', 'ignore'
    ])
    
    # Type conversion
    numeric_cols = ['open', 'high', 'low', 'close', 'volume']
    df[numeric_cols] = df[numeric_cols].apply(pd.to_numeric, axis=1)
    
    # Date conversion
    df['open_time'] = pd.to_datetime(df['open_time'], unit='ms')
    df['close_time'] = pd.to_datetime(df['close_time'], unit='ms')
    
    # Save to CSV
    filename = f"{symbol}_{interval}_{start_str.replace(' ', '_')}.csv"
    filepath = os.path.join(DATA_DIR, filename)
    df.to_csv(filepath, index=False)
    
    print(f"Saved to {filepath}")
    return df

if __name__ == "__main__":
    # Example usage: Download periods for training
    # "1 Jan, 2024" or "1 month ago UTC"
    try:
        asyncio.run(download_historical_data("BTCUSDT", "15m", "1 month ago UTC"))
    except KeyboardInterrupt:
        pass
