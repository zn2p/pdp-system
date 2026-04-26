from pydantic import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "pdp-system"
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    DATABASE_URL: str = "sqlite:///./pdp.db"

    class Config:
        env_file = ".env"


settings = Settings()
