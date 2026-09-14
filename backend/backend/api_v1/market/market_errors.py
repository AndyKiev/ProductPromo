from backend.api_v1.market.market_messages import (
    MARKET_NOT_FOUND,
    MARKET_NAME_TAKEN,
    MARKET_DELETE_ERROR,
)
from backend.api_v1.base.errors import NotFoundError, AlreadyExistsError, DeleteError, DomainError


class MarketNotFound(NotFoundError):
    message_key = MARKET_NOT_FOUND["message_key"]

    def __init__(self, id_: int) -> None:
        self.template_vars = {"id": id_}
        self.fallback = MARKET_NOT_FOUND["fallback"]
        super().__init__("Market", "id", id_)


class MarketNameTaken(AlreadyExistsError):
    message_key = MARKET_NAME_TAKEN["message_key"]

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = MARKET_NAME_TAKEN["fallback"]
        super().__init__("Market", "name", name)


class MarketDeleteError(DeleteError):
    message_key = MARKET_DELETE_ERROR["message_key"]

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = MARKET_DELETE_ERROR["fallback"]
        DomainError.__init__(self, self.fallback)
