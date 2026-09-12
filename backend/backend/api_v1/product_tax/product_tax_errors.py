from backend.api_v1.base.errors import NotFoundError, DeleteError, DomainError


class ProductTaxNotFound(NotFoundError):
    message_key = "productTaxNotFound"

    def __init__(self, id_: int) -> None:
        self.template_vars = {"id": id_}
        self.fallback = f"Product tax with ID {id_} not found"
        super().__init__("Product tax", "id", id_)


class ProductTaxDeleteError(DeleteError):
    message_key = "productTaxDeleteError"

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = f"Product tax '{name}' cannot be deleted"
        DomainError.__init__(self, self.fallback)
