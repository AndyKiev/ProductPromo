from backend.api_v1.base.errors import NotFoundError, AlreadyExistsError, DeleteError, DomainError


class EanNotFound(NotFoundError):
    message_key = "eanNotFound"

    def __init__(self, id_: int) -> None:
        self.template_vars = {"id": id_}
        self.fallback = f"EAN with ID {id_} not found"
        super().__init__("EAN", "id", id_)


class EanTaken(AlreadyExistsError):
    message_key = "eanTaken"

    def __init__(self, ean: str) -> None:
        self.template_vars = {"ean": ean}
        self.fallback = f"EAN '{ean}' already exists"
        super().__init__("EAN", "ean", ean)


class EanDeleteError(DeleteError):
    message_key = "eanDeleteError"

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = f"EAN '{name}' cannot be deleted because it is referenced by other records"
        DomainError.__init__(self, self.fallback)
