import sys
import os
from unittest.mock import MagicMock

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.services.email_service import email_service

print("Testing EmailService functionality...")

mock_db = MagicMock()

class DummyDoc:
    file_name = "Assignment_Unit3.pdf"
    total_pages = 15
    copies = 2
    is_color = False
    is_double_sided = True
    price = 30.0

class DummyOrder:
    id = "a1b2c3d4-e5f6-7890-1234-56789abcdef0"
    grand_total = 30.0
    subtotal = 30.0
    payment_status = "PAID"
    documents = [DummyDoc()]
    created_at = None

print("Testing send_order_placed_email structure:")
email_service.send_order_placed_email(
    db=mock_db,
    order=DummyOrder(),
    student_name="Test Student",
    to_email="test.student@example.com",
    shop_name="Print Hub",
    token_number="R-101"
)

print("Testing send_status_update_email for READY FOR PICKUP:")
email_service.send_status_update_email(
    db=mock_db,
    order_id="a1b2c3d4-e5f6-7890-1234-56789abcdef0",
    student_name="Test Student",
    to_email="test.student@example.com",
    shop_name="Print Hub",
    status="READY",
    token_number="R-101"
)

print("EmailService test setup verified successfully!")
