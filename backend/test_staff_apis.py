"""
Test suite for Staff API endpoints & service layer using SQLite in-memory DB.
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db.base import BaseModel
from app.auth.service import AuthService
from app.orders.service import OrderService
from app.auth.schemas import StaffRegisterRequest
from app.enums.user_role import UserRole
from app.models.department import Department
from app.models.user import User

# In-memory SQLite engine for tests
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def run_tests():
    # Import all models to bind metadata
    import app.models.user
    import app.models.department
    import app.models.year
    import app.models.section
    import app.models.order
    import app.models.order_document
    import app.models.service
    import app.models.pricing
    import app.models.payment
    import app.models.shop_queue
    import app.models.platform_setting

    BaseModel.metadata.create_all(bind=engine)
    db = TestingSessionLocal()

    try:
        auth_service = AuthService(db)
        order_service = OrderService(db)

        # 1. Create Department
        dept = Department(name="Computer Science & Engineering", code="CSE", display_order=1)
        db.add(dept)
        db.commit()
        db.refresh(dept)
        print(f"Created Department: {dept.name} ({dept.id})")

        # 2. Test Staff Registration
        test_staff_id = "STF-2026"
        test_email = "faculty@ritchennai.edu.in"

        from app.auth.otp_service import _OTP_STORE
        from datetime import datetime, timedelta
        _OTP_STORE[test_email] = {
            "code": "123456",
            "expires_at": datetime.utcnow() + timedelta(minutes=10)
        }

        req = StaffRegisterRequest(
            staff_id=test_staff_id,
            full_name="Prof. Divagar",
            phone="9876543210",
            email=test_email,
            otp_code="123456",
            password="password123",
            confirm_password="password123",
            department_id=str(dept.id),
        )
        staff_user = auth_service.register_staff(req)
        print("Registered Staff User:", staff_user.id, staff_user.full_name, staff_user.role)
        assert staff_user.role == UserRole.STAFF
        assert staff_user.year_id is None
        assert staff_user.section_id is None
        print("[OK] Staff registration test passed!")

        # 3. Test Staff Login
        login_res = auth_service.login(test_staff_id, "password123")
        assert "access_token" in login_res
        print("[OK] Staff login test passed!")

        # 4. Test Staff Draft Order Creation (Shop = QLex Satellite Print Hub & Free Total)
        draft = order_service.create_draft(student_id=staff_user.id, is_priority=False)
        print("Staff Draft Order:", draft.id, "Shop:", draft.shop_name, "Grand Total:", draft.grand_total)
        assert getattr(draft, "shop_name", "") == "QLex Satellite Print Hub"
        assert draft.grand_total == 0
        print("[OK] Staff draft creation & shop routing test passed!")

        print("\n=== ALL STAFF BACKEND TESTS PASSED SUCCESSFULLY! ===")
    finally:
        db.close()

if __name__ == "__main__":
    run_tests()
