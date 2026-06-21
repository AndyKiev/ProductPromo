from backend.api_v1.base.errors import NotFoundError, AlreadyExistsError, DeleteError, DomainError


class NomenclatureKeyNotFound(NotFoundError):
    message_key = "nomenclature_keyNotFound"

    def __init__(self, id_: int) -> None:
        self.template_vars = {"id": id_}
        self.fallback = f"NomenclatureKey with ID {id_} not found"
        super().__init__("NomenclatureKey", "id", id_)


class NomenclatureKeyNameTaken(AlreadyExistsError):
    message_key = "nomenclature_keyNameTaken"

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = f"NomenclatureKey '{name}' already exists"
        super().__init__("NomenclatureKey", "name", name)


class NomenclatureKeyDeleteError(DeleteError):
    message_key = "nomenclature_keyDeleteError"

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = f"NomenclatureKey '{name}' cannot be deleted because it is referenced by other records"
        DomainError.__init__(self, self.fallback)
