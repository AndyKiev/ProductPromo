from backend.api_v1.base.errors import NotFoundError, AlreadyExistsError, DeleteError, DomainError


class ImportCodeNotFound(NotFoundError):
    message_key = "importCodeNotFound"

    def __init__(self, id_: int) -> None:
        self.template_vars = {"id": id_}
        self.fallback = f"Import code with ID {id_} not found"
        super().__init__("Import code", "id", id_)


class ImportCodeTaken(AlreadyExistsError):
    message_key = "importCodeTaken"

    def __init__(self, code: str) -> None:
        self.template_vars = {"code": code}
        self.fallback = f"Import code '{code}' already exists"
        super().__init__("Import code", "code", code)


class ImportCodeDeleteError(DeleteError):
    message_key = "importCodeDeleteError"

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = f"Import code '{name}' cannot be deleted because it is referenced by other records"
        DomainError.__init__(self, self.fallback)
