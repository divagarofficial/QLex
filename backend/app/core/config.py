from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "QLex API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    BACKEND_URL: str = ""

    # Database
    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_NAME: str = "postgres"
    DB_USER: str = "postgres"
    DB_PASSWORD: str = ""

    # JWT
    SECRET_KEY: str = "qlex_super_secret_jwt_key_2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 525600  # 1 Year persistent sessions

    # RAZORPAY
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""
    RAZORPAY_WEBHOOK_SECRET: str = ""

    # WHATSAPP MICROSERVICE
    WHATSAPP_BOT_URL: str = "http://localhost:5001"

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )


settings = Settings()