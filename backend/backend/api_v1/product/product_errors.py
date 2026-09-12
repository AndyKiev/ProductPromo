from backend.api_v1.base.errors import NotFoundError, AlreadyExistsError, DeleteError, DomainError


class ProductNotFound(NotFoundError):
    message_key = "productNotFound"

    def __init__(self, id_: int) -> None:
        self.template_vars = {"id": id_}
        self.fallback = f"Product with ID {id_} not found"
        super().__init__("Product", "id", id_)


class ProductCodeTaken(AlreadyExistsError):
    message_key = "productCodeTaken"

    def __init__(self, code: str) -> None:
        self.template_vars = {"code": code}
        self.fallback = f"Product with code '{code}' already exists"
        super().__init__("Product", "code", code)


class ProductDeleteError(DeleteError):
    message_key = "productDeleteError"

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = f"Product '{name}' cannot be deleted because it is referenced by other records"
        DomainError.__init__(self, self.fallback)
