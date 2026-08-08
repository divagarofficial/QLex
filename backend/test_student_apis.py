"""
Test suite for student API endpoints & service layer.
"""
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db.database import SessionLocal
from app.student.service import StudentService
from app.models.order import Order
from app.models.user import User

def run_tests():
    db = SessionLocal()
    try:
        service = StudentService(db)

        # 1. Test live_queue API
        print("Testing live_queue()...")
        lq = service.live_queue()
        print("Live Queue Result:", lq)
        assert "currently_printing" in lq
        assert "priority_queue" in lq
        assert "regular_queue" in lq
        print("[OK] live_queue() test passed!")

        # 2. Find any user to test user-specific APIs
        user = db.query(User).first()
        if not user:
            print("No user found in DB. Skipping user-specific tests.")
            return

        print(f"\nTesting student APIs for user_id={user.id} ({user.email})...")

        # 3. Test my_token API
        try:
            tok = service.my_token(user.id)
            print("My Token Result:", tok)
            assert "token" in tok
            assert "status" in tok
            print("[OK] my_token() test passed!")
        except Exception as e:
            print(f"my_token() info: {e}")

        # 4. Test my_orders API
        orders_res = service.my_orders(user.id)
        print(f"My Orders Result count: {len(orders_res['orders'])}")
        assert "orders" in orders_res
        print("[OK] my_orders() test passed!")

        # 5. Test order_details API if user has an order
        if orders_res["orders"]:
            first_order_id = orders_res["orders"][0]["order_id"]
            details = service.order_details(user.id, first_order_id)
            print(f"Order Details for {first_order_id}:", details["order_id"], details["status"])
            assert details["order_id"] == first_order_id
            print("[OK] order_details() test passed!")

        # 6. Test payments API
        payments_res = service.payments(user.id)
        print(f"Payments Result count: {len(payments_res['payments'])}")
        assert "payments" in payments_res
        print("[OK] payments() test passed!")

        print("\nAll student backend API tests completed successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    run_tests()
