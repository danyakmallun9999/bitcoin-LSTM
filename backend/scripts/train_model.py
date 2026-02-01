import sys
import os
import torch
import torch.nn as nn
import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from torch.utils.data import DataLoader, TensorDataset

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), "../"))

from app.ml.features import FeatureEngineer
from app.ml.networks import LSTMNetwork

# Configuration
SEQ_LENGTH = 60 # Look back 60 candles
HIDDEN_DIM = 64
NUM_LAYERS = 2
EPOCHS = 10
BATCH_SIZE = 32
LEARNING_RATE = 0.001
MODEL_SAVE_PATH = os.path.join(os.path.dirname(__file__), "../app/ml/models/lstm_v1.pth")
os.makedirs(os.path.dirname(MODEL_SAVE_PATH), exist_ok=True)

def train():
    print("Starting Model Training...")
    
    # 1. Load Data
    data_dir = os.path.join(os.path.dirname(__file__), "../data/historical")
    # Find the downloaded file
    files = [f for f in os.listdir(data_dir) if f.endswith(".csv")]
    if not files:
        print("No historical data found! Run download_data.py first.")
        return
    
    filepath = os.path.join(data_dir, files[0])
    print(f"Loading data from {filepath}")
    df = pd.read_csv(filepath)
    
    # 2. Feature Engineering
    df = FeatureEngineer.add_technical_indicators(df)
    features = ['close', 'log_return', 'sma_20', 'rsi', 'volatility']
    data = df[features].values
    
    # Scale Data
    scaler = MinMaxScaler()
    data_scaled = scaler.fit_transform(data)
    
    # Create Sequences
    X, y = FeatureEngineer.create_sequences(data_scaled, SEQ_LENGTH)
    
    # Split Train/Test
    train_size = int(len(X) * 0.8)
    X_train, X_test = X[:train_size], X[train_size:]
    y_train, y_test = y[:train_size], y[train_size:]
    
    # Convert to Tensors
    X_train = torch.FloatTensor(X_train)
    y_train = torch.FloatTensor(y_train).view(-1, 1) # Target is next 'close' (scaled)
    X_test = torch.FloatTensor(X_test)
    y_test = torch.FloatTensor(y_test).view(-1, 1)
    
    # DataLoader
    dataset = TensorDataset(X_train, y_train)
    loader = DataLoader(dataset, batch_size=BATCH_SIZE, shuffle=True)
    
    # 3. Model Initialization
    input_dim = len(features)
    model = LSTMNetwork(input_dim, HIDDEN_DIM, 1, NUM_LAYERS)
    criterion = nn.MSELoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=LEARNING_RATE)
    
    # 4. Training Loop
    model.train()
    for epoch in range(EPOCHS):
        total_loss = 0
        for batch_X, batch_y in loader:
            optimizer.zero_grad()
            outputs = model(batch_X)
            loss = criterion(outputs, batch_y)
            loss.backward()
            optimizer.step()
            total_loss += loss.item()
            
        print(f"Epoch {epoch+1}/{EPOCHS}, Loss: {total_loss/len(loader):.6f}")
        
    # 5. Save Model
    torch.save(model.state_dict(), MODEL_SAVE_PATH)
    print(f"Model saved to {MODEL_SAVE_PATH}")
    
    # 6. Evaluate
    model.eval()
    with torch.no_grad():
        test_out = model(X_test)
        test_loss = criterion(test_out, y_test)
        print(f"Test Loss: {test_loss.item():.6f}")

if __name__ == "__main__":
    train()
