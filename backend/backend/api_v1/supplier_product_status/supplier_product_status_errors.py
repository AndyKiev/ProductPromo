from backend.api_v1.base.errors import NotFoundError, AlreadyExistsError, DeleteError, DomainError


class SupplierProductStatusNotFound(NotFoundError):
    message_key = "supplierProductStatusNotFound"

    def __init__(self, id_: int) -> None:
        self.template_vars = {"id": id_}
        self.fallback = f"Supplier product status with ID {id_} not found"
        super().__init__("Supplier product status", "id", id_)


class SupplierProductStatusCodeTaken(AlreadyExistsError):
    message_key = "supplierProductStatusCodeTaken"

    def __init__(self, code: str) -> None:
        self.template_vars = {"code": code}
        self.fallback = f"Supplier product status with code '{code}' already exists"
        super().__init__("Supplier product status", "code", code)


class SupplierProductStatusDeleteError(DeleteError):
    message_key = "supplierProductStatusDeleteError"

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = f"Supplier product status '{name}' cannot be deleted because it is referenced by other records"
        DomainError.__init__(self, self.fallback)
