from backend.api_v1.supplier_status.supplier_status_messages import (
    SUPPLIER_STATUS_NOT_FOUND,
    SUPPLIER_STATUS_CODE_TAKEN,
    SUPPLIER_STATUS_DELETE_ERROR,
)
from backend.api_v1.base.errors import NotFoundError, AlreadyExistsError, DeleteError, DomainError


class SupplierStatusNotFound(NotFoundError):
    message_key = SUPPLIER_STATUS_NOT_FOUND["message_key"]

    def __init__(self, id_: int) -> None:
        self.template_vars = {"id": id_}
        self.fallback = SUPPLIER_STATUS_NOT_FOUND["fallback"]
        super().__init__("Supplier status", "id", id_)


class SupplierStatusCodeTaken(AlreadyExistsError):
    message_key = SUPPLIER_STATUS_CODE_TAKEN["message_key"]

    def __init__(self, code: str) -> None:
        self.template_vars = {"code": code}
        self.fallback = SUPPLIER_STATUS_CODE_TAKEN["fallback"]
        super().__init__("Supplier status", "code", code)


class SupplierStatusDeleteError(DeleteError):
    message_key = SUPPLIER_STATUS_DELETE_ERROR["message_key"]

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = SUPPLIER_STATUS_DELETE_ERROR["fallback"]
        DomainError.__init__(self, self.fallback)
