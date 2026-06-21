from backend.api_v1.base.errors import NotFoundError, AlreadyExistsError, DeleteError, DomainError


class NomenclatureNotFound(NotFoundError):
    message_key = "nomenclatureNotFound"

    def __init__(self, id_: int) -> None:
        self.template_vars = {"id": id_}
        self.fallback = f"Nomenclature with ID {id_} not found"
        super().__init__("Nomenclature", "id", id_)


class NomenclatureDeleteError(DeleteError):
    message_key = "nomenclatureDeleteError"

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = f"Nomenclature '{name}' cannot be deleted because it is referenced by other records"
        DomainError.__init__(self, self.fallback)
