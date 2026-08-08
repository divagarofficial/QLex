from app.db.database import SessionLocal
from app.settlements.service import SettlementService

def test():
    db = SessionLocal()
    service = SettlementService(db)
    pending = service.get_pending_settlements()
    history = service.get_settlement_history()
    print(f"Pending settlements count: {len(pending)}")
    for p in pending:
        print(f"  [PENDING] ID: {p.id} | Date: {p.settlement_date} | Amount: INR {p.amount} | Status: {p.status}")
    print(f"History settlements count: {len(history)}")
    for h in history:
        print(f"  [COMPLETED] ID: {h.id} | Date: {h.settlement_date} | Amount: INR {h.amount} | Status: {h.status}")
    db.close()

if __name__ == "__main__":
    test()
