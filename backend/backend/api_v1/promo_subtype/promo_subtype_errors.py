from backend.api_v1.promo_subtype.promo_subtype_messages import (
    PROMO_SUBTYPE_NOT_FOUND,
    PROMO_SUBTYPE_TAKEN,
    PROMO_SUBTYPE_DELETE_ERROR,
)
from backend.api_v1.base.errors import NotFoundError, AlreadyExistsError, DeleteError, DomainError


class PromoSubtypeNotFound(NotFoundError):
    message_key = PROMO_SUBTYPE_NOT_FOUND["message_key"]

    def __init__(self, id_: int) -> None:
        self.template_vars = {"id": id_}
        self.fallback = PROMO_SUBTYPE_NOT_FOUND["fallback"]
        super().__init__("Promo subtype", "id", id_)


class PromoSubtypeTaken(AlreadyExistsError):
    message_key = PROMO_SUBTYPE_TAKEN["message_key"]

    def __init__(self, code: str) -> None:
        self.template_vars = {"code": code}
        self.fallback = PROMO_SUBTYPE_TAKEN["fallback"]
        super().__init__("Promo subtype", "code", code)


class PromoSubtypeDeleteError(DeleteError):
    message_key = PROMO_SUBTYPE_DELETE_ERROR["message_key"]

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = PROMO_SUBTYPE_DELETE_ERROR["fallback"]
        DomainError.__init__(self, self.fallback)
