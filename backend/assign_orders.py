from app.db.database import SessionLocal
from app.models.user import User
from app.models.order import Order
from uuid import UUID

def assign():
    db = SessionLocal()
    target_user_id = UUID('7ade3f95-9e37-4a2e-93ee-6e7219b3f1d2') # AD075
    user = db.query(User).filter(User.id == target_user_id).first()

    if not user:
        print("User AD075 not found.")
        return

    orders = db.query(Order).order_by(Order.created_at.desc()).all()
    print(f"Total orders in DB: {len(orders)}")

    # Assign half of the orders to AD075 so both users have orders
    count = 0
    for idx, order in enumerate(orders):
        if idx % 2 == 0:
            order.student_id = target_user_id
            count += 1

    db.commit()
    print(f"Successfully assigned {count} orders to user {user.register_number} ({user.full_name}).")

    user1_orders = db.query(Order).filter(Order.student_id == target_user_id).count()
    print(f"Current orders count for AD075: {user1_orders}")

    db.close()

if __name__ == "__main__":
    assign()
