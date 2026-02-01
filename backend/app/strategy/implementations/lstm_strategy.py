from typing import List, Optional
import torch
import numpy as np
import pandas as pd
from app.strategy.base import BaseStrategy
from app.schemas.market_data import KlineData, TradeSignal
from app.ml.networks import LSTMNetwork
from app.ml.features import FeatureEngineer
from sklearn.preprocessing import MinMaxScaler
import os
from datetime import datetime
from app.services.binance_client import binance_adapter

class LSTMStrategy(BaseStrategy):
    def __init__(self, strategy_id: str, config: dict):
        super().__init__(strategy_id, config)
        self.symbol = config.get("symbol", "BTCUSDT")
        self.model_path = config.get("model_path", "app/ml/models/lstm_v1.pth")
        self.seq_length = config.get("seq_length", 60)
        
        # Buffer to store recent candles for inference
        # We need at least seq_length + lookback for indicators
        self.buffer_size = 150 
        self.candles: List[KlineData] = []
        
        # Model & Scaler
        self.model = None
        self.scaler = MinMaxScaler() # Note: In prod, scaler should be loaded from training!
        # For simplicity in this demo, we fit scaler on the buffer (Not ideal, but works for POC)
        # OR we just assume the range is similar.
        self.last_log = ""
        self.last_indicators = None
        
        self.load_model()
        self.preload_data()
        
    def preload_data(self):
        """
        Fetch historical data from Binance to fill the buffer immediately.
        """
        try:
            # We need buffer_size candles. Fetch a bit more to be safe.
            limit = self.buffer_size + 20
            print(f"[{self.strategy_id}] Preloading {limit} candles from Binance...")
            
            # Synchronous Fetch
            klines = binance_adapter.get_history(self.symbol, self.config.get("interval", "1m"), limit=limit)
            
            if not klines:
                print(f"[{self.strategy_id}] creating candles failed")
                return

            parsed_candles = []
            for k in klines:
                # k is [time, open, high, low, close, volume, close_time, ...]
                # Binance time is ms timestamp
                parsed_candles.append(KlineData(
                    symbol=self.symbol,
                    interval=self.config.get("interval", "1m"),
                    open_time=datetime.fromtimestamp(k[0] / 1000),
                    open_price=float(k[1]),
                    high_price=float(k[2]),
                    low_price=float(k[3]),
                    close_price=float(k[4]),
                    volume=float(k[5]),
                    close_time=datetime.fromtimestamp(k[6] / 1000),
                    is_closed=True 
                ))
            
            # Keep only the last buffer_size
            self.candles = parsed_candles[-self.buffer_size:]
            print(f"[{self.strategy_id}] Successfully preloaded {len(self.candles)} candles.")
            
        except Exception as e:
            print(f"[{self.strategy_id}] Error preloading data: {e}")
        
    def load_model(self):
        try:
            # Reconstruct model architecture
            # Assuming we know the input dim from features.py (5 features)
            input_dim = 5 
            hidden_dim = 64
            num_layers = 2
            
            self.model = LSTMNetwork(input_dim, hidden_dim, 1, num_layers)
            
            # Load weights
            # Adjust path relative to execution
            abs_path = os.path.abspath(self.model_path)
            if not os.path.exists(abs_path):
                 # Try relative to backend root
                 abs_path = os.path.join(os.getcwd(), self.model_path)
            
            if os.path.exists(abs_path):
                self.model.load_state_dict(torch.load(abs_path, map_location=torch.device('cpu')))
                self.model.eval()
                print(f"[{self.strategy_id}] LSTM Model loaded from {abs_path}")
            else:
                print(f"[{self.strategy_id}] Model file not found at {abs_path}")
        except Exception as e:
            print(f"[{self.strategy_id}] Error loading model: {e}")

    async def on_tick(self, market_data: KlineData) -> Optional[TradeSignal]:
        if market_data.symbol != self.symbol:
            return None
            
        # Only process closed candles for stable inference
        if not market_data.is_closed:
            return None

        self.candles.append(market_data)
        if len(self.candles) > self.buffer_size:
            self.candles.pop(0)
            
        # Need enough data for:
        # 1. Indicators (need ~50)
        # 2. Sequence (need 60 after indicators)
        if len(self.candles) < self.buffer_size:
            msg = f"[{self.strategy_id}] Buffering Data: {len(self.candles)}/{self.buffer_size}..."
            print(msg)
            self.last_log = msg
            return None
            
        # Prepare Data
        df = pd.DataFrame([{
            'close': c.close_price,
            'open': c.open_price,
            'high': c.high_price,
            'low': c.low_price,
            'volume': c.volume
        } for c in self.candles])
        
        # Feature Engineering
        try:
            df = FeatureEngineer.add_technical_indicators(df)
            features = ['close', 'log_return', 'sma_20', 'rsi', 'volatility']
            
            # Get last SEQ_LENGTH rows
            if len(df) < self.seq_length:
                return None
                
            input_data = df[features].tail(self.seq_length).values
            
            # Normalize (Using a fresh scaler on the window is bad practice, 
            # ideally load the scaler used in training. For POC we skip or use buffer min/max)
            # self.scaler.fit(input_data) # Only fits on this window... 
            # Better approach for POC: Simple Manual Normalization based on known approximate range
            # or just run it raw if model can handle it (it can't usually).
            
            # Let's fit on the whole buffer for a slightly better estimate
            self.scaler.fit(df[features].values)
            input_scaled = self.scaler.transform(input_data)
            
            # Inference
            tensor_in = torch.FloatTensor(input_scaled).unsqueeze(0) # (1, seq_len, features)
            
            with torch.no_grad():
                prediction = self.model(tensor_in).item()
                
            # Prediction is Scaled Next Close Price
            # Inverse transform is tricky if we only have the scaled value.
            # We construct a dummy row to inverse transform
            dummy = np.zeros((1, len(features)))
            dummy[0, 0] = prediction # close is at index 0
            predicted_close = self.scaler.inverse_transform(dummy)[0, 0]
            
            current_close = market_data.close_price
            
            # Store indicators for UI
            # Get the last row of indicators
            last_row = df.iloc[-1]
            self.last_indicators = {
                "rsi": float(last_row.get('rsi', 0)),
                "sma_20": float(last_row.get('sma_20', 0)),
                "volatility": float(last_row.get('volatility', 0)),
                "predicted_price": float(predicted_close),
                "current_price": float(current_close),
                "sentiment": "BULLISH" if predicted_close > current_close else "BEARISH",
                "confidence": abs((predicted_close - current_close) / current_close) * 1000 # Dummy score scale
            }

            log_msg = f"[{self.strategy_id}] Price: {current_close:.2f} -> Pred: {predicted_close:.2f}"
            print(log_msg)
            self.last_log = log_msg
            
            # Simple Logic: If predicted increase > 0.1%
            threshold = 1.0005 # 0.05%
            if predicted_close > current_close * threshold:
                return {
                    "action": "BUY",
                    "symbol": self.symbol,
                    "price": current_close,
                    "reason": f"LSTM_PRED_UP ({predicted_close:.2f})"
                }
            elif predicted_close < current_close / threshold:
                return {
                    "action": "SELL",
                    "symbol": self.symbol,
                    "price": current_close,
                    "reason": f"LSTM_PRED_DOWN ({predicted_close:.2f})"
                }
                
        except Exception as e:
            print(f"[{self.strategy_id}] Inference Error: {e}")
            self.last_log = f"Error: {str(e)}"
            
        return None

    async def train(self, historical_data):
        pass
