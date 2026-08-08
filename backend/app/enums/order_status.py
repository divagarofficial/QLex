from enum import StrEnum


class OrderStatus(StrEnum):
    DRAFT = "draft"

    PENDING_PAYMENT = "pending_payment"

    PAID = "paid"

    ACCEPTED = "accepted"

    PRINTING = "printing"

    READY_FOR_PICKUP = "ready_for_pickup"

    COMPLETED = "completed"

    CANCELLED = "cancelled"

    PAYMENT_FAILED = "payment_failed"

    EXPIRED = "expired"