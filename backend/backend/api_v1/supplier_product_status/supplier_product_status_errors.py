from backend.api_v1.supplier_product_status.supplier_product_status_messages import (
    SUPPLIER_PRODUCT_STATUS_NOT_FOUND,
    SUPPLIER_PRODUCT_STATUS_CODE_TAKEN,
    SUPPLIER_PRODUCT_STATUS_DELETE_ERROR,
)
from backend.api_v1.base.errors import NotFoundError, AlreadyExistsError, DeleteError, DomainError


class SupplierProductStatusNotFound(NotFoundError):
    message_key = SUPPLIER_PRODUCT_STATUS_NOT_FOUND["message_key"]

    def __init__(self, id_: int) -> None:
        self.template_vars = {"id": id_}
        self.fallback = SUPPLIER_PRODUCT_STATUS_NOT_FOUND["fallback"]
        super().__init__("Supplier product status", "id", id_)


class SupplierProductStatusCodeTaken(AlreadyExistsError):
    message_key = SUPPLIER_PRODUCT_STATUS_CODE_TAKEN["message_key"]

    def __init__(self, code: str) -> None:
        self.template_vars = {"code": code}
        self.fallback = SUPPLIER_PRODUCT_STATUS_CODE_TAKEN["fallback"]
        super().__init__("Supplier product status", "code", code)


class SupplierProductStatusDeleteError(DeleteError):
    message_key = SUPPLIER_PRODUCT_STATUS_DELETE_ERROR["message_key"]

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = SUPPLIER_PRODUCT_STATUS_DELETE_ERROR["fallback"]
        DomainError.__init__(self, self.fallback)
