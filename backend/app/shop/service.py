from .repository import ShopRepository
from datetime import datetime, timedelta
from app.enums.queue_state import QueueState
from app.enums.order_status import OrderStatus


class ShopService:

    def __init__(self, db):

        self.repository = ShopRepository(db)

    def _notify_status_update(self, queue, status_str: str, reason: str = None):
        try:
            from app.services.whatsapp_service import whatsapp_service
            from app.services.email_service import email_service
            from app.models.order import Order
            from app.models.user import User

            if not queue:
                return

            order = queue.order if hasattr(queue, "order") and queue.order else None
            if not order and getattr(queue, "order_id", None):
                order = self.repository.db.query(Order).filter(Order.id == queue.order_id).first()

            if not order:
                return

            student = order.student if hasattr(order, "student") and order.student else None
            if not student and getattr(order, "student_id", None):
                student = self.repository.db.query(User).filter(User.id == order.student_id).first()

            if not student:
                return

            student_name = getattr(student, "full_name", "Student") or "Student"
            phone = getattr(student, "phone", "") or ""
            email = getattr(student, "email", "") or ""
            token_number = getattr(queue, "token", None)

            if phone:
                whatsapp_service.send_status_update(
                    db=self.repository.db,
                    order_id=str(order.id),
                    student_name=student_name,
                    phone=phone,
                    shop_name="Print Hub",
                    status=status_str,
                    token_number=token_number,
                    reason=reason
                )

            if email:
                email_service.send_status_update_email(
                    db=self.repository.db,
                    order_id=str(order.id),
                    student_name=student_name,
                    to_email=email,
                    shop_name="Print Hub",
                    status=status_str,
                    token_number=token_number,
                    reason=reason
                )
        except Exception as e:
            import logging
            logging.getLogger(__name__).warning(f"[ShopService] Failed to send status update notification: {e}")

    def _notify_whatsapp_status(self, queue, status_str: str, reason: str = None):
        """Backward compatibility alias for _notify_status_update."""
        self._notify_status_update(queue, status_str, reason=reason)

    def auto_process_printing_timeouts(self):
        """Disabled auto-timeout processing. Order status changes are purely manual by the shopkeeper."""
        pass

    def get_orders(self):
        self.auto_process_printing_timeouts()
        orders = self.repository.get_active_orders()
        from app.shop.queue_service import ShopQueueService
        queue_service = ShopQueueService(self.repository.db)

        for order in orders:
            queue = queue_service.create_queue_entry(order)
            if queue:
                order.token = queue.token
                order.queue_state = queue.queue_state.value if hasattr(queue.queue_state, "value") else str(queue.queue_state)
            p_status = getattr(order, "payment_status", None)
            order.payment_status = p_status.value if hasattr(p_status, "value") else (str(p_status) if p_status else "unpaid")

        return orders
    
    def get_todays_orders(self):
        self.auto_process_printing_timeouts()

        queues = (
            self.repository
            .get_today_queue()
        )

        results = []

        for queue in queues:

            order = queue.order
            q_state = queue.queue_state.value if hasattr(queue.queue_state, "value") else str(queue.queue_state)
            results.append(
                {
                    "token": queue.token,
                    "order_id": order.id,
                    "student_id": order.student_id,
                    "documents": len(order.documents),
                    "is_priority": order.is_priority,
                    "queue_state": q_state,
                    "is_current": queue.is_current,
                }
            )

        return results
        
    def get_order_details(
    self,
    order_id,
):

        order = (
            self.repository
            .get_order_details(order_id)
        )

        if order is None:

            raise ValueError(
                "Order not found."
            )

        from app.shop.queue_service import ShopQueueService
        queue_service = ShopQueueService(self.repository.db)
        queue = queue_service.create_queue_entry(order)
        token = queue.token if queue else ""

        documents = []

        for document in order.documents:

            services = []

            for item in document.document_services:

                services.append(
                    {
                        "id": item.service.id,
                        "name": item.service.name,
                        "quantity": item.quantity,
                        "price": item.price,
                        "total": item.total,
                    }
                )

            documents.append(
                {
                    "id": document.id,
                    "original_filename": document.original_filename,
                    "stored_filename": document.stored_filename,
                    "url": document.url,
                    "page_count": document.page_count,
                    "copies": document.copies,
                    "print_type": document.print_type,
                    "paper_size": document.paper_size,
                    "print_side": document.print_side,
                    "document_total": document.document_total,
                    "services": services,
                }
            )

        status_val = (
            queue.queue_state.value
            if (queue and hasattr(queue.queue_state, "value"))
            else (str(queue.queue_state) if (queue and queue.queue_state) else (order.status.value if hasattr(order.status, "value") else str(order.status)))
        )

        p_status = getattr(order, "payment_status", None)
        payment_status_val = (
            p_status.value
            if hasattr(p_status, "value")
            else (str(p_status) if p_status else "unpaid")
        )

        return {

            "order_id": order.id,

            "student_id": order.student_id,

            "token": token,

            "status": status_val,

            "queue_state": status_val,

            "payment_status": payment_status_val,

            "is_priority": order.is_priority,

            "grand_total": order.grand_total,

            "documents": documents,
        }

    
    def print_order(
    self,
    order_id,
):

        queue = (
            self.repository
            .get_queue_by_order(
                order_id
            )
        )

        if queue is None:

            raise ValueError(
                "Queue entry not found."
            )

        if queue.queue_state == QueueState.PRINTING:
            return queue

        if queue.queue_state != QueueState.WAITING:

            raise ValueError(
                "Order cannot be printed."
            )

        now = datetime.utcnow()

        queue.queue_state = QueueState.PRINTING

        if queue.order:
            queue.order.status = OrderStatus.PRINTING

        queue.downloaded_at = now

        queue.printing_started_at = now

        queue.is_current = False
        self.unlock_next_order()

        self.repository.save()
        self._notify_whatsapp_status(queue, "PRINTING")

        return queue
    
    def get_order_status(
        self,
        order_id,
    ):
        queue = (
            self.repository
            .get_queue_by_order(
                order_id
            )
        )

        return queue
    
    def mark_ready(
        self,
        order_id,
    ):
        queue = (
            self.repository
            .get_queue_by_order(
                order_id
            )
        )

        if queue is None:
            raise ValueError(
                "Queue entry not found."
            )

        if queue.queue_state == QueueState.REJECTED:
            raise ValueError(
                "Order has been rejected."
            )

        queue.queue_state = QueueState.READY
        if queue.order:
            queue.order.status = OrderStatus.READY_FOR_PICKUP

        queue.ready_at = datetime.utcnow()
        self.repository.save()
        self._notify_whatsapp_status(queue, "READY")

        return queue

    def serve_order(
        self,
        order_id,
    ):

        queue = (
            self.repository
            .get_queue_by_order(
                order_id
            )
        )

        if queue is None:

            raise ValueError(
                "Queue entry not found."
            )

        if queue.queue_state == QueueState.REJECTED:

            raise ValueError(
                "Order has been rejected and cannot be served."
            )

        was_current = queue.is_current
        queue.queue_state = QueueState.SERVED
        if queue.order:
            queue.order.status = OrderStatus.COMPLETED

        queue.served_at = datetime.utcnow()

        queue.is_current = False

        self.repository.save()
        self._notify_whatsapp_status(queue, "SERVED")

        if was_current:
            self.unlock_next_order()

        return queue

    def reject_order(
        self,
        order_id,
        reason: str = None,
    ):

        queue = (
            self.repository
            .get_queue_by_order(
                order_id
            )
        )

        if queue is None:

            raise ValueError(
                "Queue entry not found."
            )

        was_current = queue.is_current
        queue.queue_state = QueueState.REJECTED
        if queue.order:
            queue.order.status = OrderStatus.REJECTED

        queue.rejected_at = datetime.utcnow()

        queue.is_current = False
        if was_current:
            self.unlock_next_order()

        self.repository.save()
        self._notify_whatsapp_status(queue, "REJECTED", reason=reason)

        return queue
    
    def mark_served(
    self,
    order_id,
):
        """
        Directly mark an order as SERVED from any active state
        (WAITING, PRINTING, READY). Unlocks the next order in queue.
        Used when operator sends document to printer.
        """

        queue = (
            self.repository
            .get_queue_by_order(
                order_id
            )
        )

        if queue is None:

            raise ValueError(
                "Queue entry not found."
            )

        if queue.queue_state == QueueState.SERVED:
            # Already served — idempotent, just return current state
            return queue

        if queue.queue_state == QueueState.REJECTED:
            raise ValueError(
                "Order has been rejected and cannot be served."
            )

        was_current = queue.is_current

        queue.queue_state = QueueState.SERVED
        if queue.order:
            queue.order.status = OrderStatus.COMPLETED

        queue.served_at = datetime.utcnow()

        queue.is_current = False

        self.repository.save()
        self._notify_whatsapp_status(queue, "SERVED")

        if was_current:
            self.unlock_next_order()

        return queue

    def unlock_next_order(self):

        next_queue = (
            self.repository
            .get_next_waiting_order()
        )

        if next_queue:

            next_queue.is_current = True

            self.repository.save()
        
    def get_today_revenue(
    self,
):

        result = (
            self.repository
            .get_today_revenue()
        )

        return {

            "total_orders": (
                result.total_orders
            ),

            "total_revenue": (
                result.total_revenue
            ),
        }

    def get_pending_print_jobs(self):
        """
        Retrieves all PAID orders in the queue that are waiting to be printed.
        Priority orders are sorted first, followed by regular orders by queue number.
        """
        from app.models.shop_queue import ShopQueue
        from app.enums.queue_state import QueueState
        from app.enums.queue_type import QueueType
        from datetime import date

        # Auto-process today's active orders
        self.get_orders()
        record_print_agent_heartbeat("shop-windows7-pc", [])

        queues = (
            self.repository.db.query(ShopQueue)
            .filter(
                ShopQueue.queue_date == date.today(),
                ShopQueue.queue_state == QueueState.WAITING,
            )
            .order_by(
                ShopQueue.queue_type == QueueType.REGULAR,  # PRIORITY first (False < True)
                ShopQueue.queue_number.asc(),
            )
            .all()
        )

        jobs = []
        for queue in queues:
            order = queue.order
            if not order or not order.documents:
                continue

            student = getattr(order, "student", None)
            student_name = getattr(student, "full_name", "Student") if student else "Student"

            documents_spec = []
            for doc in order.documents:
                print_type_val = (
                    doc.print_type.value
                    if hasattr(doc.print_type, "value")
                    else str(doc.print_type)
                )
                paper_size_val = (
                    doc.paper_size.value
                    if hasattr(doc.paper_size, "value")
                    else str(doc.paper_size)
                )
                print_side_val = (
                    doc.print_side.value
                    if hasattr(doc.print_side, "value")
                    else str(doc.print_side)
                )

                documents_spec.append(
                    {
                        "id": doc.id,
                        "original_filename": doc.original_filename,
                        "stored_filename": doc.stored_filename,
                        "url": doc.url,
                        "file_size": doc.file_size,
                        "page_count": doc.page_count,
                        "paper_size": paper_size_val,
                        "print_type": print_type_val,
                        "print_side": print_side_val,
                        "copies": doc.copies,
                    }
                )

            jobs.append(
                {
                    "order_id": order.id,
                    "token": queue.token,
                    "is_priority": order.is_priority,
                    "student_name": student_name,
                    "created_at": order.created_at,
                    "documents": documents_spec,
                }
            )

        return jobs

    def update_print_job_status(self, order_id, status: str, error_message: str = None, assigned_printer: str = None):
        """
        Updates print job status from local Print Agent.
        - PRINTING: Marks order as PRINTING
        - COMPLETED: Marks order as READY_FOR_PICKUP and notifies student via WhatsApp
        - FAILED: Handles failure state
        """
        status_upper = status.upper()
        if status_upper == "PRINTING":
            queue = self.print_order(order_id)
            new_state = queue.queue_state.value if hasattr(queue.queue_state, "value") else str(queue.queue_state)
            return {
                "success": True,
                "order_id": order_id,
                "new_queue_state": new_state,
                "message": f"Order status updated to PRINTING on {assigned_printer or 'local printer'}",
            }
        elif status_upper == "COMPLETED":
            queue = self.mark_ready(order_id)
            new_state = queue.queue_state.value if hasattr(queue.queue_state, "value") else str(queue.queue_state)
            return {
                "success": True,
                "order_id": order_id,
                "new_queue_state": new_state,
                "message": f"Order printed successfully on {assigned_printer or 'local printer'} and marked READY_FOR_PICKUP",
            }
        elif status_upper == "FAILED":
            import logging
            logging.getLogger(__name__).error(f"[ShopService] Print job failed for order {order_id}: {error_message}")
            return {
                "success": False,
                "order_id": order_id,
                "new_queue_state": "FAILED",
                "message": f"Print job failed: {error_message}",
            }
        else:
            raise ValueError(f"Unsupported status update: {status}")

AGENT_HEARTBEAT_CACHE = {
    "last_seen": None,
    "active_printers": [],
    "agent_id": "shop-windows7-pc",
}


def record_print_agent_heartbeat(agent_id: str, active_printers: list):
    from datetime import datetime
    AGENT_HEARTBEAT_CACHE["last_seen"] = datetime.utcnow()
    AGENT_HEARTBEAT_CACHE["active_printers"] = active_printers
    AGENT_HEARTBEAT_CACHE["agent_id"] = agent_id


def get_print_agent_health():
    from datetime import datetime, timedelta
    last_seen = AGENT_HEARTBEAT_CACHE["last_seen"]
    is_connected = False
    if last_seen and (datetime.utcnow() - last_seen) < timedelta(seconds=15):
        is_connected = True

    return {
        "status": "connected" if is_connected else "disconnected",
        "is_connected": is_connected,
        "last_seen": last_seen or datetime.utcnow(),
        "active_printers": AGENT_HEARTBEAT_CACHE["active_printers"],
    }



    