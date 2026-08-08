from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.waiting_room.repository import (
    WaitingRoomRepository,
)


class WaitingRoomMiddleware:

    def __init__(
        self,
        db: Session,
    ):
        self.repository = WaitingRoomRepository(db)

    def verify_session(
    self,
    session_token: str | None,
):

        if session_token is None:

            raise HTTPException(
                status_code=429,
                detail="Waiting Room session required.",
            )

        session = (
            self.repository
            .get_by_session_token(
                session_token
            )
        )

        if session is None:

            raise HTTPException(
                status_code=429,
                detail="Waiting Room session expired.",
            )

        return session
    

def waiting_room_required(

    waiting_room_session: str | None = Header(
        default=None,
        alias="X-Waiting-Room-Session",
    ),

    db: Session = Depends(get_db),

):

    middleware = WaitingRoomMiddleware(
        db
    )

    return middleware.verify_session(
        waiting_room_session
    )