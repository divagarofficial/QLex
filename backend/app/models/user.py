from sqlalchemy import Boolean, Enum, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import BaseModel
from app.enums.user_role import UserRole
from uuid import UUID


class User(BaseModel):
    __tablename__ = "users"

    register_number: Mapped[str] = mapped_column(
        String(20),
        unique=True,
        nullable=False,
        index=True,
    )

    full_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    phone: Mapped[str] = mapped_column(
        String(15),
        nullable=False,
    )

    email: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    role: Mapped[UserRole] = mapped_column(
        Enum(
            UserRole,
            values_callable=lambda enum: [e.value for e in enum],
            name="user_role",
        ),
        default=UserRole.STUDENT,
        nullable=False,
    )
        

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    department_id: Mapped[str] = mapped_column(
        ForeignKey("departments.id"),
        nullable=False,
    )

    year_id: Mapped[str] = mapped_column(
        ForeignKey("years.id"),
        nullable=False,
    )

    section_id: Mapped[str] = mapped_column(
        ForeignKey("sections.id"),
        nullable=False,
    )

    department = relationship("Department")
    year = relationship("Year")
    section = relationship("Section")

    orders = relationship(
    "Order",
    back_populates="student",
    cascade="all, delete-orphan",
)