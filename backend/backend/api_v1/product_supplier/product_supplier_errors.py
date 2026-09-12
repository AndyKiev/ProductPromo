from backend.api_v1.base.errors import NotFoundError, DeleteError, DomainError


class ProductSupplierNotFound(NotFoundError):
    message_key = "productSupplierNotFound"

    def __init__(self, id_: int) -> None:
        self.template_vars = {"id": id_}
        self.fallback = f"Product-supplier link with ID {id_} not found"
        super().__init__("Product-supplier link", "id", id_)


class ProductSupplierDeleteError(DeleteError):
    message_key = "productSupplierDeleteError"

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = f"Product-supplier link '{name}' cannot be deleted"
        DomainError.__init__(self, self.fallback)
