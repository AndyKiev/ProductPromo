from backend.api_v1.base.errors import NotFoundError, AlreadyExistsError, DeleteError, DomainError


class TaxTypeNotFound(NotFoundError):
    message_key = "taxTypeNotFound"

    def __init__(self, id_: int) -> None:
        self.template_vars = {"id": id_}
        self.fallback = f"Tax type with ID {id_} not found"
        super().__init__("Tax type", "id", id_)


class TaxTypeCodeTaken(AlreadyExistsError):
    message_key = "taxTypeCodeTaken"

    def __init__(self, code: str) -> None:
        self.template_vars = {"code": code}
        self.fallback = f"Tax type with code '{code}' already exists"
        super().__init__("Tax type", "code", code)


class TaxTypeDeleteError(DeleteError):
    message_key = "taxTypeDeleteError"

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = f"Tax type '{name}' cannot be deleted because it is referenced by other records"
        DomainError.__init__(self, self.fallback)
