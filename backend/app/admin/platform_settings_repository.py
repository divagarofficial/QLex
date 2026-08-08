from sqlalchemy.orm import Session

from app.models.platform_setting import PlatformSetting


class PlatformSettingsRepository:

    def __init__(self, db: Session):
        self.db = db

    def get_settings(self):

        return (

            self.db.query(
                PlatformSetting
            )

            .first()

        )

    def save(self):

        self.db.commit()