from backend.api_v1.family.family_messages import (
    FAMILY_NOT_FOUND,
    FAMILY_NAME_TAKEN,
    FAMILY_DELETE_ERROR,
)
from backend.api_v1.base.errors import NotFoundError, AlreadyExistsError, DeleteError, DomainError


class FamilyNotFound(NotFoundError):
    message_key = FAMILY_NOT_FOUND["message_key"]

    def __init__(self, id_: int) -> None:
        self.template_vars = {"id": id_}
        self.fallback = FAMILY_NOT_FOUND["fallback"]
        super().__init__("Family", "id", id_)


class FamilyNameTaken(AlreadyExistsError):
    message_key = FAMILY_NAME_TAKEN["message_key"]

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = FAMILY_NAME_TAKEN["fallback"]
        super().__init__("Family", "name", name)


class FamilyDeleteError(DeleteError):
    message_key = FAMILY_DELETE_ERROR["message_key"]

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = FAMILY_DELETE_ERROR["fallback"]
        DomainError.__init__(self, self.fallback)
