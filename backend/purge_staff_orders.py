import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db.database import SessionLocal
from app.models.order import Order
from app.models.order_document import OrderDocument
from app.models.payment import Payment
from app.models.shop_queue import ShopQueue
from app.models.user import User
from app.enums.user_role import UserRole
from app.enums.queue_type import QueueType

def purge_staff_orders():
    db = SessionLocal()

    try:
        # Find staff users
        staff_users = db.query(User).filter(User.role == UserRole.STAFF).all()
        staff_user_ids = [u.id for u in staff_users]

        # Find orders placed by staff users or with token starting with S-
        staff_queues = db.query(ShopQueue).filter(
            (ShopQueue.queue_type == QueueType.SATELLITE) | (ShopQueue.token.like("S-%"))
        ).all()
        staff_queue_order_ids = [q.order_id for q in staff_queues if q.order_id]

        staff_orders = db.query(Order).filter(
            (Order.student_id.in_(staff_user_ids)) if staff_user_ids else False
        ).all()

        staff_order_ids = list(set([o.id for o in staff_orders] + staff_queue_order_ids))

        print(f"Found {len(staff_queues)} staff/S-prefix queue entries.")
        print(f"Found {len(staff_order_ids)} staff orders to purge.")

        if staff_queue_order_ids:
            db.query(ShopQueue).filter(ShopQueue.order_id.in_(staff_queue_order_ids)).delete(synchronize_session=False)

        if staff_order_ids:
            db.query(OrderDocument).filter(OrderDocument.order_id.in_(staff_order_ids)).delete(synchronize_session=False)
            db.query(Payment).filter(Payment.order_id.in_(staff_order_ids)).delete(synchronize_session=False)
            db.query(Order).filter(Order.id.in_(staff_order_ids)).delete(synchronize_session=False)

        db.commit()
        print("=== SUCCESSFULLY PURGED ALL STAFF ORDERS (PREFIX S) ===")

    except Exception as e:
        db.rollback()
        print(f"Error purging staff orders: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    purge_staff_orders()
