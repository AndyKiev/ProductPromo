from backend.api_v1.promo_type_subtype.promo_type_subtype_messages import (
    PROMO_TYPE_SUBTYPE_CREATE_SUCCESS,
    PROMO_TYPE_SUBTYPE_UPDATE_SUCCESS,
    PROMO_TYPE_SUBTYPE_DELETE_SUCCESS,
)
from backend.api_v1.base.success import DomainSuccess, CreateSuccess, UpdateSuccess, DeleteSuccess


class _PairSuccess(DomainSuccess):
    _msg: dict

    def __init__(self, type_code: str, subtype_code: str) -> None:
        self.template_vars = {"type": type_code, "subtype": subtype_code}
        self.fallback = self._msg["fallback"]
        DomainSuccess.__init__(self, self.fallback)


class PromoTypeSubtypeCreateSuccess(_PairSuccess, CreateSuccess):
    _msg = PROMO_TYPE_SUBTYPE_CREATE_SUCCESS
    message_key = _msg["message_key"]


class PromoTypeSubtypeUpdateSuccess(_PairSuccess, UpdateSuccess):
    _msg = PROMO_TYPE_SUBTYPE_UPDATE_SUCCESS
    message_key = _msg["message_key"]


class PromoTypeSubtypeDeleteSuccess(_PairSuccess, DeleteSuccess):
    _msg = PROMO_TYPE_SUBTYPE_DELETE_SUCCESS
    message_key = _msg["message_key"]
