from backend.api_v1.base.errors import NotFoundError, AlreadyExistsError, DeleteError, DomainError


class ProductStatusNotFound(NotFoundError):
    message_key = "productStatusNotFound"

    def __init__(self, id_: int) -> None:
        self.template_vars = {"id": id_}
        self.fallback = f"Product status with ID {id_} not found"
        super().__init__("Product status", "id", id_)


class ProductStatusCodeTaken(AlreadyExistsError):
    message_key = "productStatusCodeTaken"

    def __init__(self, code: str) -> None:
        self.template_vars = {"code": code}
        self.fallback = f"Product status with code '{code}' already exists"
        super().__init__("Product status", "code", code)


class ProductStatusDeleteError(DeleteError):
    message_key = "productStatusDeleteError"

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = f"Product status '{name}' cannot be deleted because it is referenced by other records"
        DomainError.__init__(self, self.fallback)
