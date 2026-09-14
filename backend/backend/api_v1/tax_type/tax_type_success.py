from backend.api_v1.tax_type.tax_type_messages import (
    TAX_TYPE_CREATE_SUCCESS,
    TAX_TYPE_UPDATE_SUCCESS,
    TAX_TYPE_DELETE_SUCCESS,
)
from backend.api_v1.base.success import DomainSuccess, DeleteSuccess, CreateSuccess, UpdateSuccess


class TaxTypeCreateSuccess(CreateSuccess):
    message_key = TAX_TYPE_CREATE_SUCCESS["message_key"]

    def __init__(self, code: str) -> None:
        self.template_vars = {"code": code}
        self.fallback = TAX_TYPE_CREATE_SUCCESS["fallback"]
        DomainSuccess.__init__(self, self.fallback)


class TaxTypeUpdateSuccess(UpdateSuccess):
    message_key = TAX_TYPE_UPDATE_SUCCESS["message_key"]

    def __init__(self, code: str) -> None:
        self.template_vars = {"code": code}
        self.fallback = TAX_TYPE_UPDATE_SUCCESS["fallback"]
        DomainSuccess.__init__(self, self.fallback)


class TaxTypeDeleteSuccess(DeleteSuccess):
    message_key = TAX_TYPE_DELETE_SUCCESS["message_key"]

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = TAX_TYPE_DELETE_SUCCESS["fallback"]
        DomainSuccess.__init__(self, self.fallback)
