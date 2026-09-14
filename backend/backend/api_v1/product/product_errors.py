from backend.api_v1.product.product_messages import (
    PRODUCT_NOT_FOUND,
    PRODUCT_CODE_TAKEN,
    PRODUCT_DELETE_ERROR,
)
from backend.api_v1.base.errors import NotFoundError, AlreadyExistsError, DeleteError, DomainError


class ProductNotFound(NotFoundError):
    message_key = PRODUCT_NOT_FOUND["message_key"]

    def __init__(self, id_: int) -> None:
        self.template_vars = {"id": id_}
        self.fallback = PRODUCT_NOT_FOUND["fallback"]
        super().__init__("Product", "id", id_)


class ProductCodeTaken(AlreadyExistsError):
    message_key = PRODUCT_CODE_TAKEN["message_key"]

    def __init__(self, code: str) -> None:
        self.template_vars = {"code": code}
        self.fallback = PRODUCT_CODE_TAKEN["fallback"]
        super().__init__("Product", "code", code)


class ProductDeleteError(DeleteError):
    message_key = PRODUCT_DELETE_ERROR["message_key"]

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = PRODUCT_DELETE_ERROR["fallback"]
        DomainError.__init__(self, self.fallback)
