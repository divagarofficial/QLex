from uuid import UUID

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.common.exceptions import InvalidCredentialsException
from app.core.config import settings
from app.db.database import get_db
from app.models.user import User

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:

    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )

        user_id = UUID(payload["sub"])

    except (JWTError, KeyError, ValueError):
        raise InvalidCredentialsException()

    user = db.get(User, user_id)

    if user is None:
        raise InvalidCredentialsException()

    return user