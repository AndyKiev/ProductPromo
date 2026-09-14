from backend.api_v1.tax_rate.tax_rate_messages import (
    TAX_RATE_NOT_FOUND,
    TAX_RATE_DELETE_ERROR,
)
from backend.api_v1.base.errors import NotFoundError, DeleteError, DomainError


class TaxRateNotFound(NotFoundError):
    message_key = TAX_RATE_NOT_FOUND["message_key"]

    def __init__(self, id_: int) -> None:
        self.template_vars = {"id": id_}
        self.fallback = TAX_RATE_NOT_FOUND["fallback"]
        super().__init__("Tax rate", "id", id_)


class TaxRateDeleteError(DeleteError):
    message_key = TAX_RATE_DELETE_ERROR["message_key"]

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = TAX_RATE_DELETE_ERROR["fallback"]
        DomainError.__init__(self, self.fallback)
