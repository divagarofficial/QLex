from decimal import Decimal

from sqlalchemy.orm import Session

from app.models.platform_setting import PlatformSetting


def seed_platform_settings(db: Session):

    exists = db.query(PlatformSetting).first()

    if exists:
        return

    db.add(
        PlatformSetting(
            platform_fee=Decimal("2.00"),
            priority_fee=Decimal("5.00"),
            max_documents_per_order=20,
            max_upload_size_mb=50,
            max_pages_per_document=1000,
            draft_expiry_hours=24,
            queue_timeout_minutes=10,
            allow_new_orders=True,
            maintenance_mode=False,
        )
    )

    db.commit()