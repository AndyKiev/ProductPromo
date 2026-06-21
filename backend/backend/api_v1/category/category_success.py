from backend.api_v1.base.success import DomainSuccess, DeleteSuccess, CreateSuccess, UpdateSuccess


class CategoryCreateSuccess(CreateSuccess):
    message_key = "categoryCreateSuccess"

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = f"Category '{name}' successfully created"
        DomainSuccess.__init__(self, self.fallback)


class CategoryUpdateSuccess(UpdateSuccess):
    message_key = "categoryUpdateSuccess"

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = f"Category '{name}' successfully updated"
        DomainSuccess.__init__(self, self.fallback)


class CategoryDeleteSuccess(DeleteSuccess):
    message_key = "categoryDeleteSuccess"

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = f"Category '{name}' successfully deleted"
        DomainSuccess.__init__(self, self.fallback)
