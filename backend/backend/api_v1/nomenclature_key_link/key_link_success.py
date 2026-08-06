from backend.api_v1.base.success import DomainSuccess, DeleteSuccess, CreateSuccess, UpdateSuccess


class KeyLinkCreateSuccess(CreateSuccess):
    message_key = "keyLinkCreateSuccess"

    def __init__(self, level: int) -> None:
        self.template_vars = {"level": level}
        self.fallback = f"KeyLink level {level} successfully created"
        DomainSuccess.__init__(self, self.fallback)


class KeyLinkUpdateSuccess(UpdateSuccess):
    message_key = "keyLinkUpdateSuccess"

    def __init__(self, level: int) -> None:
        self.template_vars = {"level": level}
        self.fallback = f"KeyLink level {level} successfully updated"
        DomainSuccess.__init__(self, self.fallback)


class KeyLinkDeleteSuccess(DeleteSuccess):
    message_key = "keyLinkDeleteSuccess"

    def __init__(self, level: int) -> None:
        self.template_vars = {"level": level}
        self.fallback = f"KeyLink level {level} successfully deleted"
        DomainSuccess.__init__(self, self.fallback)
