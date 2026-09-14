from backend.api_v1.tax_rate.tax_rate_messages import (
    TAX_RATE_CREATE_SUCCESS,
    TAX_RATE_UPDATE_SUCCESS,
    TAX_RATE_DELETE_SUCCESS,
)
from backend.api_v1.base.success import DomainSuccess, DeleteSuccess, CreateSuccess, UpdateSuccess


class TaxRateCreateSuccess(CreateSuccess):
    message_key = TAX_RATE_CREATE_SUCCESS["message_key"]

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = TAX_RATE_CREATE_SUCCESS["fallback"]
        DomainSuccess.__init__(self, self.fallback)


class TaxRateUpdateSuccess(UpdateSuccess):
    message_key = TAX_RATE_UPDATE_SUCCESS["message_key"]

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = TAX_RATE_UPDATE_SUCCESS["fallback"]
        DomainSuccess.__init__(self, self.fallback)


class TaxRateDeleteSuccess(DeleteSuccess):
    message_key = TAX_RATE_DELETE_SUCCESS["message_key"]

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = TAX_RATE_DELETE_SUCCESS["fallback"]
        DomainSuccess.__init__(self, self.fallback)
