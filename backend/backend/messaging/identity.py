"""This service on RabbitMQ (contract: broker repo AGENTS.md, models: pp_common.messaging).

Publishes on exchange `identity`: its language list (these ids are THE language ids
everywhere), on every (re)connect and whenever a consumer sends `identity.sync.requested`.

Consumes exchange `employee`: the employee service's employees and jobs, into this
app's own copy (queues `catalog.employee-employees`, `catalog.employee-jobs`); login
reads that copy. No signing key travels: every app logs its users in itself.

Nothing here is needed for this service to run: if RabbitMQ is down, HTTP keeps
working and the runner retries.
"""
import logging

from faststream.rabbit import RabbitQueue
from pp_common.messaging import (
    IDENTITY_EXCHANGE, LANGUAGES_PUBLISHED, SYNC_REQUESTED,
    BrokerRunner, IdentitySyncRequested, LanguageInfo, LanguagesPublished,
)

from backend.config.config import settings

logger = logging.getLogger(__name__)
ISSUER = "catalog"

runner = BrokerRunner(settings.broker.url, service=ISSUER)


async def languages_event() -> LanguagesPublished:
    from backend.api_v1.lang.lang_repository import LangRepository
    from backend.database.db_helper import db_helper
    async with db_helper.session_factory() as session:
        langs = await LangRepository(session).get_all()
    return LanguagesPublished(issuer=ISSUER, languages=[
        LanguageInfo(id=lang.id, short_name=lang.short_name, name=lang.name, locale=lang.locale) for lang in langs])


@runner.on_connected
async def publish_identity() -> None:
    await runner.publish(await languages_event(), IDENTITY_EXCHANGE, LANGUAGES_PUBLISHED)
    logger.info("languages published")


@runner.broker.subscriber(RabbitQueue("catalog.identity-sync", durable=True, routing_key=SYNC_REQUESTED),
                          IDENTITY_EXCHANGE)
async def on_sync_requested(request: IdentitySyncRequested) -> None:
    logger.info("identity sync requested by %s", request.requester)
    await publish_identity()


def _register_employees() -> None:
    from pp_common.employees import register_employee_replica
    from backend.api_v1.employee.employee_model import Employee, Job
    from backend.database.db_helper import db_helper
    register_employee_replica(runner, ISSUER, db_helper.session_factory, Employee, Job)


_register_employees()
