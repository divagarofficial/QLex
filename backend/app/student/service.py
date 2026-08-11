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

        # Sync queue type & token prefix if order priority changed
        if queue:
            if is_priority_order and queue.token and queue.token.startswith("R-"):
                queue.token = "P-" + queue.token[2:]
                queue.queue_type = QueueType.PRIORITY
                self.repository.db.commit()
            elif not is_priority_order and queue.token and queue.token.startswith("P-"):
                queue.token = "R-" + queue.token[2:]
                queue.queue_type = QueueType.REGULAR
                self.repository.db.commit()

            token_str = queue.token
            queue_num = queue.queue_number
            status_val = queue.queue_state.value
        else:
            prefix = "P" if is_priority_order else "R"
            from app.models.order import Order as OrderModel
            from datetime import date
            seq_num = (
                self.repository.db.query(OrderModel)
                .filter(
                    OrderModel.is_priority == is_priority_order,
                    OrderModel.created_at >= date.today(),
                    OrderModel.created_at <= latest_order.created_at,
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

        current_printing_queue = self.repository.get_current_printing()
        currently_printing_token = current_printing_queue.token if current_printing_queue else None

        # Calculate students ahead & estimated wait
        students_ahead = 0
        if status_val == "WAITING":
            from datetime import date
            if is_priority_order:
                students_ahead = (
                    self.repository.db.query(ShopQueue)
                    .filter(
                        ShopQueue.queue_date == date.today(),
                        ShopQueue.queue_type == QueueType.PRIORITY,
                        ShopQueue.queue_state == QueueState.WAITING,
                        ShopQueue.created_at < (queue.created_at if queue else latest_order.created_at),
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
                        ShopQueue.created_at < (queue.created_at if queue else latest_order.created_at),
                    )
                    .count()
                )
                students_ahead = pri_waiting + reg_ahead

        import math
        from datetime import datetime
        if status_val in ["READY", "READY_FOR_PICKUP", "SERVED", "COMPLETED", "REJECTED", "CANCELLED"]:
            estimated_wait = 0
        elif status_val == "PRINTING":
            if queue and queue.ready_at:
                rem_seconds = (queue.ready_at - datetime.utcnow()).total_seconds()
                estimated_wait = max(1, math.ceil(rem_seconds / 60))
            else:
                estimated_wait = 10
        else:
            estimated_wait = max(1, students_ahead * 3)

        return {
            "token": token_str,
            "status": status_val,
            "estimated_wait_minutes": estimated_wait,
            "is_priority": is_priority_order,
            "order_id": str(latest_order.id),
            "queue_number": queue_num,
            "students_ahead": students_ahead,
            "currently_printing": currently_printing_token,
            "created_at": latest_order.created_at.isoformat() if latest_order.created_at else None,
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

            result.append(
                {
                    "order_id": order.id,
                    "token": token,
                    "status": status_val,
                    "payment_status": payment_status_val,
                    "total_amount": order.grand_total,
                    "documents": document_count,
                    "is_priority": order.is_priority,
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
            prefix = "P" if order.is_priority else "R"
            seq_num = (
                self.repository.db.query(OrderModel)
                .filter(
                    OrderModel.is_priority == order.is_priority,
                    OrderModel.created_at >= (order.created_at.date() if order.created_at else date.today()),
                    OrderModel.created_at <= order.created_at,
                )
                .count()
            )
            token_str = f"{prefix}-{max(1, seq_num)}"

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