from backend.api_v1.import_code.import_code_messages import (
    IMPORT_CODE_NOT_FOUND,
    IMPORT_CODE_TAKEN,
    IMPORT_CODE_DELETE_ERROR,
)
from backend.api_v1.base.errors import NotFoundError, AlreadyExistsError, DeleteError, DomainError


class ImportCodeNotFound(NotFoundError):
    message_key = IMPORT_CODE_NOT_FOUND["message_key"]

    def __init__(self, id_: int) -> None:
        self.template_vars = {"id": id_}
        self.fallback = IMPORT_CODE_NOT_FOUND["fallback"]
        super().__init__("Import code", "id", id_)


class ImportCodeTaken(AlreadyExistsError):
    message_key = IMPORT_CODE_TAKEN["message_key"]

    def __init__(self, code: str) -> None:
        self.template_vars = {"code": code}
        self.fallback = IMPORT_CODE_TAKEN["fallback"]
        super().__init__("Import code", "code", code)


class ImportCodeDeleteError(DeleteError):
    message_key = IMPORT_CODE_DELETE_ERROR["message_key"]

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = IMPORT_CODE_DELETE_ERROR["fallback"]
        DomainError.__init__(self, self.fallback)
