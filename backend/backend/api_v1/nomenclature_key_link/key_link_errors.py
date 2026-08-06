from backend.api_v1.base.errors import NotFoundError, DeleteError, DomainError


class KeyLinkNotFound(NotFoundError):
    message_key = "keyLinkNotFound"

    def __init__(self, level: int, id_: int) -> None:
        self.template_vars = {"level": level, "id": id_}
        self.fallback = f"KeyLink level {level} with ID {id_} not found"
        super().__init__("KeyLink", "id", id_)


class KeyLinkDeleteError(DeleteError):
    message_key = "keyLinkDeleteError"

    def __init__(self, level: int, id_: int) -> None:
        self.template_vars = {"level": level, "id": id_}
        self.fallback = f"KeyLink level {level} with ID {id_} cannot be deleted because it is referenced by other records"
        DomainError.__init__(self, self.fallback)
