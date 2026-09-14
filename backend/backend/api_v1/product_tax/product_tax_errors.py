from backend.api_v1.product_tax.product_tax_messages import (
    PRODUCT_TAX_NOT_FOUND,
    PRODUCT_TAX_DELETE_ERROR,
)
from backend.api_v1.base.errors import NotFoundError, DeleteError, DomainError


class ProductTaxNotFound(NotFoundError):
    message_key = PRODUCT_TAX_NOT_FOUND["message_key"]

    def __init__(self, id_: int) -> None:
        self.template_vars = {"id": id_}
        self.fallback = PRODUCT_TAX_NOT_FOUND["fallback"]
        super().__init__("Product tax", "id", id_)


class ProductTaxDeleteError(DeleteError):
    message_key = PRODUCT_TAX_DELETE_ERROR["message_key"]

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = PRODUCT_TAX_DELETE_ERROR["fallback"]
        DomainError.__init__(self, self.fallback)
