from backend.api_v1.base.success import DomainSuccess, DeleteSuccess, CreateSuccess, UpdateSuccess


class ProductTypeCreateSuccess(CreateSuccess):
    message_key = "productTypeCreateSuccess"

    def __init__(self, code: str) -> None:
        self.template_vars = {"code": code}
        self.fallback = f"Product type '{code}' successfully created"
        DomainSuccess.__init__(self, self.fallback)


class ProductTypeUpdateSuccess(UpdateSuccess):
    message_key = "productTypeUpdateSuccess"

    def __init__(self, code: str) -> None:
        self.template_vars = {"code": code}
        self.fallback = f"Product type '{code}' successfully updated"
        DomainSuccess.__init__(self, self.fallback)


class ProductTypeDeleteSuccess(DeleteSuccess):
    message_key = "productTypeDeleteSuccess"

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = f"Product type '{name}' successfully deleted"
        DomainSuccess.__init__(self, self.fallback)
