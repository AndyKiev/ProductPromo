from backend.api_v1.base.success import DomainSuccess, DeleteSuccess, CreateSuccess, UpdateSuccess


class ImportCodeCreateSuccess(CreateSuccess):
    message_key = "importCodeCreateSuccess"

    def __init__(self, code: str) -> None:
        self.template_vars = {"code": code}
        self.fallback = f"Import code '{code}' successfully created"
        DomainSuccess.__init__(self, self.fallback)


class ImportCodeUpdateSuccess(UpdateSuccess):
    message_key = "importCodeUpdateSuccess"

    def __init__(self, code: str) -> None:
        self.template_vars = {"code": code}
        self.fallback = f"Import code '{code}' successfully updated"
        DomainSuccess.__init__(self, self.fallback)


class ImportCodeDeleteSuccess(DeleteSuccess):
    message_key = "importCodeDeleteSuccess"

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = f"Import code '{name}' successfully deleted"
        DomainSuccess.__init__(self, self.fallback)
