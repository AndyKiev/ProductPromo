from backend.api_v1.base.errors import NotFoundError, AlreadyExistsError, DeleteError, DomainError


class SupplierNotFound(NotFoundError):
    message_key = "supplierNotFound"

    def __init__(self, id_: int) -> None:
        self.template_vars = {"id": id_}
        self.fallback = f"Supplier with ID {id_} not found"
        super().__init__("Supplier", "id", id_)


class SupplierCodeTaken(AlreadyExistsError):
    message_key = "supplierCodeTaken"

    def __init__(self, code: str) -> None:
        self.template_vars = {"code": code}
        self.fallback = f"Supplier with code '{code}' already exists"
        super().__init__("Supplier", "code", code)


class SupplierDeleteError(DeleteError):
    message_key = "supplierDeleteError"

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = f"Supplier '{name}' cannot be deleted because it is referenced by other records"
        DomainError.__init__(self, self.fallback)
