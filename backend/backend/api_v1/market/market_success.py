from backend.api_v1.market.market_messages import (
    MARKET_CREATE_SUCCESS,
    MARKET_UPDATE_SUCCESS,
    MARKET_DELETE_SUCCESS,
)
from backend.api_v1.base.success import DomainSuccess, DeleteSuccess, CreateSuccess, UpdateSuccess


class MarketCreateSuccess(CreateSuccess):
    message_key = MARKET_CREATE_SUCCESS["message_key"]

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = MARKET_CREATE_SUCCESS["fallback"]
        DomainSuccess.__init__(self, self.fallback)


class MarketUpdateSuccess(UpdateSuccess):
    message_key = MARKET_UPDATE_SUCCESS["message_key"]

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = MARKET_UPDATE_SUCCESS["fallback"]
        DomainSuccess.__init__(self, self.fallback)


class MarketDeleteSuccess(DeleteSuccess):
    message_key = MARKET_DELETE_SUCCESS["message_key"]

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = MARKET_DELETE_SUCCESS["fallback"]
        DomainSuccess.__init__(self, self.fallback)
