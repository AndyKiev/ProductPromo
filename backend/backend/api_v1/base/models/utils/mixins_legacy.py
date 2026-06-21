"""Mixins for LEGACY MySQL tables whose column names don't match the
clean conventions used by IntIdPkMixin / TimestampMixin.

These are deliberately not-nice: they exist only so we can map onto the
existing physical schema without altering the live DB. New-DB models will
use the clean mixins instead.
"""
from datetime import datetime
from sqlalchemy import DateTime, Integer, func
from sqlalchemy.orm import Mapped, mapped_column


class LegacyCreatedAtMixin:
    """Legacy `CreaDT` / `CreaDt` created-timestamp column (no updated_at)."""
    created_at: Mapped[datetime] = mapped_column(
        "CreaDt", DateTime, server_default=func.now()
    )


class LegacyAuthorMixin:
    """Legacy author column `UserId` (stamped from the current employee)."""
    user_id: Mapped[int | None] = mapped_column("UserId", Integer, nullable=True)
