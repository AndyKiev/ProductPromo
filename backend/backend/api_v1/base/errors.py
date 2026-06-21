class DomainError(Exception):
    """Base domain error. Subclasses may set `self.fallback` (and optionally
    `message_key` / `template_vars`) before calling super().__init__()."""
    def __init__(self, message: str | None = None) -> None:
        if not getattr(self, "fallback", None):
            self.fallback = message or "Domain error"
        super().__init__(self.fallback)


class NotFoundError(DomainError):
    def __init__(self, model: str, field: str, value) -> None:
        if not getattr(self, "fallback", None):
            self.fallback = f"{model} with {field}={value} not found"
        super().__init__(self.fallback)


class AlreadyExistsError(DomainError):
    def __init__(self, model: str, field: str, value) -> None:
        if not getattr(self, "fallback", None):
            self.fallback = f"{model} with {field}={value} already exists"
        super().__init__(self.fallback)


class RelationshipError(DomainError):
    pass


class DeleteError(DomainError):
    def __init__(self, model: str, name) -> None:
        if not getattr(self, "fallback", None):
            self.fallback = f"{model} '{name}' cannot be deleted (referenced elsewhere)"
        super().__init__(self.fallback)
