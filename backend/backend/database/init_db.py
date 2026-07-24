"""One-shot table creation via SQLAlchemy metadata (no alembic).

Import this module *after* all models have been registered against
`backend.api_v1.base.base_model.Base.metadata`. It calls
`Base.metadata.create_all()` against the configured async engine.

The physical column names come from the first argument of
`mapped_column("RealName", ...)` in each model — no schema migration,
just initial DDL for the legacy-shaped tables.
"""
from sqlalchemy import text
from backend.api_v1.base.base_model import Base
from backend.database.db_helper import db_helper


async def init_db() -> None:
    """Create all tables declared in the metadata (idempotent)."""
    async with db_helper.engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def seed_status_types() -> None:
    """Insert default status types (Active, Inactive) if the table is empty."""
    async with db_helper.session_factory() as session:
        async with session.begin():
            count = await session.execute(text("SELECT COUNT(*) FROM statustype"))
            if count.scalar() == 0:
                await session.execute(text(
                    "INSERT INTO statustype (\"Id\", \"StatusTypeName\", \"NameU\", \"NameE\") VALUES "
                    "(1, 'active', 'Активний', 'Active'), "
                    "(2, 'inactive', 'Неактивний', 'Inactive')"
                ))


# Explicitly import every model so its table is registered in Base.metadata.
# (flake8 will complain about unused imports — keep them.)
import backend.api_v1.status_type.status_type_model  # noqa: F401,E402
import backend.api_v1.market.market_model  # noqa: F401,E402
import backend.api_v1.segment.segment_model  # noqa: F401,E402
import backend.api_v1.category.category_model  # noqa: F401,E402
import backend.api_v1.family.family_model  # noqa: F401,E402
import backend.api_v1.nomenclature_key.nomenclature_key_model  # noqa: F401,E402
import backend.api_v1.nomenclature.nomenclature_model  # noqa: F401,E402
