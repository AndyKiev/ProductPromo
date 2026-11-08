from backend.api_v1.promo_type.promo_type_messages import (
    PROMO_TYPE_CREATE_SUCCESS,
    PROMO_TYPE_UPDATE_SUCCESS,
    PROMO_TYPE_DELETE_SUCCESS,
)
from backend.api_v1.base.success import DomainSuccess, DeleteSuccess, CreateSuccess, UpdateSuccess


class PromoTypeCreateSuccess(CreateSuccess):
    message_key = PROMO_TYPE_CREATE_SUCCESS["message_key"]

    def __init__(self, code: str) -> None:
        self.template_vars = {"code": code}
        self.fallback = PROMO_TYPE_CREATE_SUCCESS["fallback"]
        DomainSuccess.__init__(self, self.fallback)


class PromoTypeUpdateSuccess(UpdateSuccess):
    message_key = PROMO_TYPE_UPDATE_SUCCESS["message_key"]

    def __init__(self, code: str) -> None:
        self.template_vars = {"code": code}
        self.fallback = PROMO_TYPE_UPDATE_SUCCESS["fallback"]
        DomainSuccess.__init__(self, self.fallback)


class PromoTypeDeleteSuccess(DeleteSuccess):
    message_key = PROMO_TYPE_DELETE_SUCCESS["message_key"]

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = PROMO_TYPE_DELETE_SUCCESS["fallback"]
        DomainSuccess.__init__(self, self.fallback)
