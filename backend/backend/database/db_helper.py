from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import (
    create_async_engine,
    AsyncEngine,
    async_sessionmaker,
    AsyncSession,
)
from backend.config.config import settings


class DatabaseHelper:
    def __init__(self, url: str, echo: bool = False) -> None:
        self.engine: AsyncEngine = create_async_engine(
            url=url,
            echo=echo,
            pool_size=10,
            max_overflow=20,
            pool_timeout=60,
            pool_pre_ping=True,
        )
        self.session_factory: async_sessionmaker[AsyncSession] = async_sessionmaker(
            bind=self.engine,
            autoflush=False,
            autocommit=False,
            expire_on_commit=False,
        )

    async def dispose(self) -> None:
        await self.engine.dispose()

    async def session_getter(self) -> AsyncGenerator[AsyncSession, None]:
        async with self.session_factory() as session:
            yield session


db_helper = DatabaseHelper(url=settings.db.url, echo=settings.db.echo)
