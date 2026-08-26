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
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
):
    # Staff users bypass the waiting room completely
    if authorization and authorization.startswith("Bearer "):
        try:
            token = authorization.split(" ")[1]
            from app.core.security import decode_access_token
            payload = decode_access_token(token)
            if payload:
                if payload.get("role") == "staff":
                    return None
                sub = payload.get("sub")
                if sub:
                    from uuid import UUID
                    from app.models.user import User
                    from app.enums.user_role import UserRole
                    user = db.get(User, UUID(sub))
                    if user and user.role == UserRole.STAFF:
                        return None
        except Exception:
            pass

    middleware = WaitingRoomMiddleware(db)
    return middleware.verify_session(waiting_room_session)