from app.db.database import SessionLocal
from app.settlements.service import SettlementService

def test():
    try:
        db = SessionLocal()
        service = SettlementService(db)
        pending = service.get_pending_settlements()
        history = service.get_settlement_history()
        print(f"Pending settlements count: {len(pending)}")
        print(f"History settlements count: {len(history)}")
        db.close()
    except Exception as e:
        print("Database connection offline during test run:", e)

if __name__ == "__main__":
    test()

