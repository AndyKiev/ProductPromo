from backend.api_v1.base.success import DomainSuccess, DeleteSuccess, CreateSuccess, UpdateSuccess


class SupplierCreateSuccess(CreateSuccess):
    message_key = "supplierCreateSuccess"

    def __init__(self, code: str) -> None:
        self.template_vars = {"code": code}
        self.fallback = f"Supplier '{code}' successfully created"
        DomainSuccess.__init__(self, self.fallback)


class SupplierUpdateSuccess(UpdateSuccess):
    message_key = "supplierUpdateSuccess"

    def __init__(self, code: str) -> None:
        self.template_vars = {"code": code}
        self.fallback = f"Supplier '{code}' successfully updated"
        DomainSuccess.__init__(self, self.fallback)


class SupplierDeleteSuccess(DeleteSuccess):
    message_key = "supplierDeleteSuccess"

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = f"Supplier '{name}' successfully deleted"
        DomainSuccess.__init__(self, self.fallback)
