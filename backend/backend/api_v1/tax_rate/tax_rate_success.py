from backend.api_v1.base.success import DomainSuccess, DeleteSuccess, CreateSuccess, UpdateSuccess


class TaxRateCreateSuccess(CreateSuccess):
    message_key = "taxRateCreateSuccess"

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = f"Tax rate '{name}' successfully created"
        DomainSuccess.__init__(self, self.fallback)


class TaxRateUpdateSuccess(UpdateSuccess):
    message_key = "taxRateUpdateSuccess"

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = f"Tax rate '{name}' successfully updated"
        DomainSuccess.__init__(self, self.fallback)


class TaxRateDeleteSuccess(DeleteSuccess):
    message_key = "taxRateDeleteSuccess"

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = f"Tax rate '{name}' successfully deleted"
        DomainSuccess.__init__(self, self.fallback)
