from fastapi import HTTPException

from app.enums.queue_state import QueueState

from .repository import StudentRepository


class StudentService:

    def __init__(
        self,
        db,
    ):

        self.repository = StudentRepository(
            db
        )

    def my_token(
        self,
        student_id,
    ):
        from app.models.order import Order
        from app.models.shop_queue import ShopQueue
        from app.enums.queue_type import QueueType
        from sqlalchemy import func
        from datetime import date

        # Always fetch student's most recent order
        latest_order = self.repository.get_latest_active_order(student_id)

        if not latest_order:
            raise HTTPException(
                status_code=404,
                detail="No active token found.",
            )

        is_priority_order = latest_order.is_priority

        from app.shop.queue_service import ShopQueueService
        queue_service = ShopQueueService(self.repository.db)
        queue = queue_service.create_queue_entry(latest_order)

        target_shop_name = getattr(latest_order, "shop_name", "") or ""
        is_satellite = "Satellite" in target_shop_name

        # Sync queue type & token prefix if order priority changed (for Central shop)
        if queue:
            if not is_satellite and is_priority_order and queue.token and queue.token.startswith("R-"):
                queue.token = "P-" + queue.token[2:]
                queue.queue_type = QueueType.PRIORITY
                self.repository.db.commit()
            elif not is_satellite and not is_priority_order and queue.token and queue.token.startswith("P-"):
                queue.token = "R-" + queue.token[2:]
                queue.queue_type = QueueType.REGULAR
                self.repository.db.commit()

            token_str = queue.token
            queue_num = queue.queue_number
            status_val = queue.queue_state.value if hasattr(queue.queue_state, "value") else str(queue.queue_state)
        else:
            if is_satellite:
                prefix = "S"
            else:
                prefix = "P" if is_priority_order else "R"
            from app.models.order import Order as OrderModel
            seq_num = (
                self.repository.db.query(OrderModel)
                .filter(
                    OrderModel.shop_name == latest_order.shop_name if hasattr(OrderModel, "shop_name") else True,
                    func.date(OrderModel.created_at) >= date.today(),
                    OrderModel.created_at <= (latest_order.created_at if latest_order.created_at else func.now()),
                )
                .count()
            )
            token_str = f"{prefix}-{max(1, seq_num)}"
            queue_num = seq_num
            status_val = (
                latest_order.status.value
                if hasattr(latest_order.status, "value")
                else str(latest_order.status)
            )

        if is_satellite:
            current_printing_queue = (
                self.repository.db.query(ShopQueue)
                .filter(
                    ShopQueue.queue_date == date.today(),
                    ShopQueue.queue_type == QueueType.SATELLITE,
                    ShopQueue.queue_state == QueueState.PRINTING,
                )
                .first()
            )
        else:
            current_printing_queue = self.repository.get_current_printing()

        currently_printing_token = current_printing_queue.token if current_printing_queue else None

        # Calculate students ahead & estimated wait
        students_ahead = 0
        if status_val in ["WAITING", "CONFIRMED", "PAID"]:
            target_created = queue.created_at if (queue and queue.created_at) else (latest_order.created_at if latest_order.created_at else func.now())
            if is_satellite:
                students_ahead = (
                    self.repository.db.query(ShopQueue)
                    .filter(
                        ShopQueue.queue_date == date.today(),
                        ShopQueue.queue_type == QueueType.SATELLITE,
                        ShopQueue.queue_state == QueueState.WAITING,
                        ShopQueue.created_at < target_created,
                    )
                    .count()
                )
            elif is_priority_order:
                students_ahead = (
                    self.repository.db.query(ShopQueue)
                    .filter(
                        ShopQueue.queue_date == date.today(),
                        ShopQueue.queue_type == QueueType.PRIORITY,
                        ShopQueue.queue_state == QueueState.WAITING,
                        ShopQueue.created_at < target_created,
                    )
                    .count()
                )
            else:
                pri_waiting = (
                    self.repository.db.query(ShopQueue)
                    .filter(
                        ShopQueue.queue_date == date.today(),
                        ShopQueue.queue_type == QueueType.PRIORITY,
                        ShopQueue.queue_state == QueueState.WAITING,
                    )
                    .count()
                )
                reg_ahead = (
                    self.repository.db.query(ShopQueue)
                    .filter(
                        ShopQueue.queue_date == date.today(),
                        ShopQueue.queue_type == QueueType.REGULAR,
                        ShopQueue.queue_state == QueueState.WAITING,
                        ShopQueue.created_at < target_created,
                    )
                    .count()
                )
                students_ahead = pri_waiting + reg_ahead

        from app.utils.estimated_time import calculate_order_estimated_time
        est_time = calculate_order_estimated_time(self.repository.db, latest_order)
        estimated_wait = est_time["estimated_wait_minutes"]
        est_dt = est_time.get("estimated_completion_time")
        estimated_completion_iso = (est_dt.isoformat() + "Z") if est_dt and hasattr(est_dt, "isoformat") else (str(est_dt) + "Z" if est_dt else None)

        return {
            "token": token_str,
            "status": status_val,
            "estimated_wait_minutes": estimated_wait,
            "estimated_completion_time": estimated_completion_iso,
            "shop_name": getattr(latest_order, "shop_name", "QLex Central Print Hub"),
            "is_priority": is_priority_order,
            "order_id": str(latest_order.id),
            "queue_number": queue_num,
            "students_ahead": students_ahead,
            "currently_printing": currently_printing_token,
            "created_at": latest_order.created_at.isoformat() if (latest_order.created_at and hasattr(latest_order.created_at, "isoformat")) else str(latest_order.created_at) if latest_order.created_at else None,
        }

    
    def live_queue(self):
        from app.shop.service import ShopService
        ShopService(self.repository.db).auto_process_printing_timeouts()

        current = (
            self.repository
            .get_current_printing()
        )

        priority = (
            self.repository
            .get_priority_queue()
        )

        regular = (
            self.repository
            .get_regular_queue()
        )

        return {

            "currently_printing": (

                current.token

                if current

                else None

            ),

            "priority_queue": [

                q.token

                for q in priority

            ],

            "regular_queue": [

                q.token

                for q in regular

            ],

        }
    
    def my_orders(
        self,
        student_id,
    ):
        orders = self.repository.get_orders(student_id)
        from app.utils.estimated_time import calculate_order_estimated_time

        result = []
        for order, token, document_count in orders:
            status_val = (
                order.shop_queue.queue_state.value
                if (order.shop_queue and order.shop_queue.queue_state)
                else (order.status.value if hasattr(order.status, "value") else str(order.status))
            )
            payment_status_val = (
                order.payment_status.value
                if hasattr(order.payment_status, "value")
                else str(order.payment_status)
            )

            est = calculate_order_estimated_time(self.repository.db, order)
            est_dt = est.get("estimated_completion_time")
            est_comp_iso = (est_dt.isoformat() + "Z") if est_dt and hasattr(est_dt, "isoformat") else (str(est_dt) + "Z" if est_dt else None)

            result.append(
                {
                    "order_id": order.id,
                    "token": token,
                    "status": status_val,
                    "payment_status": payment_status_val,
                    "total_amount": order.grand_total,
                    "documents": document_count,
                    "is_priority": order.is_priority,
                    "shop_name": getattr(order, "shop_name", "QLex Central Print Hub"),
                    "estimated_wait_minutes": est["estimated_wait_minutes"],
                    "estimated_completion_time": est_comp_iso,
                    "created_at": order.created_at,
                }
            )

        return {"orders": result}
    
    def order_details(
    self,
    student_id,
    order_id,
):

        order = (
            self.repository
            .get_order_details(
                student_id,
                order_id,
            )
        )

        if order is None:

            raise HTTPException(
                status_code=404,
                detail="Order not found.",
            )

        documents = (
            self.repository
            .get_order_documents(
                order.id
            )
        )

        queue = self.repository.get_queue(order.id)
        if queue and queue.token:
            token_str = queue.token
        else:
            from app.models.order import Order as OrderModel
            from datetime import date
            from sqlalchemy import func
            prefix = "P" if order.is_priority else "R"
            target_date = order.created_at.date() if (order.created_at and hasattr(order.created_at, "date")) else date.today()
            seq_num = (
                self.repository.db.query(OrderModel)
                .filter(
                    OrderModel.is_priority == order.is_priority,
                    func.date(OrderModel.created_at) >= target_date,
                    OrderModel.created_at <= (order.created_at if order.created_at else func.now()),
                )
                .count()
            )
            token_str = f"{prefix}-{max(1, seq_num)}"

        from app.utils.estimated_time import calculate_order_estimated_time
        est = calculate_order_estimated_time(self.repository.db, order)
        est_dt = est.get("estimated_completion_time")
        est_comp_iso = (est_dt.isoformat() + "Z") if est_dt and hasattr(est_dt, "isoformat") else (str(est_dt) + "Z" if est_dt else None)

        from app.utils.pdf import get_printable_page_count
        return {
            "order_id": order.id,
            "token": token_str,

            "status": order.status.value,

            "payment_status": (
                order.payment_status.value
            ),

            "total_amount": (
                order.grand_total
            ),

            "subtotal": (
                order.subtotal
            ),

            "convenience_fee": (
                order.convenience_fee
            ),

            "platform_fee": (
                order.platform_fee
            ),

            "priority_fee": (
                order.priority_fee
            ),

            "is_priority": (
                order.is_priority
            ),

            "shop_name": getattr(order, "shop_name", "QLex Central Print Hub"),
            "estimated_wait_minutes": est["estimated_wait_minutes"],
            "estimated_completion_time": est_comp_iso,

            "created_at": (
                order.created_at
            ),

            "documents": [

    {

        "id": doc.id,

        "file_name": (
            doc.original_filename
        ),

        "copies": (
            doc.copies
        ),

        "page_count": (
            doc.page_count
        ),

        "custom_pages": doc.custom_pages,
        "printable_page_count": get_printable_page_count(doc.custom_pages, doc.page_count),

        "paper_size": (
            doc.paper_size.value
        ),

        "print_type": (
            doc.print_type.value
        ),

        "print_side": (
            doc.print_side.value
        ),

        "document_total": (
            doc.document_total
        ),

    }

    for doc in documents

],

        }
    
    def payments(
        self,
        student_id,
    ):
        records = self.repository.get_payments(student_id)

        result = []
        for order, payment, token in records:
            if not token:
                queue = self.repository.get_queue(order.id)
                if queue and queue.token:
                    token_str = queue.token
                else:
                    is_pri = order.is_priority
                    prefix = "P" if is_pri else "R"
                    from app.models.order import Order as OrderModel
                    seq_num = (
                        self.repository.db.query(OrderModel)
                        .filter(
                            OrderModel.is_priority == is_pri,
                            OrderModel.created_at <= order.created_at,
                        )
                        .count()
                    )
                    token_str = f"{prefix}-{max(1, seq_num)}"
            else:
                token_str = token

            pay_status = (
                payment.status.value
                if (payment and hasattr(payment.status, "value"))
                else (
                    order.payment_status.value
                    if hasattr(order.payment_status, "value")
                    else str(order.payment_status)
                )
            )
            amount = payment.amount if payment else order.grand_total
            paid_at = payment.updated_at if payment else order.created_at
            payment_id = payment.id if payment else order.id

            result.append(
                {
                    "payment_id": payment_id,
                    "order_id": order.id,
                    "token": token_str,
                    "amount": amount,
                    "status": pay_status,
                    "paid_at": paid_at,
                }
            )

        return {"payments": result}