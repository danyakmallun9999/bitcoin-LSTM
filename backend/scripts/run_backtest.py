import sys
import os
import asyncio
import pandas as pd

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), "../"))

from app.backtest.engine import BacktestEngine
from app.strategy.implementations.lstm_strategy import LSTMStrategy

async def main():
    # 1. Load Historical Data (Same as training data for now to verify "fit", usually use test set)
    data_dir = os.path.join(os.path.dirname(__file__), "../data/historical")
    files = [f for f in os.listdir(data_dir) if f.endswith(".csv")]
    if not files:
        print("No data found.")
        return
        
    filepath = os.path.join(data_dir, files[0])
    print(f"Loading data from {filepath}")
    df = pd.read_csv(filepath)
    
    # 2. Configure Strategy
    config = {
        "symbol": "BTCUSDT",
        "interval": "15m",
        "model_path": "app/ml/models/lstm_v1.pth", # Ensure this matches training output
        "seq_length": 60
    }
    
    # 3. Initialize Engine
    engine = BacktestEngine(LSTMStrategy, config, initial_capital=10000.0)
    
    # 4. Run Backtest
    # We need to pass the dataframe. 
    # Note: The strategy expects 'on_tick' with KlineData. 
    # The engine handles the iteration.
    await engine.run(df)

if __name__ == "__main__":
    asyncio.run(main())
