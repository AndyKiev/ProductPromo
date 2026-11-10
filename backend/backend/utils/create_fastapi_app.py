"""This service's app: the shared pp_common factory plus our own lifespan
(tables, seeds, catalog warm-up, RabbitMQ identity publisher)."""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from pp_common.web import create_app as create_service_app

from backend.api_v1.msg.catalog import catalog_cache  # registers the catalog for pp_common
from backend.config.config import settings
from backend.messaging.identity import runner as broker_runner


@asynccontextmanager
async def lifespan(app: FastAPI):
    from backend.database.init_db import init_db, seed_status_types
    await init_db()
    await seed_status_types()
    from backend.api_v1.msg.msg_seed import seed_translations
    await seed_translations()
    await catalog_cache.get(force=True)
    # RabbitMQ is optional at startup: connects in the background, retries, re-announces.
    broker_runner.start()
    yield
    await broker_runner.stop()


def create_app() -> FastAPI:
    return create_service_app(title="catalog API", cors=settings.cors, lifespan=lifespan)
