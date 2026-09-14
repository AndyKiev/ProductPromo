from backend.api_v1.product_supplier.product_supplier_messages import (
    PRODUCT_SUPPLIER_NOT_FOUND,
    PRODUCT_SUPPLIER_DELETE_ERROR,
)
from backend.api_v1.base.errors import NotFoundError, DeleteError, DomainError


class ProductSupplierNotFound(NotFoundError):
    message_key = PRODUCT_SUPPLIER_NOT_FOUND["message_key"]

    def __init__(self, id_: int) -> None:
        self.template_vars = {"id": id_}
        self.fallback = PRODUCT_SUPPLIER_NOT_FOUND["fallback"]
        super().__init__("Product-supplier link", "id", id_)


class ProductSupplierDeleteError(DeleteError):
    message_key = PRODUCT_SUPPLIER_DELETE_ERROR["message_key"]

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = PRODUCT_SUPPLIER_DELETE_ERROR["fallback"]
        DomainError.__init__(self, self.fallback)
