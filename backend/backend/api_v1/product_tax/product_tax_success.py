from backend.api_v1.product_tax.product_tax_messages import (
    PRODUCT_TAX_UPDATE_SUCCESS,
    PRODUCT_TAX_DELETE_SUCCESS,
)
from backend.api_v1.base.success import DomainSuccess, DeleteSuccess, UpdateSuccess


class ProductTaxUpdateSuccess(UpdateSuccess):
    message_key = PRODUCT_TAX_UPDATE_SUCCESS["message_key"]

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = PRODUCT_TAX_UPDATE_SUCCESS["fallback"]
        DomainSuccess.__init__(self, self.fallback)


class ProductTaxDeleteSuccess(DeleteSuccess):
    message_key = PRODUCT_TAX_DELETE_SUCCESS["message_key"]

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = PRODUCT_TAX_DELETE_SUCCESS["fallback"]
        DomainSuccess.__init__(self, self.fallback)
