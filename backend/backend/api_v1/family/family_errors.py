from backend.api_v1.base.errors import NotFoundError, AlreadyExistsError, DeleteError, DomainError


class FamilyNotFound(NotFoundError):
    message_key = "familyNotFound"

    def __init__(self, id_: int) -> None:
        self.template_vars = {"id": id_}
        self.fallback = f"Family with ID {id_} not found"
        super().__init__("Family", "id", id_)


class FamilyNameTaken(AlreadyExistsError):
    message_key = "familyNameTaken"

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = f"Family '{name}' already exists"
        super().__init__("Family", "name", name)


class FamilyDeleteError(DeleteError):
    message_key = "familyDeleteError"

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = f"Family '{name}' cannot be deleted because it is referenced by other records"
        DomainError.__init__(self, self.fallback)
