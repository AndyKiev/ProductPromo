from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

from pp_common.config import AuthJWT, BrokerConfig, CORSConfig, DbConfig, RunConfig

BASE_DIR = Path(__file__).resolve().parents[2]
KEYS_DIR = BASE_DIR / "backend" / "auth" / "keys"


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
    # Login still lives here until the auth service exists, so this service signs too.
    auth_jwt: AuthJWT = AuthJWT(private_key_path=KEYS_DIR / "jwt-private.pem",
                                public_key_path=KEYS_DIR / "jwt-public.pem")
    broker: BrokerConfig = BrokerConfig(user="catalog")


settings = Settings()
