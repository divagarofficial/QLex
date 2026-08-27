import sys
import os

sys.path.insert(0, os.path.abspath("."))

from app.db.database import SessionLocal, engine
from app.models.user import User
from app.models.order import Order
from app.enums.user_role import UserRole

engine.echo = False

db = SessionLocal()
try:
    staff_users = db.query(User).filter(User.role == UserRole.STAFF).all()
    staff_ids = [u.id for u in staff_users]
    staff_orders = db.query(Order).filter(Order.student_id.in_(staff_ids)).all() if staff_ids else []
    
    total_orders = db.query(Order).count()
    student_users = db.query(User).filter(User.role == UserRole.STUDENT).all()
    student_ids = [u.id for u in student_users]
    student_orders = db.query(Order).filter(Order.student_id.in_(student_ids)).all() if student_ids else []

    print(f"Total Orders in DB: {total_orders}")
    print(f"Total Staff Users: {len(staff_users)}")
    print(f"Total Staff Orders: {len(staff_orders)}")
    print(f"Total Student Orders: {len(student_orders)}")

finally:
    db.close()
