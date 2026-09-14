from backend.api_v1.supplier_status.supplier_status_messages import (
    SUPPLIER_STATUS_CREATE_SUCCESS,
    SUPPLIER_STATUS_UPDATE_SUCCESS,
    SUPPLIER_STATUS_DELETE_SUCCESS,
)
from backend.api_v1.base.success import DomainSuccess, DeleteSuccess, CreateSuccess, UpdateSuccess


class SupplierStatusCreateSuccess(CreateSuccess):
    message_key = SUPPLIER_STATUS_CREATE_SUCCESS["message_key"]

    def __init__(self, code: str) -> None:
        self.template_vars = {"code": code}
        self.fallback = SUPPLIER_STATUS_CREATE_SUCCESS["fallback"]
        DomainSuccess.__init__(self, self.fallback)


class SupplierStatusUpdateSuccess(UpdateSuccess):
    message_key = SUPPLIER_STATUS_UPDATE_SUCCESS["message_key"]

    def __init__(self, code: str) -> None:
        self.template_vars = {"code": code}
        self.fallback = SUPPLIER_STATUS_UPDATE_SUCCESS["fallback"]
        DomainSuccess.__init__(self, self.fallback)


class SupplierStatusDeleteSuccess(DeleteSuccess):
    message_key = SUPPLIER_STATUS_DELETE_SUCCESS["message_key"]

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = SUPPLIER_STATUS_DELETE_SUCCESS["fallback"]
        DomainSuccess.__init__(self, self.fallback)
