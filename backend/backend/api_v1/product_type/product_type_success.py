from backend.api_v1.product_type.product_type_messages import (
    PRODUCT_TYPE_CREATE_SUCCESS,
    PRODUCT_TYPE_UPDATE_SUCCESS,
    PRODUCT_TYPE_DELETE_SUCCESS,
)
from backend.api_v1.base.success import DomainSuccess, DeleteSuccess, CreateSuccess, UpdateSuccess


class ProductTypeCreateSuccess(CreateSuccess):
    message_key = PRODUCT_TYPE_CREATE_SUCCESS["message_key"]

    def __init__(self, code: str) -> None:
        self.template_vars = {"code": code}
        self.fallback = PRODUCT_TYPE_CREATE_SUCCESS["fallback"]
        DomainSuccess.__init__(self, self.fallback)


class ProductTypeUpdateSuccess(UpdateSuccess):
    message_key = PRODUCT_TYPE_UPDATE_SUCCESS["message_key"]

    def __init__(self, code: str) -> None:
        self.template_vars = {"code": code}
        self.fallback = PRODUCT_TYPE_UPDATE_SUCCESS["fallback"]
        DomainSuccess.__init__(self, self.fallback)


class ProductTypeDeleteSuccess(DeleteSuccess):
    message_key = PRODUCT_TYPE_DELETE_SUCCESS["message_key"]

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = PRODUCT_TYPE_DELETE_SUCCESS["fallback"]
        DomainSuccess.__init__(self, self.fallback)
