from backend.api_v1.base.errors import NotFoundError, DeleteError, DomainError


class TaxRateNotFound(NotFoundError):
    message_key = "taxRateNotFound"

    def __init__(self, id_: int) -> None:
        self.template_vars = {"id": id_}
        self.fallback = f"Tax rate with ID {id_} not found"
        super().__init__("Tax rate", "id", id_)


class TaxRateDeleteError(DeleteError):
    message_key = "taxRateDeleteError"

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = f"Tax rate '{name}' cannot be deleted because it is referenced by other records"
        DomainError.__init__(self, self.fallback)
