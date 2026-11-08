"""This service is the token issuer (until the auth service exists), so it
publishes the identity state other ProductPromo projects need on exchange
`identity` (contract: broker repo AGENTS.md, models: pp_common.messaging):

- its public signing key (with key id = the tokens' `kid`), and
- its language list (these ids are THE language ids everywhere).

It publishes on every (re)connect and whenever a consumer sends
`identity.sync.requested`. Nothing here is needed for this service to run:
if RabbitMQ is down, HTTP keeps working and the runner retries.
"""
import logging

from faststream.rabbit import RabbitQueue
from pp_common.auth import key_id
from pp_common.messaging import (
    IDENTITY_EXCHANGE, LANGUAGES_PUBLISHED, SIGNING_KEY_PUBLISHED, SYNC_REQUESTED,
    BrokerRunner, IdentitySyncRequested, LanguageInfo, LanguagesPublished, SigningKeyPublished,
)

from backend.config.config import settings

logger = logging.getLogger(__name__)
ISSUER = "catalog"

runner = BrokerRunner(settings.broker.url, service=ISSUER)


def signing_key_event() -> SigningKeyPublished:
    pem = settings.auth_jwt.public_key_path.read_text()
    return SigningKeyPublished(key_id=key_id(pem), algorithm=settings.auth_jwt.algorithm,
                               public_key_pem=pem, issuer=ISSUER)


async def languages_event() -> LanguagesPublished:
    from backend.api_v1.lang.lang_repository import LangRepository
    from backend.database.db_helper import db_helper
    async with db_helper.session_factory() as session:
        langs = await LangRepository(session).get_all()
    return LanguagesPublished(issuer=ISSUER, languages=[
        LanguageInfo(id=lang.id, short_name=lang.short_name, name=lang.name, locale=lang.locale) for lang in langs])


@runner.on_connected
async def publish_identity() -> None:
    await runner.publish(signing_key_event(), IDENTITY_EXCHANGE, SIGNING_KEY_PUBLISHED)
    await runner.publish(await languages_event(), IDENTITY_EXCHANGE, LANGUAGES_PUBLISHED)
    logger.info("identity published (signing key + languages)")


@runner.broker.subscriber(RabbitQueue("catalog.identity-sync", durable=True, routing_key=SYNC_REQUESTED),
                          IDENTITY_EXCHANGE)
async def on_sync_requested(request: IdentitySyncRequested) -> None:
    logger.info("identity sync requested by %s", request.requester)
    await publish_identity()
