from backend.api_v1.nomenclature_key.nomenclature_key_messages import (
    NOMENCLATURE_KEY_NOT_FOUND,
    NOMENCLATURE_KEY_NAME_TAKEN,
    NOMENCLATURE_KEY_DELETE_ERROR,
)
from backend.api_v1.base.errors import NotFoundError, AlreadyExistsError, DeleteError, DomainError


class NomenclatureKeyNotFound(NotFoundError):
    message_key = NOMENCLATURE_KEY_NOT_FOUND["message_key"]

    def __init__(self, id_: int) -> None:
        self.template_vars = {"id": id_}
        self.fallback = NOMENCLATURE_KEY_NOT_FOUND["fallback"]
        super().__init__("NomenclatureKey", "id", id_)


class NomenclatureKeyNameTaken(AlreadyExistsError):
    message_key = NOMENCLATURE_KEY_NAME_TAKEN["message_key"]

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = NOMENCLATURE_KEY_NAME_TAKEN["fallback"]
        super().__init__("NomenclatureKey", "name", name)


class NomenclatureKeyDeleteError(DeleteError):
    message_key = NOMENCLATURE_KEY_DELETE_ERROR["message_key"]

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = NOMENCLATURE_KEY_DELETE_ERROR["fallback"]
        DomainError.__init__(self, self.fallback)
