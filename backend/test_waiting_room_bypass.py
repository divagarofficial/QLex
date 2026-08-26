import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db.base import BaseModel
from app.auth.service import AuthService
from app.auth.schemas import StaffRegisterRequest
from app.enums.user_role import UserRole
from app.models.department import Department
from app.models.user import User
from app.waiting_room.middleware import waiting_room_required
from app.core.security import create_access_token

# In-memory SQLite engine for unit tests
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def test():
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
    import app.models.waiting_room

    BaseModel.metadata.create_all(bind=engine)
    db = TestingSessionLocal()

    try:
        dept = Department(name="Computer Science & Engineering", code="CSE", display_order=1)
        db.add(dept)
        db.commit()

        auth_service = AuthService(db)
        from app.auth.otp_service import _OTP_STORE
        from datetime import datetime, timedelta
        test_email = "teststaff@ritchennai.edu.in"
        _OTP_STORE[test_email] = {
            "code": "123456",
            "expires_at": datetime.utcnow() + timedelta(minutes=10)
        }

        req = StaffRegisterRequest(
            staff_id="STF-WAITING-TEST",
            full_name="Dr. Test Staff",
            phone="9876543210",
            email=test_email,
            otp_code="123456",
            password="password123",
            confirm_password="password123",
            department_id=str(dept.id),
        )
        staff_user = auth_service.register_staff(req)

        token = create_access_token({
            "sub": str(staff_user.id),
            "register_number": staff_user.register_number,
            "role": staff_user.role.value,
        })

        print("Testing waiting_room_required with Staff Bearer token...")
        res = waiting_room_required(
            waiting_room_session=None,
            authorization=f"Bearer {token}",
            db=db,
        )
        print("Waiting Room Check Result:", res)
        assert res is None
        print("\n=== STAFF WAITING ROOM BYPASS TEST PASSED SUCCESSFULLY! ===")
    finally:
        db.close()

if __name__ == "__main__":
    test()
