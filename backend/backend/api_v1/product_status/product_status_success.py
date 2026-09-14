from backend.api_v1.product_status.product_status_messages import (
    PRODUCT_STATUS_CREATE_SUCCESS,
    PRODUCT_STATUS_UPDATE_SUCCESS,
    PRODUCT_STATUS_DELETE_SUCCESS,
)
from backend.api_v1.base.success import DomainSuccess, DeleteSuccess, CreateSuccess, UpdateSuccess


class ProductStatusCreateSuccess(CreateSuccess):
    message_key = PRODUCT_STATUS_CREATE_SUCCESS["message_key"]

    def __init__(self, code: str) -> None:
        self.template_vars = {"code": code}
        self.fallback = PRODUCT_STATUS_CREATE_SUCCESS["fallback"]
        DomainSuccess.__init__(self, self.fallback)


class ProductStatusUpdateSuccess(UpdateSuccess):
    message_key = PRODUCT_STATUS_UPDATE_SUCCESS["message_key"]

    def __init__(self, code: str) -> None:
        self.template_vars = {"code": code}
        self.fallback = PRODUCT_STATUS_UPDATE_SUCCESS["fallback"]
        DomainSuccess.__init__(self, self.fallback)


class ProductStatusDeleteSuccess(DeleteSuccess):
    message_key = PRODUCT_STATUS_DELETE_SUCCESS["message_key"]

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = PRODUCT_STATUS_DELETE_SUCCESS["fallback"]
        DomainSuccess.__init__(self, self.fallback)
