from backend.api_v1.base.success import DomainSuccess, DeleteSuccess, UpdateSuccess


class ProductSupplierUpdateSuccess(UpdateSuccess):
    message_key = "productSupplierUpdateSuccess"

    def __init__(self, code: str) -> None:
        self.template_vars = {"code": code}
        self.fallback = f"Product-supplier link '{code}' successfully updated"
        DomainSuccess.__init__(self, self.fallback)


class ProductSupplierDeleteSuccess(DeleteSuccess):
    message_key = "productSupplierDeleteSuccess"

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = f"Product-supplier link '{name}' successfully deleted"
        DomainSuccess.__init__(self, self.fallback)
