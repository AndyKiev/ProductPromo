from backend.api_v1.supplier.supplier_messages import (
    SUPPLIER_CREATE_SUCCESS,
    SUPPLIER_UPDATE_SUCCESS,
    SUPPLIER_DELETE_SUCCESS,
)
from backend.api_v1.base.success import DomainSuccess, DeleteSuccess, CreateSuccess, UpdateSuccess


class SupplierCreateSuccess(CreateSuccess):
    message_key = SUPPLIER_CREATE_SUCCESS["message_key"]

    def __init__(self, code: str) -> None:
        self.template_vars = {"code": code}
        self.fallback = SUPPLIER_CREATE_SUCCESS["fallback"]
        DomainSuccess.__init__(self, self.fallback)


class SupplierUpdateSuccess(UpdateSuccess):
    message_key = SUPPLIER_UPDATE_SUCCESS["message_key"]

    def __init__(self, code: str) -> None:
        self.template_vars = {"code": code}
        self.fallback = SUPPLIER_UPDATE_SUCCESS["fallback"]
        DomainSuccess.__init__(self, self.fallback)


class SupplierDeleteSuccess(DeleteSuccess):
    message_key = SUPPLIER_DELETE_SUCCESS["message_key"]

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = SUPPLIER_DELETE_SUCCESS["fallback"]
        DomainSuccess.__init__(self, self.fallback)
