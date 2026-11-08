from pp_common.db import DatabaseHelper

from backend.config.config import settings

db_helper = DatabaseHelper(url=settings.db.url, echo=settings.db.echo)
