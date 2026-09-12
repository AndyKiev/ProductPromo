from backend.api_v1.base.success import DomainSuccess, DeleteSuccess, CreateSuccess, UpdateSuccess


class ProductStatusCreateSuccess(CreateSuccess):
    message_key = "productStatusCreateSuccess"

    def __init__(self, code: str) -> None:
        self.template_vars = {"code": code}
        self.fallback = f"Product status '{code}' successfully created"
        DomainSuccess.__init__(self, self.fallback)


class ProductStatusUpdateSuccess(UpdateSuccess):
    message_key = "productStatusUpdateSuccess"

    def __init__(self, code: str) -> None:
        self.template_vars = {"code": code}
        self.fallback = f"Product status '{code}' successfully updated"
        DomainSuccess.__init__(self, self.fallback)


class ProductStatusDeleteSuccess(DeleteSuccess):
    message_key = "productStatusDeleteSuccess"

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = f"Product status '{name}' successfully deleted"
        DomainSuccess.__init__(self, self.fallback)
