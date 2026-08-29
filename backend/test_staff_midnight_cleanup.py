import sys
import os
from datetime import date, timedelta, datetime
from uuid import uuid4
from decimal import Decimal

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db.database import SessionLocal
from app.models.user import User
from app.models.order import Order
from app.models.shop_queue import ShopQueue
from app.enums.user_role import UserRole
from app.enums.order_status import OrderStatus
from app.enums.payment_status import PaymentStatus
from app.enums.queue_type import QueueType
from app.enums.queue_state import QueueState

from app.shop.queue_service import ShopQueueService
from app.shop.service import ShopService

def test_staff_midnight_cleanup():
    db = SessionLocal()
    queue_service = ShopQueueService(db)
    shop_service = ShopService(db)

    print("==================================================")
    print("   TESTING STAFF QUEUE MIDNIGHT 12 AM CLEANUP     ")
    print("==================================================")

    # 1. Ensure a Staff user exists
    staff = db.query(User).filter(User.role == UserRole.STAFF).first()
    if not staff:
        staff = User(
            id=uuid4(),
            full_name="Midnight Cleanup Staff",
            email="midnight_staff@ritchennai.edu.in",
            register_number="STF-MIDNIGHT-01",
            role=UserRole.STAFF,
        )
        db.add(staff)
        db.commit()

    # 2. Simulate a Staff Order created YESTERDAY (queue_date < today)
    yesterday_dt = datetime.utcnow() - timedelta(days=1)
    yesterday = yesterday_dt.date()
    past_order = Order(
        id=uuid4(),
        student_id=staff.id,
        shop_name="QLex Satellite Print Hub",
        status=OrderStatus.PAID,
        payment_status=PaymentStatus.PAID,
        is_priority=False,
        subtotal=Decimal("0.00"),
        grand_total=Decimal("0.00"),
        created_at=yesterday_dt
    )
    db.add(past_order)
    db.commit()

    past_queue = ShopQueue(
        id=uuid4(),
        order_id=past_order.id,
        queue_date=yesterday,
        queue_type=QueueType.SATELLITE,
        queue_number=99,
        token="S-99",
        queue_state=QueueState.WAITING,
        is_current=False
    )
    db.add(past_queue)
    db.commit()

    past_queue_id = past_queue.id
    past_order_id = past_order.id
    print(f"\n[1] Created Yesterday's Staff Order: ID={past_order_id} | Token={past_queue.token} | QueueDate={past_queue.queue_date}")

    # 3. Verify Satellite Pending Jobs BEFORE Cleanup (or before date check)
    sat_jobs_before = shop_service.get_pending_print_jobs("QLex Satellite Print Hub")
    sat_job_ids_before = [str(j["order_id"]) for j in sat_jobs_before]
    print(f"[2] Satellite Pending Jobs Count for Today: {len(sat_jobs_before)}")

    # 4. Trigger Midnight (12 AM) Queue Cleanup...
    print("\n[3] Triggering Midnight (12 AM) Queue Cleanup...")
    db.close()
    queue_service = ShopQueueService(SessionLocal())
    queue_service.cleanup_previous_days_queue()

    # 5. Verify Yesterday's Staff Queue Entry Vanished Completely
    verify_db = SessionLocal()
    deleted_queue = verify_db.query(ShopQueue).filter(ShopQueue.id == past_queue_id).first()
    past_order_refreshed = verify_db.query(Order).filter(Order.id == past_order_id).first()

    print(f"[4] After Cleanup: Past Staff Queue Entry exists in DB? {deleted_queue is not None}")
    print(f"    After Cleanup: Past Staff Order Status = {getattr(past_order_refreshed, 'status', None)}")

    assert deleted_queue is None, "Staff queue entry from previous day MUST vanish completely at 12 AM!"
    assert past_order_refreshed.status == OrderStatus.EXPIRED, "Unprinted staff order from previous day MUST be marked EXPIRED at 12 AM!"

    print("\n    >>> STAFF MIDNIGHT CLEANUP VERIFIED 100% SUCCESSFULLY! <<<")

    # Clean up test records
    verify_db.query(Order).filter(Order.id == past_order_id).delete(synchronize_session=False)
    verify_db.commit()
    verify_db.close()

if __name__ == "__main__":
    test_staff_midnight_cleanup()
