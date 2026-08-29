import sys
import os
from decimal import Decimal
from uuid import uuid4

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db.database import SessionLocal
from app.models.user import User
from app.models.order import Order
from app.models.order_document import OrderDocument
from app.models.shop_queue import ShopQueue
from app.enums.user_role import UserRole
from app.enums.order_status import OrderStatus
from app.enums.payment_status import PaymentStatus
from app.enums.print_type import PrintType
from app.enums.paper_size import PaperSize
from app.enums.print_side import PrintSide

from app.orders.service import OrderService
from app.shop.service import ShopService

def verify_end_to_end():
    db = SessionLocal()
    order_service = OrderService(db)
    shop_service = ShopService(db)

    print("==================================================")
    print("      STARTING END-TO-END WORKFLOW VERIFICATION   ")
    print("==================================================")

    # 1. Ensure a Student User exists
    student = db.query(User).filter(User.role == UserRole.STUDENT).first()
    if not student:
        student = User(
            id=uuid4(),
            full_name="E2E Student Test User",
            email="e2e_student@ritchennai.edu.in",
            register_number="E2E-STU-001",
            role=UserRole.STUDENT,
        )
        db.add(student)
        db.commit()
        db.refresh(student)

    print(f"\n[1] Student User: {student.full_name} ({student.register_number}) | Role: {student.role}")

    # 2. Create Draft Order for Student
    student_order = order_service.create_draft(student_id=student.id, is_priority=False)
    print(f"[2] Draft Order Created: ID={student_order.id} | ShopName={student_order.shop_name}")
    assert student_order.shop_name == "QLex Central Print Hub", "Student order default shop MUST be Central Print Hub"

    # Add a mock document to the draft order
    doc = OrderDocument(
        id=uuid4(),
        order_id=student_order.id,
        original_filename="E2E_Test_Notes.pdf",
        stored_filename="e2e_test_notes_stored.pdf",
        storage_path="uploads/drafts/e2e_test_notes_stored.pdf",
        mime_type="application/pdf",
        file_size=1024,
        page_count=5,
        copies=1,
        print_type=PrintType.BLACK_WHITE,
        paper_size=PaperSize.A4,
        print_side=PrintSide.SINGLE,
        shop_price_per_page=Decimal("1.50"),
        document_total=Decimal("7.50")
    )
    db.add(doc)
    student_order.subtotal = Decimal("7.50")
    student_order.grand_total = Decimal("7.50")
    db.commit()

    # Confirm Order & Simulate Payment
    confirmed = order_service.confirm_order(student_order.id, is_priority=False)
    student_order.payment_status = PaymentStatus.PAID
    student_order.status = OrderStatus.PAID
    db.commit()
    print(f"[3] Student Order Confirmed & Paid: Status={student_order.status} | Payment={student_order.payment_status}")

    # 3. Test Queue Routing for Central Print Hub vs Satellite Print Hub
    central_jobs = shop_service.get_pending_print_jobs("QLex Central Print Hub")
    satellite_jobs = shop_service.get_pending_print_jobs("QLex Satellite Print Hub")

    central_order_ids = [str(j["order_id"]) for j in central_jobs]
    satellite_order_ids = [str(j["order_id"]) for j in satellite_jobs]

    print(f"\n[4] Central Print Hub Pending Queue Count: {len(central_jobs)}")
    print(f"    Satellite Print Hub Pending Queue Count: {len(satellite_jobs)}")

    # VERIFY STUDENT ORDER IS IN CENTRAL HUB AND NOT IN SATELLITE HUB
    assert str(student_order.id) in central_order_ids, "Student order MUST appear in Central Print Hub queue"
    assert str(student_order.id) not in satellite_order_ids, "Student order MUST NOT appear in Satellite Print Hub queue"

    matching_central_job = next(j for j in central_jobs if str(j["order_id"]) == str(student_order.id))
    student_token = matching_central_job["token"]
    print(f"[5] Student Token Verification: Token='{student_token}' | Is Priority={matching_central_job['is_priority']}")
    assert student_token.startswith("R-") or student_token.startswith("P-"), f"Student token MUST be R- or P-, got '{student_token}'"
    print("    >>> STUDENT ORDER ROUTING VERIFIED SUCCESSFULLY! <<<")

    # 4. Simulate Print Agent Job Lifecycle (PRINTING -> COMPLETED)
    print("\n[6] Simulating Print Agent Daemon Execution...")
    shop_service.update_print_job_status(
        order_id=student_order.id,
        status="PRINTING",
        assigned_printer="E2E Test Spooler"
    )
    db.refresh(student_order)
    print(f"    Status after PRINTING update: Order Status = {student_order.status}")
    assert student_order.status == OrderStatus.PRINTING

    shop_service.update_print_job_status(
        order_id=student_order.id,
        status="COMPLETED",
        assigned_printer="E2E Test Spooler"
    )
    db.refresh(student_order)
    print(f"    Status after COMPLETED update: Order Status = {student_order.status}")
    assert student_order.status == OrderStatus.READY_FOR_PICKUP
    print("    >>> PRINT AGENT JOB LIFECYCLE VERIFIED SUCCESSFULLY! <<<")

    # 5. Ensure a Staff User exists & test Staff Workflow
    staff = db.query(User).filter(User.role == UserRole.STAFF).first()
    if not staff:
        staff = User(
            id=uuid4(),
            full_name="E2E Staff Test User",
            email="e2e_staff@ritchennai.edu.in",
            register_number="STF-E2E-001",
            role=UserRole.STAFF,
        )
        db.add(staff)
        db.commit()
        db.refresh(staff)

    print(f"\n[7] Staff User: {staff.full_name} ({staff.register_number}) | Role: {staff.role}")
    staff_order = order_service.create_draft(student_id=staff.id, is_priority=False)
    doc_staff = OrderDocument(
        id=uuid4(),
        order_id=staff_order.id,
        original_filename="Staff_Exam_Paper.pdf",
        stored_filename="staff_exam_paper_stored.pdf",
        storage_path="uploads/drafts/staff_exam_paper_stored.pdf",
        mime_type="application/pdf",
        file_size=2048,
        page_count=10,
        copies=2,
        print_type=PrintType.BLACK_WHITE,
        paper_size=PaperSize.A4,
        print_side=PrintSide.DOUBLE,
        shop_price_per_page=Decimal("0.00"),
        document_total=Decimal("0.00")
    )
    db.add(doc_staff)
    db.commit()

    order_service.submit_staff_order(order_id=staff_order.id, user_id=staff.id)
    print(f"[8] Staff Order Submitted: ID={staff_order.id} | ShopName={staff_order.shop_name}")

    sat_jobs_after = shop_service.get_pending_print_jobs("QLex Satellite Print Hub")
    cen_jobs_after = shop_service.get_pending_print_jobs("QLex Central Print Hub")

    sat_ids = [str(j["order_id"]) for j in sat_jobs_after]
    cen_ids = [str(j["order_id"]) for j in cen_jobs_after]

    assert str(staff_order.id) in sat_ids, "Staff order MUST appear in Satellite Print Hub queue"
    assert str(staff_order.id) not in cen_ids, "Staff order MUST NOT appear in Central Print Hub queue"

    matching_sat_job = next(j for j in sat_jobs_after if str(j["order_id"]) == str(staff_order.id))
    staff_token = matching_sat_job["token"]
    print(f"[9] Staff Token Verification: Token='{staff_token}'")
    assert staff_token.startswith("S-"), f"Staff token MUST start with S-, got '{staff_token}'"
    print("    >>> STAFF ORDER ROUTING VERIFIED SUCCESSFULLY! <<<")

    # Clean up test orders from DB
    db.close()
    db = SessionLocal()
    db.query(ShopQueue).filter(ShopQueue.order_id.in_([student_order.id, staff_order.id])).delete(synchronize_session=False)
    db.query(OrderDocument).filter(OrderDocument.order_id.in_([student_order.id, staff_order.id])).delete(synchronize_session=False)
    db.query(Order).filter(Order.id.in_([student_order.id, staff_order.id])).delete(synchronize_session=False)
    db.commit()
    db.close()

    print("\n==================================================")
    print("  ALL END-TO-END VERIFICATION TESTS PASSED 100%!  ")
    print("==================================================")

if __name__ == "__main__":
    verify_end_to_end()
