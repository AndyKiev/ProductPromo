from backend.api_v1.base.success import DomainSuccess, DeleteSuccess, CreateSuccess, UpdateSuccess


class EanCreateSuccess(CreateSuccess):
    message_key = "eanCreateSuccess"

    def __init__(self, ean: str) -> None:
        self.template_vars = {"ean": ean}
        self.fallback = f"EAN '{ean}' successfully created"
        DomainSuccess.__init__(self, self.fallback)


class EanUpdateSuccess(UpdateSuccess):
    message_key = "eanUpdateSuccess"

    def __init__(self, ean: str) -> None:
        self.template_vars = {"ean": ean}
        self.fallback = f"EAN '{ean}' successfully updated"
        DomainSuccess.__init__(self, self.fallback)


class EanDeleteSuccess(DeleteSuccess):
    message_key = "eanDeleteSuccess"

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = f"EAN '{name}' successfully deleted"
        DomainSuccess.__init__(self, self.fallback)
