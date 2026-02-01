from datetime import datetime
from sqlalchemy import select, asc
from app.db.session import AsyncSessionLocal
from app.db.models import TradeLog, MarketTicket

class TradeExecutor:
    '''
    Service to handle trade execution logic and wallet state calculation.
    '''

    @staticmethod
    async def calculate_wallet_state():
        async with AsyncSessionLocal() as session:
            # 1. Fetch all trades chronological
            stmt = select(TradeLog).order_by(asc(TradeLog.timestamp))
            result = await session.execute(stmt)
            trades = result.scalars().all()
            
            # 2. Replay
            initial_capital = 10000.0
            cash = initial_capital
            position = 0.0
            avg_entry = 0.0
            
            active_position_record = None # To store details of the current open leg
            
            for t in trades:
                if t.side == "BUY":
                    cost = t.price * t.quantity
                    cash -= cost
                    # Avg Entry update (Weighted Average)
                    total_val = (position * avg_entry) + cost
                    position += t.quantity
                    if position > 0:
                        if position > 0:
                            avg_entry = total_val / position
                    
                    # If this flipped us to net long or added to it, track it
                    if position > 0 and active_position_record is None:
                         active_position_record = t 
                         
                elif t.side == "SELL":
                    revenue = t.price * t.quantity
                    cash += revenue
                    position -= t.quantity
                    
                    if position <= 0.000001: # Closed
                        position = 0
                        avg_entry = 0
                        active_position_record = None

            return {
                "cash": cash,
                "position": position,
                "avg_entry": avg_entry,
                "last_trade": active_position_record,
                "initial_capital": initial_capital
            }

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
        
        trade_log = None
        
        async with AsyncSessionLocal() as session:
            if action == 'BUY':
                # Rule: Only BUY if we have NO position (for simplicity)
                # And we have cash
                if state['position'] < 0.000001 and state['cash'] > 10:
                    # Buy with 95% of cash
                    invest_amount = state['cash'] * 0.95
                    quantity = invest_amount / price
                    
                    trade_log = TradeLog(
                        params_id="AUTO_LSTM",
                        symbol=symbol,
                        side="BUY",
                        price=price,
                        quantity=quantity,
                        timestamp=datetime.now(),
                        status="FILLED",
                        binance_order_id=int(datetime.now().timestamp() * 1000)
                    )
                    session.add(trade_log)
                    await session.commit()
                    print(f"AUTO EXECUTED BUY: {quantity} @ {price}")

            elif action == 'SELL':
                # Rule: Only SELL if we HAVE a position
                if state['position'] > 0.000001:
                    # Sell ALL
                    quantity = state['position']
                     
                    trade_log = TradeLog(
                        params_id="AUTO_LSTM",
                        symbol=symbol,
                        side="SELL",
                        price=price,
                        quantity=quantity,
                        timestamp=datetime.now(),
                        status="FILLED",
                        binance_order_id=int(datetime.now().timestamp() * 1000)
                    )
                    session.add(trade_log)
                    await session.commit()
                    print(f"AUTO EXECUTED SELL: {quantity} @ {price}")
                    
        return trade_log
