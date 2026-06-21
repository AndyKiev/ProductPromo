from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

from backend.config.run_config import RunConfig
from backend.config.db_config import DbConfig
from backend.config.cors_config import CORSConfig
from backend.config.auth_jwt import AuthJWT

BASE_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        case_sensitive=False,
        env_nested_delimiter="__",
        env_prefix="APP_CONFIG__",
        extra="ignore",
    )
    api_v1_prefix: str = "/api/v1"
    run: RunConfig = RunConfig()
    db: DbConfig = DbConfig()
    cors: CORSConfig = CORSConfig()
    auth_jwt: AuthJWT = AuthJWT()


settings = Settings()
