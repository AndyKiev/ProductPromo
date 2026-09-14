from backend.api_v1.product_status.product_status_messages import (
    PRODUCT_STATUS_NOT_FOUND,
    PRODUCT_STATUS_CODE_TAKEN,
    PRODUCT_STATUS_DELETE_ERROR,
)
from backend.api_v1.base.errors import NotFoundError, AlreadyExistsError, DeleteError, DomainError


class ProductStatusNotFound(NotFoundError):
    message_key = PRODUCT_STATUS_NOT_FOUND["message_key"]

    def __init__(self, id_: int) -> None:
        self.template_vars = {"id": id_}
        self.fallback = PRODUCT_STATUS_NOT_FOUND["fallback"]
        super().__init__("Product status", "id", id_)


class ProductStatusCodeTaken(AlreadyExistsError):
    message_key = PRODUCT_STATUS_CODE_TAKEN["message_key"]

    def __init__(self, code: str) -> None:
        self.template_vars = {"code": code}
        self.fallback = PRODUCT_STATUS_CODE_TAKEN["fallback"]
        super().__init__("Product status", "code", code)


class ProductStatusDeleteError(DeleteError):
    message_key = PRODUCT_STATUS_DELETE_ERROR["message_key"]

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = PRODUCT_STATUS_DELETE_ERROR["fallback"]
        DomainError.__init__(self, self.fallback)
