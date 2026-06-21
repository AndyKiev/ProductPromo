from backend.api_v1.base.success import DomainSuccess, DeleteSuccess, CreateSuccess, UpdateSuccess


class FamilyCreateSuccess(CreateSuccess):
    message_key = "familyCreateSuccess"

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = f"Family '{name}' successfully created"
        DomainSuccess.__init__(self, self.fallback)


class FamilyUpdateSuccess(UpdateSuccess):
    message_key = "familyUpdateSuccess"

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = f"Family '{name}' successfully updated"
        DomainSuccess.__init__(self, self.fallback)


class FamilyDeleteSuccess(DeleteSuccess):
    message_key = "familyDeleteSuccess"

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = f"Family '{name}' successfully deleted"
        DomainSuccess.__init__(self, self.fallback)
