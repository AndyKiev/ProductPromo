from backend.api_v1.family.family_messages import (
    FAMILY_CREATE_SUCCESS,
    FAMILY_UPDATE_SUCCESS,
    FAMILY_DELETE_SUCCESS,
)
from backend.api_v1.base.success import DomainSuccess, DeleteSuccess, CreateSuccess, UpdateSuccess


class FamilyCreateSuccess(CreateSuccess):
    message_key = FAMILY_CREATE_SUCCESS["message_key"]

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = FAMILY_CREATE_SUCCESS["fallback"]
        DomainSuccess.__init__(self, self.fallback)


class FamilyUpdateSuccess(UpdateSuccess):
    message_key = FAMILY_UPDATE_SUCCESS["message_key"]

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = FAMILY_UPDATE_SUCCESS["fallback"]
        DomainSuccess.__init__(self, self.fallback)


class FamilyDeleteSuccess(DeleteSuccess):
    message_key = FAMILY_DELETE_SUCCESS["message_key"]

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = FAMILY_DELETE_SUCCESS["fallback"]
        DomainSuccess.__init__(self, self.fallback)
