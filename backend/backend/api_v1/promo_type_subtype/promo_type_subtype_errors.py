from backend.api_v1.promo_type_subtype.promo_type_subtype_messages import (
    PROMO_TYPE_SUBTYPE_NOT_FOUND,
    PROMO_TYPE_SUBTYPE_TAKEN,
)
from backend.api_v1.base.errors import NotFoundError, AlreadyExistsError


class PromoTypeSubtypeNotFound(NotFoundError):
    message_key = PROMO_TYPE_SUBTYPE_NOT_FOUND["message_key"]

    def __init__(self, id_: int) -> None:
        self.template_vars = {"id": id_}
        self.fallback = PROMO_TYPE_SUBTYPE_NOT_FOUND["fallback"]
        super().__init__("Promo type subtype", "id", id_)


class PromoTypeSubtypeTaken(AlreadyExistsError):
    message_key = PROMO_TYPE_SUBTYPE_TAKEN["message_key"]

    def __init__(self, type_code: str, subtype_code: str) -> None:
        self.template_vars = {"type": type_code, "subtype": subtype_code}
        self.fallback = PROMO_TYPE_SUBTYPE_TAKEN["fallback"]
        super().__init__("Promo type subtype", "pair", f"{type_code}/{subtype_code}")
