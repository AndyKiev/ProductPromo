from backend.api_v1.base.success import DomainSuccess, DeleteSuccess, CreateSuccess, UpdateSuccess


class NomenclatureCreateSuccess(CreateSuccess):
    message_key = "nomenclatureCreateSuccess"

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = f"Nomenclature '{name}' successfully created"
        DomainSuccess.__init__(self, self.fallback)


class NomenclatureUpdateSuccess(UpdateSuccess):
    message_key = "nomenclatureUpdateSuccess"

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = f"Nomenclature '{name}' successfully updated"
        DomainSuccess.__init__(self, self.fallback)


class NomenclatureDeleteSuccess(DeleteSuccess):
    message_key = "nomenclatureDeleteSuccess"

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = f"Nomenclature '{name}' successfully deleted"
        DomainSuccess.__init__(self, self.fallback)
