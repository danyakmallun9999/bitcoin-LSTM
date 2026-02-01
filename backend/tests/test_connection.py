import sys
import os

# Add backend directory to path so we can import app modules
sys.path.append(os.path.join(os.path.dirname(__file__), "../"))

from app.services.binance_client import binance_adapter

def test_connectivity():
    print("Testing Binance Connectivity...")
    try:
        # 1. Ping
        binance_adapter.ping()
        print("[OK] Ping successful.")

        # 2. Server Time
        time = binance_adapter.get_server_time()
        print(f"[OK] Server Time: {time['serverTime']}")

        # 3. Get Price
        price = binance_adapter.get_price("BTCUSDT")
        print(f"[OK] BTC Price: {price['price']}")
        
        print("\nSUCCESS: Connection to Binance Public API verified!")
        
    except Exception as e:
        print(f"\n[FAILED] Error connecting to Binance: {e}")
        sys.exit(1)

if __name__ == "__main__":
    test_connectivity()
