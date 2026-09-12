from backend.api_v1.base.success import DomainSuccess, DeleteSuccess, UpdateSuccess


class ProductTaxUpdateSuccess(UpdateSuccess):
    message_key = "productTaxUpdateSuccess"

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = f"Product tax '{name}' successfully updated"
        DomainSuccess.__init__(self, self.fallback)


class ProductTaxDeleteSuccess(DeleteSuccess):
    message_key = "productTaxDeleteSuccess"

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = f"Product tax '{name}' successfully deleted"
        DomainSuccess.__init__(self, self.fallback)
