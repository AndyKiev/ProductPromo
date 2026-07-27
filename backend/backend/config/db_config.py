from pydantic import BaseModel


class DbConfig(BaseModel):
    """Database connection — parametrized driver (mysql+aiomysql / postgresql+asyncpg)."""
    driver: str = "postgresql+asyncpg"
    host: str = "127.0.0.1"
    port: int = 5432
    user: str = "productpromo"
    password: str = "productpromo"
    name: str = "productpromo"
    echo: bool = False

    @property
    def url(self) -> str:
        if self.driver.startswith("mysql"):
            return (
                f"{self.driver}://{self.user}:{self.password}"
                f"@{self.host}:{self.port}/{self.name}?charset=utf8mb4"
            )
        else:
            return (
                f"{self.driver}://{self.user}:{self.password}"
                f"@{self.host}:{self.port}/{self.name}"
            )
