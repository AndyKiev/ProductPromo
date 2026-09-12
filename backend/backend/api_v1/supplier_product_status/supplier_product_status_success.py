from backend.api_v1.base.success import DomainSuccess, DeleteSuccess, CreateSuccess, UpdateSuccess


class SupplierProductStatusCreateSuccess(CreateSuccess):
    message_key = "supplierProductStatusCreateSuccess"

    def __init__(self, code: str) -> None:
        self.template_vars = {"code": code}
        self.fallback = f"Supplier product status '{code}' successfully created"
        DomainSuccess.__init__(self, self.fallback)


class SupplierProductStatusUpdateSuccess(UpdateSuccess):
    message_key = "supplierProductStatusUpdateSuccess"

    def __init__(self, code: str) -> None:
        self.template_vars = {"code": code}
        self.fallback = f"Supplier product status '{code}' successfully updated"
        DomainSuccess.__init__(self, self.fallback)


class SupplierProductStatusDeleteSuccess(DeleteSuccess):
    message_key = "supplierProductStatusDeleteSuccess"

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = f"Supplier product status '{name}' successfully deleted"
        DomainSuccess.__init__(self, self.fallback)
