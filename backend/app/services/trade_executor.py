from datetime import datetime
from sqlalchemy import select, asc
from app.db.session import AsyncSessionLocal
from app.db.models import TradeLog, MarketTicket

class TradeExecutor:
    '''
    Service to handle trade execution logic and wallet state calculation.
    Supports Long, Short, and Risk Management.
    '''

    @staticmethod
    async def calculate_wallet_state():
        from app.services.binance_client import binance_adapter
        from app.core.config import settings

        # 1. Fetch Local Simulation from Trades
        async with AsyncSessionLocal() as session:
            stmt = select(TradeLog).order_by(asc(TradeLog.timestamp))
            result = await session.execute(stmt)
            trades = result.scalars().all()
            
            initial_capital = 10000.0
            cash = initial_capital
            position = 0.0
            avg_entry = 0.0
            active_position_record = None
            
            for t in trades:
                if t.side == "BUY":
                    cost = t.price * t.quantity
                    cash -= cost
                    
                    if position >= 0:
                        # Adding to Long or Opening Long
                        total_val = (position * avg_entry) + cost
                        position += t.quantity
                        if position > 0:
                            avg_entry = total_val / position
                            if active_position_record is None:
                                active_position_record = t
                    else:
                        # Covering Short
                        # Realized PnL is captured in the cash flow above (cash -= cost)
                        # We just reduce the negative position
                        position += t.quantity
                        if position >= -0.000001:
                            position = 0
                            avg_entry = 0
                            active_position_record = None
                         
                elif t.side == "SELL":
                    revenue = t.price * t.quantity
                    cash += revenue
                    
                    if position <= 0:
                        # Adding to Short or Opening Short
                        # For Short, Avg Entry is Weighted Avg of Sell Prices
                        total_val = (abs(position) * avg_entry) + revenue
                        position -= t.quantity # Moves further negative
                        if abs(position) > 0:
                            avg_entry = total_val / abs(position)
                            if active_position_record is None:
                                active_position_record = t
                    else:
                        # Closing Long
                        position -= t.quantity
                        if position <= 0.000001:
                            position = 0
                            avg_entry = 0
                            active_position_record = None

            # 2. If API Key is present and enabled, OVERRIDE with real Exchange data
            if settings.BINANCE_API_KEY and (settings.REAL_TRADING_ENABLED or settings.BINANCE_TESTNET):
                try:
                    acc = binance_adapter.get_account()
                    # Find USDT balance
                    usdt_balance = next((float(b['free']) for b in acc['balances'] if b['asset'] == 'USDT'), 0.0)
                    # Find BTC position (or current active pair)
                    # For simplicity, we assume BTC for now, but should use config.active_pair
                    base_asset = settings.active_pair.replace("USDT", "") if hasattr(settings, 'active_pair') else "BTC"
                    real_position = next((float(b['free']) for b in acc['balances'] if b['asset'] == base_asset), 0.0)
                    
                    # Replace local simulation with real data
                    # Note: We keep local avg_entry for PnL tracking if possible, 
                    # but if local trades don't match, it might be off.
                    return {
                        "cash": usdt_balance,
                        "position": real_position,
                        "avg_entry": avg_entry, # Keep local calculation for now
                        "last_trade": active_position_record,
                        "initial_capital": initial_capital,
                        "is_real": True
                    }
                except Exception as e:
                    print(f"Failed to fetch real balance: {e}")

            return {
                "cash": cash,
                "position": position,
                "avg_entry": avg_entry,
                "last_trade": active_position_record,
                "initial_capital": initial_capital,
                "is_real": False
            }

    @staticmethod
    async def check_risk_management(current_price: float, symbol: str):
        """
        Evaluate if we need to Force Close based on SL/TP.
        """
        state = await TradeExecutor.calculate_wallet_state()
        pos = state['position']
        avg_entry = state['avg_entry']
        
        if abs(pos) < 0.000001:
            return None
        
        # Load Config
        from app.db.models import SystemConfig
        async with AsyncSessionLocal() as session:
            result = await session.execute(select(SystemConfig).where(SystemConfig.id == 1))
            config = result.scalar_one_or_none()
            sl_pct = (config.sl_percent if config else 2.0) / 100
            tp_pct = (config.tp_percent if config else 4.0) / 100
            
        pnl_pct = 0.0
        reason = ""
        action = ""
        
        if pos > 0: # Long
            pnl_pct = (current_price - avg_entry) / avg_entry
            if pnl_pct <= -sl_pct:
                reason = f"STOP_LOSS (Entry: {avg_entry:.2f}, Curr: {current_price:.2f}, PnL: {pnl_pct*100:.2f}%)"
                action = "SELL"
            elif pnl_pct >= tp_pct:
                reason = f"TAKE_PROFIT (Entry: {avg_entry:.2f}, Curr: {current_price:.2f}, PnL: {pnl_pct*100:.2f}%)"
                action = "SELL"
                
        elif pos < 0: # Short
            # Short PnL: Entry - Current (Profit if Current < Entry)
            pnl_pct = (avg_entry - current_price) / avg_entry
            if pnl_pct <= -sl_pct:
                 reason = f"STOP_LOSS (Entry: {avg_entry:.2f}, Curr: {current_price:.2f}, PnL: {pnl_pct*100:.2f}%)"
                 action = "BUY" # Buy to Cover
            elif pnl_pct >= tp_pct:
                 reason = f"TAKE_PROFIT (Entry: {avg_entry:.2f}, Curr: {current_price:.2f}, PnL: {pnl_pct*100:.2f}%)"
                 action = "BUY" # Buy to Cover
        
        if action:
            print(f"RISK TRIGGER: {reason}")
            signal = {
                "action": action,
                "symbol": symbol,
                "price": current_price,
                "reason": reason
            }
            return await TradeExecutor.execute_signal(signal)
            
        return None

    @staticmethod
    async def execute_signal(signal: dict):
        '''
        Executes a trade based on the signal and current wallet state.
        Returns the executed trade log or None if invalid.
        '''
        state = await TradeExecutor.calculate_wallet_state()
        
        symbol = signal['symbol']
        price = signal['price']
        action = signal['action']
        reason = signal.get("reason", "AUTO_STRATEGY")
        
        trade_log = None
        
        async with AsyncSessionLocal() as session:
            
            # Logic Update for Long/Short Support
            qty_to_trade = 0.0
            
            if action == 'BUY':
                # Scenarios:
                # 1. We are Short (Position < 0) -> COVER (Buy to Close)
                # 2. We are Flat (Position == 0) -> OPEN LONG
                
                if state['position'] < -0.000001:
                    # Cover Short: Buy full short amount
                    qty_to_trade = abs(state['position'])
                    print(f"COVERING SHORT: {qty_to_trade}")
                elif abs(state['position']) < 0.000001:
                    # Open Long: Use 95% Cash
                    if state['cash'] > 10:
                        qty_to_trade = (state['cash'] * 0.95) / price
                        print(f"OPENING LONG: {qty_to_trade}")
                        
            elif action == 'SELL':
                # Scenarios:
                # 1. We are Long (Position > 0) -> SELL (Close Long)
                # 2. We are Flat (Position == 0) -> OPEN SHORT (Sell Short)
                
                if state['position'] > 0.000001:
                    # Close Long
                    qty_to_trade = state['position']
                    print(f"CLOSING LONG: {qty_to_trade}")
                elif abs(state['position']) < 0.000001:
                    # Open Short
                    # Use 95% of Cash (Margin-like logic for simplicity in Paper Trading)
                    # In real Binance Margin, we borrow. Here we just track cash.
                    if state['cash'] > 10:
                        qty_to_trade = (state['cash'] * 0.95) / price
                        print(f"OPENING SHORT: {qty_to_trade}")

            if qty_to_trade > 0:
                trade_log = TradeLog(
                    params_id="AUTO_LSTM",
                    symbol=symbol,
                    side=action,
                    price=price,
                    quantity=qty_to_trade,
                    timestamp=datetime.now(),
                    status="FILLED",
                    binance_order_id=int(datetime.now().timestamp() * 1000)
                )
                session.add(trade_log)
                await session.commit()
                
                # Check Real Execution
                from app.core.config import settings
                if settings.REAL_TRADING_ENABLED:
                    try:
                        from app.services.binance_client import binance_adapter
                        print(f"[{symbol}] SENDING REAL ORDER TO BINANCE: {action} {qty_to_trade:.4f}")
                        resp = binance_adapter.create_order(symbol, action, qty_to_trade)
                        if resp and 'orderId' in resp:
                            trade_log.binance_order_id = resp['orderId']
                            session.add(trade_log)
                            await session.commit()
                            print(f"[{symbol}] REAL ORDER SUCCESS. ID: {resp['orderId']}")
                    except Exception as e:
                        print(f"REAL ORDER FAILED: {e}")

                print(f"EXECUTED {action}: {qty_to_trade:.4f} @ {price} ({reason})")
                    
        return trade_log
