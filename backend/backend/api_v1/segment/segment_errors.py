from backend.api_v1.segment.segment_messages import (
    SEGMENT_NOT_FOUND,
    SEGMENT_NAME_TAKEN,
    SEGMENT_DELETE_ERROR,
)
from backend.api_v1.base.errors import NotFoundError, AlreadyExistsError, DeleteError, DomainError


class SegmentNotFound(NotFoundError):
    message_key = SEGMENT_NOT_FOUND["message_key"]

    def __init__(self, id_: int) -> None:
        self.template_vars = {"id": id_}
        self.fallback = SEGMENT_NOT_FOUND["fallback"]
        super().__init__("Segment", "id", id_)


class SegmentNameTaken(AlreadyExistsError):
    message_key = SEGMENT_NAME_TAKEN["message_key"]

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = SEGMENT_NAME_TAKEN["fallback"]
        super().__init__("Segment", "name", name)


class SegmentDeleteError(DeleteError):
    message_key = SEGMENT_DELETE_ERROR["message_key"]

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = SEGMENT_DELETE_ERROR["fallback"]
        DomainError.__init__(self, self.fallback)
