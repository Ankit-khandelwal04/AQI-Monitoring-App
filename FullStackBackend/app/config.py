from pydantic_settings import BaseSettings


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
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
