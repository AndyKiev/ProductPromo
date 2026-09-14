from backend.api_v1.tax_type.tax_type_messages import (
    TAX_TYPE_NOT_FOUND,
    TAX_TYPE_CODE_TAKEN,
    TAX_TYPE_DELETE_ERROR,
)
from backend.api_v1.base.errors import NotFoundError, AlreadyExistsError, DeleteError, DomainError


class TaxTypeNotFound(NotFoundError):
    message_key = TAX_TYPE_NOT_FOUND["message_key"]

    def __init__(self, id_: int) -> None:
        self.template_vars = {"id": id_}
        self.fallback = TAX_TYPE_NOT_FOUND["fallback"]
        super().__init__("Tax type", "id", id_)


class TaxTypeCodeTaken(AlreadyExistsError):
    message_key = TAX_TYPE_CODE_TAKEN["message_key"]

    def __init__(self, code: str) -> None:
        self.template_vars = {"code": code}
        self.fallback = TAX_TYPE_CODE_TAKEN["fallback"]
        super().__init__("Tax type", "code", code)


class TaxTypeDeleteError(DeleteError):
    message_key = TAX_TYPE_DELETE_ERROR["message_key"]

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = TAX_TYPE_DELETE_ERROR["fallback"]
        DomainError.__init__(self, self.fallback)
