from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    ForeignKey,
    Numeric,
    String,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import BaseModel
from app.enums.order_status import OrderStatus
from app.enums.payment_status import PaymentStatus
from decimal import Decimal
from uuid import UUID
from sqlalchemy import Index



class Order(BaseModel):
    __tablename__ = "orders"

    student_id: Mapped[UUID] = mapped_column(
    ForeignKey("users.id"),
    nullable=False,
)

    shop_name: Mapped[str] = mapped_column(
        String(100),
        default="QLex Central Print Hub",
        nullable=False,
    )

    status: Mapped[OrderStatus] = mapped_column(
        Enum(OrderStatus),
        default=OrderStatus.DRAFT,
        nullable=False,
    )

    payment_status: Mapped[PaymentStatus] = mapped_column(
        Enum(PaymentStatus),
        default=PaymentStatus.PENDING,
        nullable=False,
    )

    is_priority: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    subtotal: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        default=0,
        nullable=False,
    )

    convenience_fee: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        default=0,
        nullable=False,
    )

    platform_fee: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        default=0,
        nullable=False,
    )

    priority_fee: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        default=0,
        nullable=False,
    )

    grand_total: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        default=0,
        nullable=False,
    )

    estimated_completion_time: Mapped[DateTime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    draft_expires_at: Mapped[DateTime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )  
    
    settlement_id: Mapped[UUID | None] = mapped_column(
    ForeignKey("settlements.id"),
    nullable=True,
) 

    student = relationship(
    "User",
    back_populates="orders",
    )

    documents = relationship(
        "OrderDocument",
        back_populates="order",
        cascade="all, delete-orphan",
    )

    __table_args__ = (
    Index("ix_orders_student_id", "student_id"),
    Index("ix_orders_status", "status"),
    Index("ix_orders_payment_status", "payment_status"),
)
    payments = relationship(
    "Payment",
    back_populates="order",
    cascade="all, delete-orphan",
)
    shop_queue = relationship(
    "ShopQueue",
    back_populates="order",
    uselist=False,
)