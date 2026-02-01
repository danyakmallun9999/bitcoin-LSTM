from typing import Dict, List, Type
import pandas as pd
from datetime import datetime
from app.strategy.base import BaseStrategy
from app.schemas.market_data import KlineData, TradeSignal

class BacktestEngine:
    def __init__(self, strategy_class: Type[BaseStrategy], config: Dict, initial_capital: float = 10000.0):
        self.strategy_class = strategy_class
        self.config = config
        self.initial_capital = initial_capital
        self.balance = initial_capital
        self.position = 0.0 # Asset amount
        self.portfolio_value = initial_capital
        self.trades: List[Dict] = []
        self.history: List[Dict] = [] # Track portfolio value over time
        
    async def run(self, data: pd.DataFrame):
        """
        Runs the backtest on the provided DataFrame.
        DataFrame must have: close, open, high, low, volume, open_time (datetime)
        """
        print(f"Starting Backtest with ${self.initial_capital:.2f}...")
        
        # Initialize Strategy
        # We need a dummy ID
        strategy = self.strategy_class(strategy_id="backtest_v1", config=self.config)
        
        # Simulate Loop
        for index, row in data.iterrows():
            # Create KlineData object
            # Assuming row has standard columns from our download script
            kline = KlineData(
                symbol=self.config.get("symbol", "BTCUSDT"),
                interval=self.config.get("interval", "15m"),
                open_time=pd.to_datetime(row['open_time']),
                open_price=row['open'],
                high_price=row['high'],
                low_price=row['low'],
                close_price=row['close'],
                volume=row['volume'],
                close_time=pd.to_datetime(row['close_time']),
                is_closed=True # In backtest, we iterate closed candles
            )
            
            # 1. Update Portfolio Value (Mark to Market)
            current_price = kline.close_price
            self.portfolio_value = self.balance + (self.position * current_price)
            self.history.append({
                "time": kline.close_time,
                "value": self.portfolio_value,
                "price": current_price
            })
            
            # 2. Get Signal
            signal = await strategy.on_tick(kline)
            
            # 3. Execute Trade (Simplified)
            if signal:
                self._execute_trade(signal, kline.close_time)
                
        self._generate_report()
    
    def _execute_trade(self, signal: TradeSignal, timestamp: datetime):
        price = signal['price']
        action = signal['action']
        
        # Simple Logic: All-in or Fixed Amount? 
        # Let's do fixed 10% of portfolio or similar. 
        # For this demo: 1 Unit of Asset check
        trade_size = 0.0 # Amount of BTC
        
        # Assume we trade with 95% of available cash on BUY, or Sell 100% position on SELL
        commission = 0.001 # 0.1% Binance fee
        
        if action == "BUY":
            if self.balance > 0:
                # Buy as much as possible
                amount_to_spend = self.balance * 0.99 # Leave some dust
                trade_size = amount_to_spend / price
                cost = trade_size * price
                fee = cost * commission
                
                self.balance -= (cost + fee)
                self.position += trade_size
                
                self.trades.append({
                    "time": timestamp,
                    "action": "BUY",
                    "price": price,
                    "size": trade_size,
                    "cost": cost,
                    "fee": fee,
                    "reason": signal['reason']
                })
                # print(f"BUY at {price:.2f}")

        elif action == "SELL":
            if self.position > 0.00001: # Epsilon
                # Sell all
                trade_size = self.position
                revenue = trade_size * price
                fee = revenue * commission
                
                self.balance += (revenue - fee)
                self.position = 0.0
                
                self.trades.append({
                    "time": timestamp,
                    "action": "SELL",
                    "price": price,
                    "size": trade_size,
                    "revenue": revenue,
                    "fee": fee,
                    "reason": signal['reason']
                })
                # print(f"SELL at {price:.2f}")

    def _generate_report(self):
        print("-" * 30)
        print("BACKTEST RESULT")
        print("-" * 30)
        print(f"Initial Capital: ${self.initial_capital:.2f}")
        print(f"Final Value:     ${self.portfolio_value:.2f}")
        
        pnl = self.portfolio_value - self.initial_capital
        pnl_pct = (pnl / self.initial_capital) * 100
        
        print(f"Total PnL:       ${pnl:.2f} ({pnl_pct:.2f}%)")
        print(f"Total Trades:    {len(self.trades)}")
        
        # Win Rate?
        # Requires matching Buy/Sell pairs, slightly complex for simpler engine.
        print("-" * 30)
        
        # Simple Buy & Hold comparison
        if self.history:
            start_price = self.history[0]['price']
            end_price = self.history[-1]['price']
            bnh_ret = ((end_price - start_price) / start_price) * 100
            print(f"Buy & Hold Ret:  {bnh_ret:.2f}%")
        print("-" * 30)
