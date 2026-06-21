from backend.api_v1.base.errors import NotFoundError, AlreadyExistsError, DeleteError, DomainError


class SegmentNotFound(NotFoundError):
    message_key = "segmentNotFound"

    def __init__(self, id_: int) -> None:
        self.template_vars = {"id": id_}
        self.fallback = f"Segment with ID {id_} not found"
        super().__init__("Segment", "id", id_)


class SegmentNameTaken(AlreadyExistsError):
    message_key = "segmentNameTaken"

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = f"Segment '{name}' already exists"
        super().__init__("Segment", "name", name)


class SegmentDeleteError(DeleteError):
    message_key = "segmentDeleteError"

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = f"Segment '{name}' cannot be deleted because it is referenced by other records"
        DomainError.__init__(self, self.fallback)
