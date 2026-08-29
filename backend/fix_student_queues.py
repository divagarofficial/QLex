import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db.database import SessionLocal
from app.models.order import Order
from app.models.user import User
from app.models.shop_queue import ShopQueue
from app.enums.user_role import UserRole
from app.enums.queue_type import QueueType
from app.shop.queue_counter_service import QueueCounterService

def fix_queues():
    db = SessionLocal()
    counter_service = QueueCounterService(db)

    try:
        # 1. Update all student orders shop_name to 'QLex Central Print Hub'
        student_users = db.query(User).filter(User.role != UserRole.STAFF).all()
        student_user_ids = [u.id for u in student_users]

        student_orders = db.query(Order).filter(Order.student_id.in_(student_user_ids)).all()
        print(f"Found {len(student_orders)} student orders in database.")

        updated_orders_count = 0
        for order in student_orders:
            if order.shop_name != "QLex Central Print Hub":
                order.shop_name = "QLex Central Print Hub"
                updated_orders_count += 1

        print(f"Updated {updated_orders_count} student orders to 'QLex Central Print Hub'.")

        # 2. Fix queue entries for student orders that incorrectly had S- tokens or QueueType.SATELLITE
        student_queues = db.query(ShopQueue).join(Order, ShopQueue.order_id == Order.id).filter(
            Order.student_id.in_(student_user_ids),
            (ShopQueue.queue_type == QueueType.SATELLITE) | (ShopQueue.token.like("S-%"))
        ).all()

        print(f"Found {len(student_queues)} student queue entries needing token re-assignment.")

        for q in student_queues:
            order = q.order
            if getattr(order, "is_priority", False):
                new_q_type = QueueType.PRIORITY
                num = counter_service.next_number(QueueType.PRIORITY)
                new_token = f"P-{num}"
            else:
                new_q_type = QueueType.REGULAR
                num = counter_service.next_number(QueueType.REGULAR)
                new_token = f"R-{num}"

            print(f"Re-assigning Order {order.id}: Old Token '{q.token}' -> New Token '{new_token}' (Type: {new_q_type})")
            q.queue_type = new_q_type
            q.queue_number = num
            q.token = new_token

        db.commit()
        print("=== SUCCESSFULLY REPAIRED ALL STUDENT ORDERS & QUEUES IN DB ===")

    except Exception as e:
        db.rollback()
        print(f"Error during queue fix: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    fix_queues()
