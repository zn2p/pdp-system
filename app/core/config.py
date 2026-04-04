from pydantic import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "pdp-system"
    DATABASE_URL: str = "sqlite:///./dev.db"


settings = Settings()
