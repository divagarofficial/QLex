from app.db.database import SessionLocal
from app.models.user import User
from app.models.order import Order

def check():
    db = SessionLocal()
    users = db.query(User).all()
    print("--- ALL USERS IN DB ---")
    for u in users:
        order_count = db.query(Order).filter(Order.student_id == u.id).count()
        print(f"User ID: {u.id} | Register#: {u.register_number} | Full Name: {u.full_name} | Orders Count: {order_count}")
    
    print("\n--- ORDERS NOT MATCHING ANY USER ---")
    user_ids = [u.id for u in users]
    unmatched_orders = db.query(Order).filter(Order.student_id.notin_(user_ids)).all()
    print(f"Unmatched orders count: {len(unmatched_orders)}")

    if unmatched_orders:
        for o in unmatched_orders:
            print(f"Order ID: {o.id} | student_id: {o.student_id} | status: {o.status.value}")

    db.close()

if __name__ == "__main__":
    check()
