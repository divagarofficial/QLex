from enum import Enum


class WaitingRoomEntry(
    str,
    Enum,
):

    NEW_ORDER = "new_order"

    MY_ORDERS = "my_orders"

    PAYMENTS = "payments"