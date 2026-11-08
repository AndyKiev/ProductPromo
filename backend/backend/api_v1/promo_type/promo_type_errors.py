from backend.api_v1.promo_type.promo_type_messages import (
    PROMO_TYPE_NOT_FOUND,
    PROMO_TYPE_TAKEN,
    PROMO_TYPE_DELETE_ERROR,
)
from backend.api_v1.base.errors import NotFoundError, AlreadyExistsError, DeleteError, DomainError


class PromoTypeNotFound(NotFoundError):
    message_key = PROMO_TYPE_NOT_FOUND["message_key"]

    def __init__(self, id_: int) -> None:
        self.template_vars = {"id": id_}
        self.fallback = PROMO_TYPE_NOT_FOUND["fallback"]
        super().__init__("Promo type", "id", id_)


class PromoTypeTaken(AlreadyExistsError):
    message_key = PROMO_TYPE_TAKEN["message_key"]

    def __init__(self, code: str) -> None:
        self.template_vars = {"code": code}
        self.fallback = PROMO_TYPE_TAKEN["fallback"]
        super().__init__("Promo type", "code", code)


class PromoTypeDeleteError(DeleteError):
    message_key = PROMO_TYPE_DELETE_ERROR["message_key"]

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = PROMO_TYPE_DELETE_ERROR["fallback"]
        DomainError.__init__(self, self.fallback)
