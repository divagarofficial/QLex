from enum import Enum


class WaitingRoomStatus(
    str,
    Enum,
):

    WAITING = "waiting"

    ADMITTED = "admitted"

    LEFT = "left"

    EXPIRED = "expired"