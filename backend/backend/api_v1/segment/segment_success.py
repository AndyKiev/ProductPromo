from backend.api_v1.segment.segment_messages import (
    SEGMENT_CREATE_SUCCESS,
    SEGMENT_UPDATE_SUCCESS,
    SEGMENT_DELETE_SUCCESS,
)
from backend.api_v1.base.success import DomainSuccess, DeleteSuccess, CreateSuccess, UpdateSuccess


class SegmentCreateSuccess(CreateSuccess):
    message_key = SEGMENT_CREATE_SUCCESS["message_key"]

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = SEGMENT_CREATE_SUCCESS["fallback"]
        DomainSuccess.__init__(self, self.fallback)


class SegmentUpdateSuccess(UpdateSuccess):
    message_key = SEGMENT_UPDATE_SUCCESS["message_key"]

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = SEGMENT_UPDATE_SUCCESS["fallback"]
        DomainSuccess.__init__(self, self.fallback)


class SegmentDeleteSuccess(DeleteSuccess):
    message_key = SEGMENT_DELETE_SUCCESS["message_key"]

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = SEGMENT_DELETE_SUCCESS["fallback"]
        DomainSuccess.__init__(self, self.fallback)
