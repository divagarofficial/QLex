import logging
from sqlalchemy import text
from app.db.database import engine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def migrate():
    with engine.connect() as conn:
        logger.info("Checking platform_settings table schema...")
        
        # Add allow_first_year_personal_email column to platform_settings if missing
        conn.execute(
            text("""
                ALTER TABLE platform_settings 
                ADD COLUMN IF NOT EXISTS allow_first_year_personal_email BOOLEAN DEFAULT TRUE NOT NULL;
            """)
        )
        conn.commit()
        logger.info("Successfully ensured allow_first_year_personal_email column in platform_settings table!")

if __name__ == "__main__":
    migrate()
