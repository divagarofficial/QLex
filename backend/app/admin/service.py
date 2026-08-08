from sqlalchemy.orm import Session

from .repository import AdminRepository
from datetime import datetime


class AdminService:

    def __init__(
        self,
        db: Session,
    ):
        self.repository = AdminRepository(db)

    def dashboard(self):

        return {

            "today_orders":
                self.repository.today_orders(),

            "today_revenue":
                self.repository.today_revenue(),

            "waiting_orders":
                self.repository.waiting_orders(),

            "printing_orders":
                self.repository.printing_orders(),

            "ready_orders":
                self.repository.ready_orders(),

            "served_orders":
                self.repository.served_orders(),

            "waiting_room_students":
                self.repository.waiting_room_students(),

            "active_sessions":
                self.repository.active_sessions(),

            "server_status":
                "HEALTHY",
        }
    
    def today_revenue(self):

        return self.repository.today_revenue_details()
    
    def month_revenue(self):

        return self.repository.month_revenue_details()
    
    def revenue_history(self):

        return self.repository.revenue_history()
    
    def settlements(self):

        return {

            "settlements":

            self.repository.get_all_settlements()

        }


    def settlement(
        self,
        settlement_id,
    ):

        return (

            self.repository.get_settlement(
                settlement_id
            )

        )
    
    def complete_settlement(
    self,
    settlement_id,
    request,
):

        settlement = (
            self.repository.get_settlement(
                settlement_id
            )
        )

        if settlement is None:

            raise ValueError(
                "Settlement not found."
            )

        return self.repository.complete_settlement(
            settlement,
            request,
        )
    
    def generate_settlement(
    self,
):

        settlement = (
            self.repository.generate_settlement()
        )

        if settlement is None:

            raise ValueError(
                "No paid orders available for settlement."
            )

        return settlement
    
    def queue_monitor(self):

        return self.repository.queue_monitor()
    
   

    def server_health(
        self,
    ):

        return {

            "status": "HEALTHY",

            "database": "CONNECTED",

            "timestamp": datetime.utcnow(),

        }

    def overview(self):
        today_rev_details = self.repository.today_revenue_details()
        month_rev_details = self.repository.month_revenue_details()
        settlements = self.repository.get_all_settlements()

        pending_settlements = [s for s in settlements if s.status.lower() == "pending"]
        pending_amount = sum((s.amount for s in pending_settlements), 0)

        waiting = self.repository.waiting_orders()
        printing = self.repository.printing_orders()
        ready = self.repository.ready_orders()

        return {
            "total_students": self.repository.total_students_count(),
            "registered_shops": self.repository.registered_shops_count(),
            "today_orders": self.repository.today_orders(),
            "active_orders": waiting + printing + ready,
            "completed_orders_today": self.repository.served_orders(),
            "platform_revenue_today": today_rev_details["total_revenue"],
            "platform_revenue_month": month_rev_details["total_revenue"],
            "pending_settlements_amount": pending_amount,
            "pending_settlements_count": len(pending_settlements),
        }

    def recent_orders(self, limit: int = 10):
        return self.repository.recent_orders(limit=limit)

    def recent_payments(self, limit: int = 10):
        return self.repository.recent_payments(limit=limit)

    def shops(self):
        return self.repository.admin_shops()

    def notifications(self):
        return self.repository.admin_notifications()

    def students_overview(self):
        return self.repository.students_overview()

    def students_list(
        self,
        search: str | None = None,
        department_id: str | None = None,
        year_id: str | None = None,
        status: str | None = None,
        order_status: str | None = None,
        sort_by: str | None = "newest",
        page: int = 1,
        page_size: int = 12,
    ):
        return self.repository.students_list(
            search=search,
            department_id=department_id,
            year_id=year_id,
            status=status,
            order_status=order_status,
            sort_by=sort_by,
            page=page,
            page_size=page_size,
        )

    def student_by_id(self, student_id: UUID):
        student = self.repository.get_student_by_id(student_id)
        if not student:
            raise ValueError("Student not found")
        return student

    def toggle_student_status(self, student_id: UUID, is_active: bool | None = None):
        student = self.repository.toggle_student_status(student_id, is_active=is_active)
        if not student:
            raise ValueError("Student not found")
        return student



                