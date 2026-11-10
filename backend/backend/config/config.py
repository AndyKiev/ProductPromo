from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

from pp_common.config import AuthJWT, BrokerConfig, CORSConfig, DbConfig, LdapConfig, RunConfig

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
    # This app logs its users in itself: own keys, tokens for audience "catalog" only.
    auth_jwt: AuthJWT = AuthJWT(private_key_path=KEYS_DIR / "jwt-private.pem",
                                public_key_path=KEYS_DIR / "jwt-public.pem", audience="catalog")
    # LDAP like talent; APP_CONFIG__LDAP__BYPASS=true only in dev (stack.env / .env).
    ldap: LdapConfig = LdapConfig()
    broker: BrokerConfig = BrokerConfig(user="catalog")


settings = Settings()
