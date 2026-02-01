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
        
        # State
        self.balance = initial_capital
        self.position = 0.0 # Positive for Long, Negative for Short
        self.avg_entry = 0.0
        
        self.portfolio_value = initial_capital
        self.trades: List[Dict] = []
        self.history: List[Dict] = [] 
        
        # Risk Params
        self.sl_pct = config.get("sl_percent", 2.0) / 100
        self.tp_pct = config.get("tp_percent", 4.0) / 100

    async def run(self, data: pd.DataFrame):
        """
        Runs the backtest on the provided DataFrame.
        """
        print(f"Starting Backtest ({self.config.get('symbol')}) with ${self.initial_capital:.2f}...")
        
        strategy = self.strategy_class(strategy_id="backtest_v1", config=self.config)
        
        for index, row in data.iterrows():
            # Create KlineData
            kline = KlineData(
                symbol=self.config.get("symbol", "BTCUSDT"),
                interval=self.config.get("interval", "1m"),
                open_time=pd.to_datetime(row[0], unit='ms'), # Open time
                open_price=float(row[1]),
                high_price=float(row[2]),
                low_price=float(row[3]),
                close_price=float(row[4]),
                volume=float(row[5]),
                close_time=pd.to_datetime(row[6], unit='ms'), # Close time
                is_closed=True
            )
            
            current_price = kline.close_price
            
            # 1. Update Portfolio Value (Mark to Market)
            # Long: Value = balance + (pos * current)
            # Short: Value = balance - abs(pos)*current (but cash increased on sell)
            # Replay-style: Equity = balance + position_value
            # Position Value = pos * current
            # If pos is negative (short), it correctly reduces value as current price increases.
            self.portfolio_value = self.balance + (self.position * current_price)
            
            self.history.append({
                "time": kline.close_time,
                "value": self.portfolio_value,
                "price": current_price
            })
            
            # 2. Risk Management (Check SL/TP)
            risk_signal = self._check_risk(current_price)
            if risk_signal:
                self._execute_trade(risk_signal, kline.close_time, "RISK_ENGINE")
            else:
                # 3. Strategy Signal (only if no risk action)
                signal = await strategy.on_tick(kline)
                if signal:
                    self._execute_trade(signal, kline.close_time, "STRATEGY")
                
        return self._generate_report()
    
    def _check_risk(self, current_price: float) -> Optional[Dict]:
        if abs(self.position) < 0.000001:
            return None
            
        pnl_pct = 0.0
        action = ""
        
        if self.position > 0: # Long
            pnl_pct = (current_price - self.avg_entry) / self.avg_entry
            if pnl_pct <= -self.sl_pct:
                action = "SELL"
            elif pnl_pct >= self.tp_pct:
                action = "SELL"
        elif self.position < 0: # Short
            pnl_pct = (self.avg_entry - current_price) / self.avg_entry
            if pnl_pct <= -self.sl_pct:
                action = "BUY"
            elif pnl_pct >= self.tp_pct:
                action = "BUY"
                
        if action:
            return {
                "action": action,
                "price": current_price,
                "reason": "SL" if pnl_pct < 0 else "TP"
            }
        return None

    def _execute_trade(self, signal: Dict, timestamp: datetime, source: str):
        price = signal['price']
        action = signal['action']
        commission = 0.001 # 0.1%
        
        qty = 0.0
        
        if action == "BUY":
            if self.position < -0.000001:
                # Cover Short
                qty = abs(self.position)
                cost = qty * price
                fee = cost * commission
                self.balance -= (cost + fee)
                self.position = 0
                self.avg_entry = 0
            elif abs(self.position) < 0.000001:
                # Open Long
                qty = (self.balance * 0.95) / price
                cost = qty * price
                fee = cost * commission
                self.balance -= (cost + fee)
                self.position = qty
                self.avg_entry = price
                
        elif action == "SELL":
            if self.position > 0.000001:
                # Close Long
                qty = self.position
                revenue = qty * price
                fee = revenue * commission
                self.balance += (revenue - fee)
                self.position = 0
                self.avg_entry = 0
            elif abs(self.position) < 0.000001:
                # Open Short
                qty = (self.balance * 0.95) / price
                revenue = qty * price
                fee = revenue * commission
                self.balance += (revenue - fee)
                self.position = -qty
                self.avg_entry = price

        if qty > 0:
            self.trades.append({
                "time": timestamp,
                "action": action,
                "price": price,
                "qty": qty,
                "source": source,
                "reason": signal.get('reason', 'N/A')
            })

    def _generate_report(self):
        pnl = self.portfolio_value - self.initial_capital
        pnl_pct = (pnl / self.initial_capital) * 100
        
        # Drawdown
        df = pd.DataFrame(self.history)
        df['cummax'] = df['value'].cummax()
        df['drawdown'] = (df['value'] - df['cummax']) / df['cummax']
        max_dd = df['drawdown'].min() * 100
        
        # Volatility & Sharpe
        df['ret'] = df['value'].pct_change()
        sharpe = (df['ret'].mean() / df['ret'].std()) * (525600 ** 0.5) if df['ret'].std() != 0 else 0
        
        report = {
            "initial_capital": self.initial_capital,
            "final_value": self.portfolio_value,
            "total_pnl": pnl,
            "pnl_pct": pnl_pct,
            "max_drawdown": max_dd,
            "sharpe": sharpe,
            "num_trades": len(self.trades),
            "trades": self.trades[-10:], # Last 10 trades for info
            "history": self.history[::max(1, len(self.history)//100)] # Downsampled history (100 pts)
        }
        
        print(f"Backtest Completed. PnL: {pnl_pct:.2f}% | Drawdown: {max_dd:.2f}%")
        return report
