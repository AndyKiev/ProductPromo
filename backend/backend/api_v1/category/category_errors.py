from backend.api_v1.base.errors import NotFoundError, AlreadyExistsError, DeleteError, DomainError


class CategoryNotFound(NotFoundError):
    message_key = "categoryNotFound"

    def __init__(self, id_: int) -> None:
        self.template_vars = {"id": id_}
        self.fallback = f"Category with ID {id_} not found"
        super().__init__("Category", "id", id_)


class CategoryNameTaken(AlreadyExistsError):
    message_key = "categoryNameTaken"

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = f"Category '{name}' already exists"
        super().__init__("Category", "name", name)


class CategoryDeleteError(DeleteError):
    message_key = "categoryDeleteError"

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = f"Category '{name}' cannot be deleted because it is referenced by other records"
        DomainError.__init__(self, self.fallback)
