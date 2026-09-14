from backend.api_v1.product_type.product_type_messages import (
    PRODUCT_TYPE_NOT_FOUND,
    PRODUCT_TYPE_TAKEN,
    PRODUCT_TYPE_DELETE_ERROR,
)
from backend.api_v1.base.errors import NotFoundError, AlreadyExistsError, DeleteError, DomainError


class ProductTypeNotFound(NotFoundError):
    message_key = PRODUCT_TYPE_NOT_FOUND["message_key"]

    def __init__(self, id_: int) -> None:
        self.template_vars = {"id": id_}
        self.fallback = PRODUCT_TYPE_NOT_FOUND["fallback"]
        super().__init__("Product type", "id", id_)


class ProductTypeTaken(AlreadyExistsError):
    message_key = PRODUCT_TYPE_TAKEN["message_key"]

    def __init__(self, code: str) -> None:
        self.template_vars = {"code": code}
        self.fallback = PRODUCT_TYPE_TAKEN["fallback"]
        super().__init__("Product type", "code", code)


class ProductTypeDeleteError(DeleteError):
    message_key = PRODUCT_TYPE_DELETE_ERROR["message_key"]

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = PRODUCT_TYPE_DELETE_ERROR["fallback"]
        DomainError.__init__(self, self.fallback)
