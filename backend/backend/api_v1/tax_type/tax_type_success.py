from backend.api_v1.base.success import DomainSuccess, DeleteSuccess, CreateSuccess, UpdateSuccess


class TaxTypeCreateSuccess(CreateSuccess):
    message_key = "taxTypeCreateSuccess"

    def __init__(self, code: str) -> None:
        self.template_vars = {"code": code}
        self.fallback = f"Tax type '{code}' successfully created"
        DomainSuccess.__init__(self, self.fallback)


class TaxTypeUpdateSuccess(UpdateSuccess):
    message_key = "taxTypeUpdateSuccess"

    def __init__(self, code: str) -> None:
        self.template_vars = {"code": code}
        self.fallback = f"Tax type '{code}' successfully updated"
        DomainSuccess.__init__(self, self.fallback)


class TaxTypeDeleteSuccess(DeleteSuccess):
    message_key = "taxTypeDeleteSuccess"

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = f"Tax type '{name}' successfully deleted"
        DomainSuccess.__init__(self, self.fallback)
