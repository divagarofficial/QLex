import os
from urllib.parse import quote_plus

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

db_url_env = os.getenv("DATABASE_URL")
if db_url_env:
    if db_url_env.startswith("postgresql://"):
        DATABASE_URL = db_url_env.replace("postgresql://", "postgresql+psycopg2://", 1)
    else:
        DATABASE_URL = db_url_env
else:
    password = quote_plus(settings.DB_PASSWORD)
    DATABASE_URL = (
        f"postgresql+psycopg2://{settings.DB_USER}:"
        f"{password}@"
        f"{settings.DB_HOST}:"
        f"{settings.DB_PORT}/"
        f"{settings.DB_NAME}"
    )

engine = create_engine(
    DATABASE_URL,
    echo=settings.DEBUG,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    pool_recycle=300,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


_tables_initialized = False


def init_db_tables():
    global _tables_initialized
    if not _tables_initialized:
        try:
            from app.db.base import Base
            import app.models  # noqa: F401

            Base.metadata.create_all(bind=engine)

            try:
                with engine.connect() as conn:
                    from sqlalchemy import text
                    conn.execute(text("ALTER TABLE platform_settings ADD COLUMN IF NOT EXISTS allow_first_year_personal_email BOOLEAN DEFAULT TRUE NOT NULL;"))
                    conn.execute(text("ALTER TABLE order_documents ADD COLUMN IF NOT EXISTS custom_pages VARCHAR(255);"))
                    conn.execute(text("ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_guest_order BOOLEAN DEFAULT FALSE NOT NULL;"))
                    conn.execute(text("ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_phone VARCHAR(20);"))
                    conn.execute(text("ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_name VARCHAR(100);"))
                    conn.execute(text("ALTER TABLE orders ADD COLUMN IF NOT EXISTS shop_slug VARCHAR(100) DEFAULT 'rit';"))
                    try:
                        conn.execute(text("ALTER TABLE orders ALTER COLUMN student_id DROP NOT NULL;"))
                    except Exception:
                        pass
                    try:
                        conn.execute(text("ALTER TYPE queuetype ADD VALUE IF NOT EXISTS 'satellite';"))
                        conn.execute(text("ALTER TYPE queuetype ADD VALUE IF NOT EXISTS 'SATELLITE';"))
                    except Exception:
                        pass
                    conn.commit()
            except Exception as mig_err:
                print(f"[DB Init Warning] Column migration warning: {mig_err}")

            db = SessionLocal()
            try:
                from app.seeds.departments import seed_departments
                from app.seeds.years import seed_years
                from app.seeds.sections import seed_sections
                from app.seeds.seed_services import seed_services
                from app.seeds.seed_platform_settings import seed_platform_settings
                from app.seeds.seed_pricing import seed_pricing
                from app.seeds.seed_shops import seed_shops

                for seed_fn in [
                    seed_departments,
                    seed_years,
                    seed_sections,
                    seed_services,
                    seed_platform_settings,
                    seed_pricing,
                    seed_shops,
                ]:
                    try:
                        seed_fn(db)
                    except Exception as s_err:
                        db.rollback()
                        print(f"[DB Init Warning] Seeder {seed_fn.__name__} warning: {s_err}")
            finally:
                db.close()
            _tables_initialized = True
        except Exception as e:
            print(f"[DB Init Warning] Table creation failed: {e}")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()