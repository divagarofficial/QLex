from enum import Enum


class QueueType(str, Enum):

    PRIORITY = "priority"

    REGULAR = "regular"

    SATELLITE = "satellite"