from backend.api_v1.base.success import DomainSuccess, DeleteSuccess, CreateSuccess, UpdateSuccess


class MarketCreateSuccess(CreateSuccess):
    message_key = "marketCreateSuccess"

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = f"Market '{name}' successfully created"
        DomainSuccess.__init__(self, self.fallback)


class MarketUpdateSuccess(UpdateSuccess):
    message_key = "marketUpdateSuccess"

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = f"Market '{name}' successfully updated"
        DomainSuccess.__init__(self, self.fallback)


class MarketDeleteSuccess(DeleteSuccess):
    message_key = "marketDeleteSuccess"

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = f"Market '{name}' successfully deleted"
        DomainSuccess.__init__(self, self.fallback)
