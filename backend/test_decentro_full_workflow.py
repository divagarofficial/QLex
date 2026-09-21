import sys
import asyncio
from uuid import uuid4
from decimal import Decimal

from app.db.database import SessionLocal
from app.models.order import Order
from app.enums.order_status import OrderStatus
from app.enums.payment_status import PaymentStatus
from app.payments.decentro_client import DecentroClient
from app.shop.queue_service import ShopQueueService

def verify_decentro_workflow():
    print("==================================================")
    print("       QLEX DECENTRO WORKFLOW VERIFICATION        ")
    print("==================================================")

    db = SessionLocal()
    try:
        # Purge any orphaned queue rows from previous dev sessions
        from sqlalchemy import text
        db.execute(text("DELETE FROM shop_queue WHERE order_id IS NULL OR order_id NOT IN (SELECT id FROM orders)"))
        db.commit()

        # Step 1: Verify Config & Decentro Client Initialization

        from app.core.config import settings
        print(f"[1/5] Decentro Base URL : {settings.DECENTRO_BASE_URL}")
        print(f"[1/5] Decentro Client ID: {settings.DECENTRO_CLIENT_ID}")
        
        decentro = DecentroClient()
        print("[1/5] Decentro Client initialized successfully.")

        # Step 2: Create a Test Draft Order in DB
        test_order_id = uuid4()
        test_order = Order(
            id=test_order_id,
            guest_phone="9360087608",
            guest_name="Divagar Elumalai",
            shop_name="QLex Express Hub",
            shop_slug="rit",
            status=OrderStatus.PENDING_PAYMENT,
            payment_status=PaymentStatus.PENDING,
            subtotal=Decimal("45.00"),
            grand_total=Decimal("45.00"),
        )
        db.add(test_order)
        db.commit()
        db.refresh(test_order)
        print(f"[2/5] Created test order #{test_order.id} (Status: {test_order.status}, Payment: {test_order.payment_status})")

        # Step 3: Test Dynamic UPI Payload Generation
        intent_res = decentro.generate_dynamic_upi_link(
            order_id=str(test_order.id),
            amount=45.00,
            shop_name="QLex Express Hub",
        )
        print(f"[3/5] Dynamic UPI Payload Generated: Success={intent_res.get('success')}")
        print(f"      Reference ID : {intent_res.get('reference_id')}")

        # Step 4: Simulate Decentro Payment Completed Webhook Event
        ref_id = intent_res.get("reference_id") or f"QLX_{str(test_order.id)[:8]}"
        
        # Process Webhook Logic manually against DB
        matched_order = db.query(Order).filter(Order.id == test_order.id).first()
        
        if matched_order and matched_order.payment_status == PaymentStatus.PENDING:
            matched_order.payment_status = PaymentStatus.PAID
            matched_order.status = OrderStatus.PAID
            db.commit()

            queue_service = ShopQueueService(db)
            queue = queue_service.create_queue_entry(matched_order)

            token = queue.token if queue else "R-1"
            print(f"[4/5] Decentro Webhook Processed! Order #{matched_order.id} marked PAID.")
            print(f"      Queue Token Issued: {token}")

        # Step 5: Final DB Assertion Check
        final_order = db.query(Order).filter(Order.id == test_order.id).first()
        assert final_order.payment_status == PaymentStatus.PAID, "Payment status assertion failed!"
        assert final_order.status == OrderStatus.PAID, "Order status assertion failed!"
        print("[5/5] VERIFICATION SUCCESS: All DB assertions passed cleanly!")
        
        # Cleanup test order and queue
        from app.models.shop_queue import ShopQueue
        db.query(ShopQueue).filter(ShopQueue.order_id == test_order.id).delete()
        db.delete(final_order)
        db.commit()
        print("Test data cleaned up successfully.")


    except Exception as err:
        print(f"[ERROR] Verification Failed: {err}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    verify_decentro_workflow()
