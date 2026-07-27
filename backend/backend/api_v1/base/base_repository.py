from typing import Optional
from sqlalchemy import select, asc, desc
from sqlalchemy.ext.asyncio import AsyncSession


class BaseRepository:
    """Minimal async repository. Subclasses set `model`."""
    model = None

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create(self, instance):
        self.session.add(instance)
        await self.session.commit()
        await self.session.refresh(instance)
        return instance

    async def get_by_id(self, id):
        return await self.session.get(self.model, id)

    async def get_all(self, filters: Optional[dict] = None, sort: Optional[str] = None):
        stmt = select(self.model)
        if filters:
            for key, value in filters.items():
                stmt = stmt.where(getattr(self.model, key) == value)
        if sort:
            col = sort.lstrip("-")
            if hasattr(self.model, col):
                column = getattr(self.model, col)
                stmt = stmt.order_by(desc(column) if sort.startswith("-") else asc(column))
        res = await self.session.execute(stmt)
        return res.scalars().all()

    async def update(self, instance, data: dict):
        for key, value in data.items():
            setattr(instance, key, value)
        await self.session.commit()
        await self.session.refresh(instance)
        return instance

    async def delete(self, instance):
        await self.session.delete(instance)
        await self.session.commit()

    async def exists_by_name(self, name, exclude_id: Optional[int] = None) -> bool:
        stmt = select(self.model).where(getattr(self.model, "name") == name)
        if exclude_id is not None:
            stmt = stmt.where(getattr(self.model, "id") != exclude_id)
        res = await self.session.execute(stmt)
        return res.scalars().first() is not None
