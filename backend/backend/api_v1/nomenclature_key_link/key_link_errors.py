from backend.api_v1.nomenclature_key_link.nomenclature_key_link_messages import (
    KEY_LINK_NOT_FOUND,
    KEY_LINK_DELETE_ERROR,
)
from backend.api_v1.base.errors import NotFoundError, DeleteError, DomainError


class KeyLinkNotFound(NotFoundError):
    message_key = KEY_LINK_NOT_FOUND["message_key"]

    def __init__(self, level: int, id_: int) -> None:
        self.template_vars = {"level": level, "id": id_}
        self.fallback = KEY_LINK_NOT_FOUND["fallback"]
        super().__init__("KeyLink", "id", id_)


class KeyLinkDeleteError(DeleteError):
    message_key = KEY_LINK_DELETE_ERROR["message_key"]

    def __init__(self, level: int, id_: int) -> None:
        self.template_vars = {"level": level, "id": id_}
        self.fallback = KEY_LINK_DELETE_ERROR["fallback"]
        DomainError.__init__(self, self.fallback)
