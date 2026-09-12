from backend.api_v1.base.errors import NotFoundError, AlreadyExistsError, DeleteError, DomainError


class ProductTypeNotFound(NotFoundError):
    message_key = "productTypeNotFound"

    def __init__(self, id_: int) -> None:
        self.template_vars = {"id": id_}
        self.fallback = f"Product type with ID {id_} not found"
        super().__init__("Product type", "id", id_)


class ProductTypeTaken(AlreadyExistsError):
    message_key = "productTypeTaken"

    def __init__(self, code: str) -> None:
        self.template_vars = {"code": code}
        self.fallback = f"Product type '{code}' already exists"
        super().__init__("Product type", "code", code)


class ProductTypeDeleteError(DeleteError):
    message_key = "productTypeDeleteError"

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = f"Product type '{name}' cannot be deleted because it is referenced by other records"
        DomainError.__init__(self, self.fallback)
