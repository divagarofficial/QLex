from enum import Enum


class QueueState(str, Enum):

    WAITING = "waiting"

    PRINTING = "printing"

    READY = "ready"

    SERVED = "served"

    REJECTED = "rejected"