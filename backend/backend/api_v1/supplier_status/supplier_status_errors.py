from backend.api_v1.base.errors import NotFoundError, AlreadyExistsError, DeleteError, DomainError


class SupplierStatusNotFound(NotFoundError):
    message_key = "supplierStatusNotFound"

    def __init__(self, id_: int) -> None:
        self.template_vars = {"id": id_}
        self.fallback = f"Supplier status with ID {id_} not found"
        super().__init__("Supplier status", "id", id_)


class SupplierStatusCodeTaken(AlreadyExistsError):
    message_key = "supplierStatusCodeTaken"

    def __init__(self, code: str) -> None:
        self.template_vars = {"code": code}
        self.fallback = f"Supplier status with code '{code}' already exists"
        super().__init__("Supplier status", "code", code)


class SupplierStatusDeleteError(DeleteError):
    message_key = "supplierStatusDeleteError"

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = f"Supplier status '{name}' cannot be deleted because it is referenced by other records"
        DomainError.__init__(self, self.fallback)
