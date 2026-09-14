from backend.api_v1.ean.ean_messages import (
    EAN_NOT_FOUND,
    EAN_TAKEN,
    EAN_DELETE_ERROR,
)
from backend.api_v1.base.errors import NotFoundError, AlreadyExistsError, DeleteError, DomainError


class EanNotFound(NotFoundError):
    message_key = EAN_NOT_FOUND["message_key"]

    def __init__(self, id_: int) -> None:
        self.template_vars = {"id": id_}
        self.fallback = EAN_NOT_FOUND["fallback"]
        super().__init__("EAN", "id", id_)


class EanTaken(AlreadyExistsError):
    message_key = EAN_TAKEN["message_key"]

    def __init__(self, ean: str) -> None:
        self.template_vars = {"ean": ean}
        self.fallback = EAN_TAKEN["fallback"]
        super().__init__("EAN", "ean", ean)


class EanDeleteError(DeleteError):
    message_key = EAN_DELETE_ERROR["message_key"]

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = EAN_DELETE_ERROR["fallback"]
        DomainError.__init__(self, self.fallback)
