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

    # DECENTRO
    DECENTRO_CLIENT_ID: str = "x4uza8c6z15dqu0xshag9"
    DECENTRO_CLIENT_SECRET: str = "ceL5WH5fwE7TEiqR7JQ4Ue6dNzUowjFz"
    DECENTRO_MASTER_CONSUMER_URN: str = "C0075CA91787425F9BF0A601650416D8"
    DECENTRO_BASE_URL: str = "https://in.staging.decentro.tech"

    # DIRECTPAY AIRTEL PAYMENTS BANK CONFIG
    DIRECTPAY_UPI_ID: str = "thirudiva@upi"
    DIRECTPAY_PAYEE_NAME: str = "MINDURA TECHNOLOGIES"
    DIRECTPAY_ACCOUNT_NUMBER: str = "9360087608"
    DIRECTPAY_IFSC_CODE: str = "AIRP0000001"

    # WHATSAPP MICROSERVICE
    WHATSAPP_BOT_URL: str = "http://localhost:5001"

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )


settings = Settings()