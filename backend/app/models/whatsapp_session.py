from sqlalchemy import Column, String, DateTime, Text
from sqlalchemy.sql import func
from app.db.base import Base


class WhatsAppSession(Base):
    __tablename__ = "whatsapp_sessions"

    session_id = Column(String(50), primary_key=True, default="default")
    session_data = Column(Text, nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
