from backend.api_v1.product.product_messages import (
    PRODUCT_CREATE_SUCCESS,
    PRODUCT_UPDATE_SUCCESS,
    PRODUCT_DELETE_SUCCESS,
)
from backend.api_v1.base.success import DomainSuccess, DeleteSuccess, CreateSuccess, UpdateSuccess


class ProductCreateSuccess(CreateSuccess):
    message_key = PRODUCT_CREATE_SUCCESS["message_key"]

    def __init__(self, code: str) -> None:
        self.template_vars = {"code": code}
        self.fallback = PRODUCT_CREATE_SUCCESS["fallback"]
        DomainSuccess.__init__(self, self.fallback)


class ProductUpdateSuccess(UpdateSuccess):
    message_key = PRODUCT_UPDATE_SUCCESS["message_key"]

    def __init__(self, code: str) -> None:
        self.template_vars = {"code": code}
        self.fallback = PRODUCT_UPDATE_SUCCESS["fallback"]
        DomainSuccess.__init__(self, self.fallback)


class ProductDeleteSuccess(DeleteSuccess):
    message_key = PRODUCT_DELETE_SUCCESS["message_key"]

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = PRODUCT_DELETE_SUCCESS["fallback"]
        DomainSuccess.__init__(self, self.fallback)
