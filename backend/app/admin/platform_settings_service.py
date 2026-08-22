from .platform_settings_repository import (
    PlatformSettingsRepository,
)


class PlatformSettingsService:

    def __init__(self, db):
        self.repository = PlatformSettingsRepository(db)

    def get_settings(self):
        settings = self.repository.get_settings()
        if not settings:
            from app.models.platform_setting import PlatformSetting
            settings = PlatformSetting()
            self.repository.db.add(settings)
            self.repository.save()


        extra = dict(settings.extra_settings or {})

        return {
            "platform_fee": settings.platform_fee,
            "priority_fee": settings.priority_fee,
            "max_documents_per_order": settings.max_documents_per_order,
            "max_upload_size_mb": settings.max_upload_size_mb,
            "max_pages_per_document": settings.max_pages_per_document,
            "draft_expiry_hours": settings.draft_expiry_hours,
            "queue_timeout_minutes": settings.queue_timeout_minutes,
            "allow_new_orders": settings.allow_new_orders,
            "maintenance_mode": settings.maintenance_mode,
            "allow_first_year_personal_email": getattr(settings, "allow_first_year_personal_email", True),
            "general": extra.get("general"),
            "platform": extra.get("platform"),
            "orders": extra.get("orders"),
            "notifications": extra.get("notifications"),
            "security": extra.get("security"),
            "integrations": extra.get("integrations"),
            "appearance": extra.get("appearance"),
            "advanced": extra.get("advanced"),
            "about": extra.get("about"),
            "extra_settings": extra,
        }

    def update_settings(
        self,
        request,
    ):
        settings = self.repository.get_settings()
        if not settings:
            from app.models.platform_setting import PlatformSetting
            settings = PlatformSetting()
            self.repository.db.add(settings)

        if request.platform_fee is not None:
            settings.platform_fee = request.platform_fee

        if request.priority_fee is not None:
            settings.priority_fee = request.priority_fee

        if request.max_documents_per_order is not None:
            settings.max_documents_per_order = request.max_documents_per_order

        if request.max_upload_size_mb is not None:
            settings.max_upload_size_mb = request.max_upload_size_mb

        if request.max_pages_per_document is not None:
            settings.max_pages_per_document = request.max_pages_per_document

        if request.draft_expiry_hours is not None:
            settings.draft_expiry_hours = request.draft_expiry_hours

        if request.queue_timeout_minutes is not None:
            settings.queue_timeout_minutes = request.queue_timeout_minutes

        if request.allow_new_orders is not None:
            settings.allow_new_orders = request.allow_new_orders

        if request.maintenance_mode is not None:
            settings.maintenance_mode = request.maintenance_mode

        if hasattr(request, "allow_first_year_personal_email") and getattr(request, "allow_first_year_personal_email", None) is not None:
            settings.allow_first_year_personal_email = request.allow_first_year_personal_email

        current_extra = dict(settings.extra_settings or {})

        sections = [
            "general",
            "platform",
            "orders",
            "notifications",
            "security",
            "integrations",
            "appearance",
            "advanced",
            "about",
        ]
        for sec in sections:
            val = getattr(request, sec, None)
            if val is not None:
                current_extra[sec] = val

        if request.extra_settings is not None:
            current_extra.update(request.extra_settings)

        settings.extra_settings = current_extra
        self.repository.save()

        return self.get_settings()