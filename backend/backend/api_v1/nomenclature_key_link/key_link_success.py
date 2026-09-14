from backend.api_v1.nomenclature_key_link.nomenclature_key_link_messages import (
    KEY_LINK_CREATE_SUCCESS,
    KEY_LINK_UPDATE_SUCCESS,
    KEY_LINK_DELETE_SUCCESS,
)
from backend.api_v1.base.success import DomainSuccess, DeleteSuccess, CreateSuccess, UpdateSuccess


class KeyLinkCreateSuccess(CreateSuccess):
    message_key = KEY_LINK_CREATE_SUCCESS["message_key"]

    def __init__(self, level: int) -> None:
        self.template_vars = {"level": level}
        self.fallback = KEY_LINK_CREATE_SUCCESS["fallback"]
        DomainSuccess.__init__(self, self.fallback)


class KeyLinkUpdateSuccess(UpdateSuccess):
    message_key = KEY_LINK_UPDATE_SUCCESS["message_key"]

    def __init__(self, level: int) -> None:
        self.template_vars = {"level": level}
        self.fallback = KEY_LINK_UPDATE_SUCCESS["fallback"]
        DomainSuccess.__init__(self, self.fallback)


class KeyLinkDeleteSuccess(DeleteSuccess):
    message_key = KEY_LINK_DELETE_SUCCESS["message_key"]

    def __init__(self, level: int) -> None:
        self.template_vars = {"level": level}
        self.fallback = KEY_LINK_DELETE_SUCCESS["fallback"]
        DomainSuccess.__init__(self, self.fallback)
