from pydantic import BaseModel


class DbConfig(BaseModel):
    """Legacy MySQL connection (read/write existing tables, no schema changes)."""
    driver: str = "mysql+aiomysql"
    host: str = "127.0.0.1"
    port: int = 3306
    user: str = "root"
    password: str = ""
    name: str = "aula"
    echo: bool = False

    @property
    def url(self) -> str:
        return (
            f"{self.driver}://{self.user}:{self.password}"
            f"@{self.host}:{self.port}/{self.name}?charset=utf8mb4"
        )
