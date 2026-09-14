from backend.api_v1.nomenclature.nomenclature_messages import (
    NOMENCLATURE_NOT_FOUND,
    NOMENCLATURE_DELETE_ERROR,
)
from backend.api_v1.base.errors import NotFoundError, AlreadyExistsError, DeleteError, DomainError


class NomenclatureNotFound(NotFoundError):
    message_key = NOMENCLATURE_NOT_FOUND["message_key"]

    def __init__(self, id_: int) -> None:
        self.template_vars = {"id": id_}
        self.fallback = NOMENCLATURE_NOT_FOUND["fallback"]
        super().__init__("Nomenclature", "id", id_)


class NomenclatureDeleteError(DeleteError):
    message_key = NOMENCLATURE_DELETE_ERROR["message_key"]

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = NOMENCLATURE_DELETE_ERROR["fallback"]
        DomainError.__init__(self, self.fallback)
