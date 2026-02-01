import sys
import os
import asyncio
from datetime import datetime

# Add backend directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), "../"))

from app.db.session import AsyncSessionLocal
from app.db.models import MarketTicket

async def test_db_insertion():
    print("Testing Database Insertion...")
    async with AsyncSessionLocal() as session:
        try:
            # Create a dummy ticket
            ticket = MarketTicket(
                time=datetime.utcnow(),
                symbol="BTCUSDT",
                price=50000.0,
                volume=1.5
            )
            session.add(ticket)
            await session.commit()
            print("[OK] Inserted Dummy Ticket.")
            
            # Read back
            # Note: In real app we would use select()
            print("[OK] Connection verified!")
            
        except Exception as e:
            print(f"[FAILED] Database Error: {e}")
            await session.rollback()

if __name__ == "__main__":
    asyncio.run(test_db_insertion())
