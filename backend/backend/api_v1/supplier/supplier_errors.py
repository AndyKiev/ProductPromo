from backend.api_v1.supplier.supplier_messages import (
    SUPPLIER_NOT_FOUND,
    SUPPLIER_CODE_TAKEN,
    SUPPLIER_DELETE_ERROR,
)
from backend.api_v1.base.errors import NotFoundError, AlreadyExistsError, DeleteError, DomainError


class SupplierNotFound(NotFoundError):
    message_key = SUPPLIER_NOT_FOUND["message_key"]

    def __init__(self, id_: int) -> None:
        self.template_vars = {"id": id_}
        self.fallback = SUPPLIER_NOT_FOUND["fallback"]
        super().__init__("Supplier", "id", id_)


class SupplierCodeTaken(AlreadyExistsError):
    message_key = SUPPLIER_CODE_TAKEN["message_key"]

    def __init__(self, code: str) -> None:
        self.template_vars = {"code": code}
        self.fallback = SUPPLIER_CODE_TAKEN["fallback"]
        super().__init__("Supplier", "code", code)


class SupplierDeleteError(DeleteError):
    message_key = SUPPLIER_DELETE_ERROR["message_key"]

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = SUPPLIER_DELETE_ERROR["fallback"]
        DomainError.__init__(self, self.fallback)
