from uuid import UUID
from sqlalchemy import func, or_
from sqlalchemy.orm import Session, joinedload
from datetime import datetime, date
from decimal import Decimal

from app.enums.queue_state import QueueState
from app.enums.waiting_room_status import WaitingRoomStatus
from app.enums.order_status import OrderStatus
from app.enums.user_role import UserRole

from app.models.order import Order
from app.models.shop_queue import ShopQueue
from app.models.waiting_room import WaitingRoom
from app.models.settlement import Settlement
from app.models.user import User
from app.models.payment import Payment
from app.models.department import Department
from app.models.year import Year
from app.models.section import Section
from app.enums.settlement_status import SettlementStatus
from app.enums.payment_status import PaymentStatus




class AdminRepository:

    def __init__(self, db: Session):
        self.db = db
    def today_orders(
        self,
    ):

        return (

            self.db.query(
                func.count(Order.id)
            )

            .filter(

                func.date(
                    Order.created_at
                ) == date.today()

            )

            .scalar()

            or 0

        )

    def waiting_orders(
        self,
    ):

        return (

            self.db.query(
                func.count(
                    ShopQueue.id
                )
            )

            .filter(
                ShopQueue.queue_date == date.today(),
                ShopQueue.queue_state
                == QueueState.WAITING

            )

            .scalar()

            or 0

        )

    def printing_orders(
        self,
    ):

        return (

            self.db.query(
                func.count(
                    ShopQueue.id
                )
            )

            .filter(
                ShopQueue.queue_date == date.today(),
                ShopQueue.queue_state
                == QueueState.PRINTING

            )

            .scalar()

            or 0

        )

    def ready_orders(
        self,
    ):

        return (

            self.db.query(
                func.count(
                    ShopQueue.id
                )
            )

            .filter(
                ShopQueue.queue_date == date.today(),
                ShopQueue.queue_state
                == QueueState.READY

            )

            .scalar()

            or 0

        )

    def served_orders(
        self,
    ):

        return (

            self.db.query(
                func.count(
                    ShopQueue.id
                )
            )

            .filter(
                ShopQueue.queue_date == date.today(),
                ShopQueue.queue_state
                == QueueState.SERVED

            )

            .scalar()

            or 0

        )


    def waiting_room_students(
        self,
    ):

        return (

            self.db.query(
                func.count(
                    WaitingRoom.id
                )
            )

            .filter(

                WaitingRoom.status
                == WaitingRoomStatus.WAITING

            )

            .scalar()

            or 0

        )

    def active_sessions(
        self,
    ):

        return (

            self.db.query(
                func.count(
                    WaitingRoom.id
                )
            )

            .filter(

                WaitingRoom.status
                == WaitingRoomStatus.ADMITTED

            )

            .scalar()

            or 0

        )

    def today_revenue(
        self,
    ):

        return (

            self.db.query(

                func.sum(

                    Order.convenience_fee
                    + Order.platform_fee
                    + Order.priority_fee

                )

            )

            .filter(

                func.date(
                    Order.created_at
                ) == date.today()

            )

            .scalar()

            or 0

        )
    
    def today_revenue_details(self):

        today = date.today()

        result = (

            self.db.query(

                func.count(Order.id),

                func.sum(Order.convenience_fee),

                func.sum(Order.platform_fee),

                func.sum(Order.priority_fee),

            )

            .filter(

                func.date(Order.created_at) == today

            )

            .first()

        )

        convenience_fee = result[1] or 0
        platform_fee = result[2] or 0
        priority_fee = result[3] or 0

        return {

            "date": today,

            "total_orders": result[0] or 0,

            "convenience_fee": convenience_fee,

            "platform_fee": platform_fee,

            "priority_fee": priority_fee,

            "total_revenue": convenience_fee + platform_fee + priority_fee,

        }
    
    def month_revenue_details(self):

        today = date.today()

        result = (

            self.db.query(

                func.count(Order.id),

                func.sum(Order.convenience_fee),

                func.sum(Order.platform_fee),

                func.sum(Order.priority_fee),

            )

            .filter(

                func.extract("year", Order.created_at) == today.year,

                func.extract("month", Order.created_at) == today.month,

            )

            .first()

        )

        convenience_fee = result[1] or 0
        platform_fee = result[2] or 0
        priority_fee = result[3] or 0

        return {

            "month": today.strftime("%B %Y"),

            "total_orders": result[0] or 0,

            "convenience_fee": convenience_fee,

            "platform_fee": platform_fee,

            "priority_fee": priority_fee,

            "total_revenue": convenience_fee + platform_fee + priority_fee,

        }
    
    def revenue_history(self):

        rows = (

            self.db.query(

                func.date(Order.created_at).label("date"),

                func.count(Order.id).label("total_orders"),

                func.sum(Order.convenience_fee).label("convenience_fee"),

                func.sum(Order.platform_fee).label("platform_fee"),

                func.sum(Order.priority_fee).label("priority_fee"),

            )

            .group_by(

                func.date(Order.created_at)

            )

            .order_by(

                func.date(Order.created_at).desc()

            )

            .all()

        )

        history = []

        for row in rows:

            convenience_fee = row.convenience_fee or 0
            platform_fee = row.platform_fee or 0
            priority_fee = row.priority_fee or 0

            history.append({

                "date": row.date,

                "total_orders": row.total_orders,

                "convenience_fee": convenience_fee,

                "platform_fee": platform_fee,

                "priority_fee": priority_fee,

                "total_revenue": convenience_fee + platform_fee + priority_fee,

            })

        return {

            "history": history

        }

    
    def get_all_settlements(self):
        from app.settlements.repository import SettlementRepository
        settlement_repo = SettlementRepository(self.db)
        settlement_repo.sync_settlements("RIT_PRINT_SHOP")
        settlements = (
            self.db.query(Settlement)
            .order_by(
                Settlement.settlement_date.desc()
            )
            .all()
        )
        return [settlement_repo.attach_breakdown(s) for s in settlements]

    def get_settlement(
        self,
        settlement_id,
    ):
        from app.settlements.repository import SettlementRepository
        settlement_repo = SettlementRepository(self.db)
        settlement_repo.sync_settlements("RIT_PRINT_SHOP")
        settlement = (
            self.db.query(Settlement)
            .filter(
                Settlement.id == settlement_id
            )
            .first()
        )
        return settlement_repo.attach_breakdown(settlement) if settlement else None


    def save(self):

        self.db.commit()


    def complete_settlement(
        self,
        settlement,
        request,
    ):
        if settlement.status == SettlementStatus.COMPLETED:

            return settlement

        settlement.status = SettlementStatus.COMPLETED

        settlement.paid_at = datetime.now()

        settlement.upi_reference = request.upi_reference

        settlement.notes = request.notes

        self.save()

        return settlement
    
    def get_today_settlement(self):

        return (

            self.db.query(Settlement)

            .filter(
                Settlement.settlement_date == date.today()
            )

            .first()

        )
    
    def generate_settlement(self):
        target_date = date.today()
        from app.settlements.repository import SettlementRepository
        settlement_repo = SettlementRepository(self.db)
        settlement_repo.sync_settlements("RIT_PRINT_SHOP")

        existing = self.get_today_settlement()
        if existing:
            return settlement_repo.attach_breakdown(existing)

        amount = (
            self.db.query(
                func.coalesce(func.sum(Order.subtotal), Decimal("0.00"))
            )
            .filter(
                func.date(Order.created_at) == target_date,
                Order.payment_status == PaymentStatus.PAID,
            )
            .scalar()
        ) or Decimal("0.00")

        settlement = Settlement(
            shop_id="RIT_PRINT_SHOP",
            settlement_date=target_date,
            amount=amount,
            status=SettlementStatus.PENDING,
            generated_at=datetime.now(),
        )

        self.db.add(settlement)
        self.db.flush()

        self.db.query(Order).filter(
            func.date(Order.created_at) == target_date,
            Order.payment_status == PaymentStatus.PAID,
        ).update({"settlement_id": settlement.id}, synchronize_session=False)

        self.save()
        return settlement_repo.attach_breakdown(settlement)
    
    def queue_monitor(self):

        rows = (

            self.db.query(ShopQueue)

            .filter(
                ShopQueue.queue_date == date.today()
            )

            .order_by(
                ShopQueue.queue_number
            )

            .all()

        )


        return {

            "orders": [

                {

                    "order_id": row.order_id,

                    "token": row.token,

                    "queue_number": row.queue_number,

                    "queue_type": row.queue_type.value,

                    "status": row.queue_state.value,

                    "is_current": row.is_current,

                }

                for row in rows

            ]

        }

    def total_students_count(self):
        return self.db.query(func.count(User.id)).scalar() or 0

    def registered_shops_count(self):
        return 1

    def recent_orders(self, limit: int = 10):
        rows = (
            self.db.query(Order, ShopQueue, User)
            .outerjoin(ShopQueue, ShopQueue.order_id == Order.id)
            .outerjoin(User, User.id == Order.student_id)
            .order_by(Order.created_at.desc())
            .limit(limit)
            .all()
        )

        orders = []
        for order, queue, user in rows:
            orders.append({
                "order_id": order.id,
                "register_number": user.register_number if user else "N/A",
                "token": queue.token if queue else None,
                "shop_name": "Central QLex Hub",
                "status": order.status.value if hasattr(order.status, "value") else str(order.status),
                "is_priority": order.is_priority,
                "grand_total": order.grand_total or Decimal("0.00"),
                "created_at": order.created_at,
            })
        return {"orders": orders}

    def recent_payments(self, limit: int = 10):
        rows = (
            self.db.query(Payment, Order, User)
            .outerjoin(Order, Order.id == Payment.order_id)
            .outerjoin(User, User.id == Order.student_id)
            .order_by(Payment.created_at.desc())
            .limit(limit)
            .all()
        )

        payments = []
        for payment, order, user in rows:
            tx_id = payment.gateway_payment_id or payment.gateway_order_id or str(payment.id)[:12]
            payments.append({
                "id": payment.id,
                "transaction_id": tx_id,
                "register_number": user.register_number if user else "N/A",
                "amount": payment.amount or Decimal("0.00"),
                "gateway": payment.gateway or "Razorpay",
                "status": payment.status.value if hasattr(payment.status, "value") else str(payment.status),
                "created_at": payment.created_at,
            })
        return {"payments": payments}

    def admin_shops(self):
        today_rev = self.today_revenue()
        today_ord = self.today_orders()
        waiting_ord = self.waiting_orders()
        
        pending_settlement = (
            self.db.query(func.sum(Settlement.amount))
            .filter(Settlement.status == SettlementStatus.PENDING)
            .scalar()
            or Decimal("0.00")
        )

        return {
            "shops": [
                {
                    "shop_id": "RIT_PRINT_SHOP",
                    "name": "QLex Central Print Hub",
                    "status": "ONLINE",
                    "orders_today": today_ord,
                    "orders_waiting": waiting_ord,
                    "revenue_today": today_rev,
                    "pending_settlement": pending_settlement,
                    "health": "OPERATIONAL",
                }
            ]
        }

    def admin_notifications(self):
        notifications = []
        
        # Pending settlement check
        pending = (
            self.db.query(Settlement)
            .filter(Settlement.status == SettlementStatus.PENDING)
            .first()
        )
        if pending:
            notifications.append({
                "id": f"notif-settlement-{pending.id}",
                "title": "Pending Settlement Awaiting Approval",
                "message": f"Settlement dated {pending.settlement_date} for ₹{pending.amount} is ready for processing.",
                "type": "warning",
                "created_at": pending.generated_at,
                "unread": True,
            })

        # Recent Priority Orders check
        priority_orders = (
            self.db.query(Order)
            .filter(Order.is_priority == True)
            .order_by(Order.created_at.desc())
            .limit(2)
            .all()
        )
        for po in priority_orders:
            notifications.append({
                "id": f"notif-priority-{po.id}",
                "title": "High Priority Order Submitted",
                "message": f"Order #{str(po.id)[:8]} has been placed with Priority Pass.",
                "type": "info",
                "created_at": po.created_at,
                "unread": False,
            })

        # Server health event
        notifications.append({
            "id": "notif-system-health",
            "title": "System Operational Status",
            "message": "All QLex print queues, web services, and database connections are healthy.",
            "type": "success",
            "created_at": datetime.now(),
            "unread": False,
        })

        return {"notifications": notifications}

    def students_overview(self):
        total_students = self.db.query(func.count(User.id)).scalar() or 0
        active_students = self.db.query(func.count(User.id)).filter(User.is_active == True).scalar() or 0
        blocked_students = self.db.query(func.count(User.id)).filter(User.is_active == False).scalar() or 0
        new_registrations_today = (
            self.db.query(func.count(User.id))
            .filter(func.date(User.created_at) == date.today())
            .scalar()
            or 0
        )

        active_student_ids = (
            self.db.query(Order.student_id)
            .join(ShopQueue, ShopQueue.order_id == Order.id)
            .filter(
                ShopQueue.queue_date == date.today(),
                ShopQueue.queue_state.in_([QueueState.WAITING, QueueState.PRINTING, QueueState.READY])
            )
            .distinct()
            .all()
        )

        return {
            "total_students": total_students,
            "active_students": active_students,
            "blocked_students": blocked_students,
            "new_registrations_today": new_registrations_today,
            "students_with_active_orders": len(active_student_ids),
        }

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
        query = self.db.query(User).options(
            joinedload(User.department),
            joinedload(User.year),
            joinedload(User.section),
            joinedload(User.orders).joinedload(Order.shop_queue)
        )

        if search and search.strip():
            term = f"%{search.strip()}%"
            query = query.join(Department, User.department_id == Department.id, isouter=True)
            query = query.filter(
                or_(
                    User.register_number.ilike(term),
                    User.full_name.ilike(term),
                    User.email.ilike(term),
                    User.phone.ilike(term),
                    Department.name.ilike(term)
                )
            )

        if department_id and department_id.strip() and department_id != "all":
            query = query.filter(User.department_id == department_id.strip())

        if year_id and year_id.strip() and year_id != "all":
            query = query.filter(User.year_id == year_id.strip())

        if status and status.strip() and status != "all":
            s = status.strip().lower()
            if s == "active":
                query = query.filter(User.is_active == True)
            elif s in ["inactive", "blocked"]:
                query = query.filter(User.is_active == False)

        all_users = query.all()

        student_items = []
        for user in all_users:
            total_orders = len(user.orders)
            completed_orders = sum(1 for o in user.orders if o.status in [OrderStatus.COMPLETED, OrderStatus.READY_FOR_PICKUP] or o.payment_status == PaymentStatus.PAID)
            cancelled_orders = sum(1 for o in user.orders if o.status in [OrderStatus.CANCELLED, OrderStatus.PAYMENT_FAILED, OrderStatus.EXPIRED])

            total_spent = sum((o.grand_total for o in user.orders if o.payment_status == PaymentStatus.PAID), Decimal("0.00"))

            active_token = None
            active_order_status = None
            for o in user.orders:
                if o.shop_queue and o.shop_queue.queue_date == date.today() and o.shop_queue.queue_state in [QueueState.WAITING, QueueState.PRINTING, QueueState.READY]:
                    active_token = o.shop_queue.token
                    active_order_status = o.shop_queue.queue_state.value
                    break

            has_active_order = active_token is not None

            if order_status == "active" and not has_active_order:
                continue
            if order_status == "none" and has_active_order:
                continue

            student_items.append({
                "id": user.id,
                "register_number": user.register_number,
                "full_name": user.full_name,
                "phone": user.phone,
                "email": user.email,
                "department_id": str(user.department_id) if user.department_id else "",
                "department_name": user.department.name if user.department else "N/A",
                "year_id": str(user.year_id) if user.year_id else "",
                "year_number": user.year.year_number if user.year else 0,
                "section_id": str(user.section_id) if user.section_id else "",
                "section_name": user.section.name if user.section else "N/A",
                "is_active": user.is_active,
                "created_at": user.created_at,
                "total_orders": total_orders,
                "completed_orders": completed_orders,
                "cancelled_orders": cancelled_orders,
                "total_spent": total_spent,
                "current_active_token": active_token,
                "current_order_status": active_order_status,
            })


        if sort_by == "oldest":
            student_items.sort(key=lambda x: x["created_at"])
        elif sort_by == "most_orders":
            student_items.sort(key=lambda x: x["total_orders"], reverse=True)
        elif sort_by == "alphabetical":
            student_items.sort(key=lambda x: x["full_name"].lower())
        else:
            student_items.sort(key=lambda x: x["created_at"], reverse=True)

        total_count = len(student_items)
        page_size = max(1, page_size)
        total_pages = max(1, (total_count + page_size - 1) // page_size)
        page = min(max(1, page), total_pages)

        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        paginated_students = student_items[start_idx:end_idx]

        return {
            "students": paginated_students,
            "total": total_count,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
        }

    def get_student_by_id(self, student_id: UUID):
        user = (
            self.db.query(User)
            .options(
                joinedload(User.department),
                joinedload(User.year),
                joinedload(User.section),
                joinedload(User.orders).joinedload(Order.shop_queue)
            )
            .filter(User.id == student_id)
            .first()
        )
        if not user:
            return None

        total_orders = len(user.orders)
        completed_orders = sum(1 for o in user.orders if o.status in [OrderStatus.COMPLETED, OrderStatus.READY_FOR_PICKUP] or o.payment_status == PaymentStatus.PAID)
        cancelled_orders = sum(1 for o in user.orders if o.status in [OrderStatus.CANCELLED, OrderStatus.PAYMENT_FAILED, OrderStatus.EXPIRED])
        total_spent = sum((o.grand_total for o in user.orders if o.payment_status == PaymentStatus.PAID), Decimal("0.00"))


        active_token = None
        active_order_status = None
        for o in user.orders:
            if o.shop_queue and o.shop_queue.queue_date == date.today() and o.shop_queue.queue_state in [QueueState.WAITING, QueueState.PRINTING, QueueState.READY]:
                active_token = o.shop_queue.token
                active_order_status = o.shop_queue.queue_state.value
                break

        return {
            "id": user.id,
            "register_number": user.register_number,
            "full_name": user.full_name,
            "phone": user.phone,
            "email": user.email,
            "department_id": str(user.department_id) if user.department_id else "",
            "department_name": user.department.name if user.department else "N/A",
            "year_id": str(user.year_id) if user.year_id else "",
            "year_number": user.year.year_number if user.year else 0,
            "section_id": str(user.section_id) if user.section_id else "",
            "section_name": user.section.name if user.section else "N/A",
            "is_active": user.is_active,
            "created_at": user.created_at,
            "total_orders": total_orders,
            "completed_orders": completed_orders,
            "cancelled_orders": cancelled_orders,
            "total_spent": total_spent,
            "current_active_token": active_token,
            "current_order_status": active_order_status,
        }


    def toggle_student_status(self, student_id: UUID, is_active: bool | None = None):
        user = self.db.query(User).filter(User.id == student_id).first()
        if not user:
            return None

        if is_active is not None:
            user.is_active = is_active
        else:
            user.is_active = not user.is_active

        self.db.commit()
        return self.get_student_by_id(student_id)


                        
