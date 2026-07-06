from enum import Enum


class OrderStatus(str, Enum):
    PENDING = "pending"
    PRINTING = "printing"
    READY = "ready"
    COMPLETED = "completed"
    CANCELLED = "cancelled"