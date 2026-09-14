from backend.api_v1.product_supplier.product_supplier_messages import (
    PRODUCT_SUPPLIER_UPDATE_SUCCESS,
    PRODUCT_SUPPLIER_DELETE_SUCCESS,
)
from backend.api_v1.base.success import DomainSuccess, DeleteSuccess, UpdateSuccess


class ProductSupplierUpdateSuccess(UpdateSuccess):
    message_key = PRODUCT_SUPPLIER_UPDATE_SUCCESS["message_key"]

    def __init__(self, code: str) -> None:
        self.template_vars = {"code": code}
        self.fallback = PRODUCT_SUPPLIER_UPDATE_SUCCESS["fallback"]
        DomainSuccess.__init__(self, self.fallback)


class ProductSupplierDeleteSuccess(DeleteSuccess):
    message_key = PRODUCT_SUPPLIER_DELETE_SUCCESS["message_key"]

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = PRODUCT_SUPPLIER_DELETE_SUCCESS["fallback"]
        DomainSuccess.__init__(self, self.fallback)
