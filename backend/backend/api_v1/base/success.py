class DomainSuccess:
    def __init__(self, message: str | None = None) -> None:
        if not getattr(self, "fallback", None):
            self.fallback = message or "OK"
        self.message = self.fallback


class CreateSuccess(DomainSuccess):
    pass


class UpdateSuccess(DomainSuccess):
    pass


class DeleteSuccess(DomainSuccess):
    pass
