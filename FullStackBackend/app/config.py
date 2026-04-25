from pydantic_settings import BaseSettings
import warnings


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/aqi_db"

    # JWT
    SECRET_KEY: str = "change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Google Maps
    GOOGLE_MAPS_API_KEY: str = ""

    # App
    APP_ENV: str = "development"
    APP_NAME: str = "AQI Monitoring API"
    APP_VERSION: str = "1.0.0"
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:19006,exp://localhost:8081"

    @property
    def allowed_origins_list(self) -> list[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip() and o.strip() != "*"]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()

# Warn if insecure defaults are used
if settings.SECRET_KEY == "change-this-in-production":
    warnings.warn(
        "⚠️  SECRET_KEY is set to the default insecure value. "
        "Set a strong SECRET_KEY in your .env file before deploying to production!",
        stacklevel=2,
    )
