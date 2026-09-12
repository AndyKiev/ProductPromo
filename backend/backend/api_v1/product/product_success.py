from backend.api_v1.base.success import DomainSuccess, DeleteSuccess, CreateSuccess, UpdateSuccess


class ProductCreateSuccess(CreateSuccess):
    message_key = "productCreateSuccess"

    def __init__(self, code: str) -> None:
        self.template_vars = {"code": code}
        self.fallback = f"Product '{code}' successfully created"
        DomainSuccess.__init__(self, self.fallback)


class ProductUpdateSuccess(UpdateSuccess):
    message_key = "productUpdateSuccess"

    def __init__(self, code: str) -> None:
        self.template_vars = {"code": code}
        self.fallback = f"Product '{code}' successfully updated"
        DomainSuccess.__init__(self, self.fallback)


class ProductDeleteSuccess(DeleteSuccess):
    message_key = "productDeleteSuccess"

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = f"Product '{name}' successfully deleted"
        DomainSuccess.__init__(self, self.fallback)
