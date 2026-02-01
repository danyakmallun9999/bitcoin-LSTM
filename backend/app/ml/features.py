import pandas as pd
import numpy as np

class FeatureEngineer:
    @staticmethod
    def add_technical_indicators(df: pd.DataFrame) -> pd.DataFrame:
        """
        Calculates simple technical indicators for the dataset.
        Assumes df has 'close' column.
        """
        df = df.copy()
        
        # 1. Log Returns (Stationary target for some models, or input feature)
        df['log_return'] = np.log(df['close'] / df['close'].shift(1))
        
        # 2. Simple Moving Average (SMA)
        df['sma_20'] = df['close'].rolling(window=20).mean()
        df['sma_50'] = df['close'].rolling(window=50).mean()
        
        # 3. RSI (Relative Strength Index) - 14 period
        delta = df['close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss
        df['rsi'] = 100 - (100 / (1 + rs))
        
        # 4. Volatility (Rolling Std Dev)
        df['volatility'] = df['close'].rolling(window=20).std()
        
        # Drop NaN caused by windows
        df.dropna(inplace=True)
        
        return df

    @staticmethod
    def create_sequences(data: np.ndarray, seq_length: int, predict_window: int = 1):
        """
        Creates Sliding Window sequences for LSTM.
        X: (N, seq_length, num_features)
        y: (N, ) - Target (e.g., next close > current close?)
        """
        xs, ys = [], []
        # data shape: [rows, features]
        # We want to predict if Price[t+1] > Price[t] (Binary Classification)
        # Or predict the Return[t+1] (Regression)
        
        # Let's do Binary Classification: 1 if Next Close > Current Close, else 0
        # Target column index assumed to be 'Close' or similar. 
        # But here 'data' is already normalized features.
        
        # Simplification: Let's assume the LAST column is the target for regression
        # Or better, we handle X and y separation before calling this.
        
        for i in range(len(data) - seq_length - predict_window):
            x = data[i:(i + seq_length)]
            # Target: Return of the next step
            # For simplicity, let's predict the 0-th feature of next step
            y = data[i + seq_length][0] 
            xs.append(x)
            ys.append(y)
            
        return np.array(xs), np.array(ys)
