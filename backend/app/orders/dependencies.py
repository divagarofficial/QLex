from uuid import UUID
from fastapi import Depends

from app.auth.dependencies import get_current_user
from app.models.user import User


def get_current_student(
    current_user: User = Depends(get_current_user),
) -> UUID:
    return current_user.id