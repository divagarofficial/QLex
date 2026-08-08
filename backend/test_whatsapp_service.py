import sys
import os
from unittest.mock import MagicMock

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.services.whatsapp_service import whatsapp_service

print("Testing WhatsAppService message formatting...")

# Mock db & order
mock_db = MagicMock()
mock_db.query().first.return_value = None

class DummyDoc:
    file_name = "Assignment_Unit3.pdf"
    total_pages = 15
    copies = 2
    is_color = False
    is_double_sided = True
    price = 30.0

class DummyOrder:
    id = "a1b2c3d4-e5f6-7890-1234-56789abcdef0"
    total_amount = 30.0
    payment_status = "PAID"
    documents = [DummyDoc()]

# Test receipt message construction
try:
    print("Testing send_order_placed_receipt call & PDF generation:")
    from app.utils.receipt_generator import generate_order_receipt_pdf
    pdf_path = generate_order_receipt_pdf(DummyOrder(), token_number="A-102")
    print(f"Receipt PDF generated successfully at: {pdf_path}")
except Exception as e:
    print(f"Error in receipt test: {e}")

# Test status update construction
try:
    print("Testing send_status_update call for PRINTING & READY:")
    whatsapp_service.send_status_update(
        db=mock_db,
        order_id="a1b2c3d4-e5f6-7890-1234-56789abcdef0",
        student_name="Rahul Sharma",
        phone="919876543210",
        shop_name="Central Library Print Shop",
        status="PRINTING"
    )
    whatsapp_service.send_status_update(
        db=mock_db,
        order_id="a1b2c3d4-e5f6-7890-1234-56789abcdef0",
        student_name="Rahul Sharma",
        phone="919876543210",
        shop_name="Central Library Print Shop",
        status="READY",
        token_number="A-102"
    )
    print("Status update test completed successfully!")
except Exception as e:
    print(f"Error in status update test: {e}")
