from backend.api_v1.base.success import DomainSuccess, DeleteSuccess, CreateSuccess, UpdateSuccess


class NomenclatureKeyCreateSuccess(CreateSuccess):
    message_key = "nomenclature_keyCreateSuccess"

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = f"NomenclatureKey '{name}' successfully created"
        DomainSuccess.__init__(self, self.fallback)


class NomenclatureKeyUpdateSuccess(UpdateSuccess):
    message_key = "nomenclature_keyUpdateSuccess"

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = f"NomenclatureKey '{name}' successfully updated"
        DomainSuccess.__init__(self, self.fallback)


class NomenclatureKeyDeleteSuccess(DeleteSuccess):
    message_key = "nomenclature_keyDeleteSuccess"

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = f"NomenclatureKey '{name}' successfully deleted"
        DomainSuccess.__init__(self, self.fallback)
