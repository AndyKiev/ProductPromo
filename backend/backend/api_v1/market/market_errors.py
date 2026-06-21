from backend.api_v1.base.errors import NotFoundError, AlreadyExistsError, DeleteError, DomainError


class MarketNotFound(NotFoundError):
    message_key = "marketNotFound"

    def __init__(self, id_: int) -> None:
        self.template_vars = {"id": id_}
        self.fallback = f"Market with ID {id_} not found"
        super().__init__("Market", "id", id_)


class MarketNameTaken(AlreadyExistsError):
    message_key = "marketNameTaken"

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = f"Market '{name}' already exists"
        super().__init__("Market", "name", name)


class MarketDeleteError(DeleteError):
    message_key = "marketDeleteError"

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = f"Market '{name}' cannot be deleted because it is referenced by other records"
        DomainError.__init__(self, self.fallback)
