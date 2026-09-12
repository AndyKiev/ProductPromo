from backend.api_v1.base.success import DomainSuccess, DeleteSuccess, CreateSuccess, UpdateSuccess


class SupplierStatusCreateSuccess(CreateSuccess):
    message_key = "supplierStatusCreateSuccess"

    def __init__(self, code: str) -> None:
        self.template_vars = {"code": code}
        self.fallback = f"Supplier status '{code}' successfully created"
        DomainSuccess.__init__(self, self.fallback)


class SupplierStatusUpdateSuccess(UpdateSuccess):
    message_key = "supplierStatusUpdateSuccess"

    def __init__(self, code: str) -> None:
        self.template_vars = {"code": code}
        self.fallback = f"Supplier status '{code}' successfully updated"
        DomainSuccess.__init__(self, self.fallback)


class SupplierStatusDeleteSuccess(DeleteSuccess):
    message_key = "supplierStatusDeleteSuccess"

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = f"Supplier status '{name}' successfully deleted"
        DomainSuccess.__init__(self, self.fallback)
