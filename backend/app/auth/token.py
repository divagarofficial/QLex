from uuid import UUID

from pydantic import BaseModel


class TokenPayload(BaseModel):
    sub: UUID
    register_number: str
    role: str