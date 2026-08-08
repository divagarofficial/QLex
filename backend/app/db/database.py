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
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()