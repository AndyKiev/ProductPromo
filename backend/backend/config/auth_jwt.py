from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parents[2]


class AuthJWT(BaseModel):
    private_key_path: Path = BASE_DIR / "backend" / "auth" / "keys" / "jwt-private.pem"
    public_key_path: Path = BASE_DIR / "backend" / "auth" / "keys" / "jwt-public.pem"
    algorithm: str = "RS256"
    access_token_expire_minutes: int = 60
