import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db.database import SessionLocal
from app.auth.service import AuthService
from app.auth.schemas import StaffRegisterRequest
from app.models.department import Department
from app.models.user import User

def test():
    db = SessionLocal()
    try:
        dept = db.query(Department).first()
        if not dept:
            print("No department found")
            return
        
        print("Testing staff register with department_id:", dept.id)
        service = AuthService(db)

        # Set up OTP in memory store
        from app.auth.otp_service import _OTP_STORE
        from datetime import datetime, timedelta
        test_email = "divagar.240075@aids.ritchennai.edu.in"
        _OTP_STORE[test_email] = {
            "code": "544650",
            "expires_at": datetime.utcnow() + timedelta(minutes=10)
        }

        # Cleanup test staff if exists
        test_staff_id = "STF-TEST-001"
        existing = db.query(User).filter(User.register_number == test_staff_id).first()
        if existing:
            db.delete(existing)
            db.commit()

        req = StaffRegisterRequest(
            staff_id=test_staff_id,
            full_name="Divagar Staff",
            phone="9876543210",
            email=test_email,
            otp_code="544650",
            password="password123",
            confirm_password="password123",
            department_id=str(dept.id),
        )

        res = service.register_staff(req)
        print("Registration Success!", res.id, res.register_number, res.role)
    except Exception as e:
        import traceback
        print("Error caught during register_staff:", e)
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test()
