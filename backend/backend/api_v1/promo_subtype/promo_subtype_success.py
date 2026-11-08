from backend.api_v1.promo_subtype.promo_subtype_messages import (
    PROMO_SUBTYPE_CREATE_SUCCESS,
    PROMO_SUBTYPE_UPDATE_SUCCESS,
    PROMO_SUBTYPE_DELETE_SUCCESS,
)
from backend.api_v1.base.success import DomainSuccess, DeleteSuccess, CreateSuccess, UpdateSuccess


class PromoSubtypeCreateSuccess(CreateSuccess):
    message_key = PROMO_SUBTYPE_CREATE_SUCCESS["message_key"]

    def __init__(self, code: str) -> None:
        self.template_vars = {"code": code}
        self.fallback = PROMO_SUBTYPE_CREATE_SUCCESS["fallback"]
        DomainSuccess.__init__(self, self.fallback)


class PromoSubtypeUpdateSuccess(UpdateSuccess):
    message_key = PROMO_SUBTYPE_UPDATE_SUCCESS["message_key"]

    def __init__(self, code: str) -> None:
        self.template_vars = {"code": code}
        self.fallback = PROMO_SUBTYPE_UPDATE_SUCCESS["fallback"]
        DomainSuccess.__init__(self, self.fallback)


class PromoSubtypeDeleteSuccess(DeleteSuccess):
    message_key = PROMO_SUBTYPE_DELETE_SUCCESS["message_key"]

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = PROMO_SUBTYPE_DELETE_SUCCESS["fallback"]
        DomainSuccess.__init__(self, self.fallback)
