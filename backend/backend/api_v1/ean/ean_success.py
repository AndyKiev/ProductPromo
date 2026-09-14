from backend.api_v1.ean.ean_messages import (
    EAN_CREATE_SUCCESS,
    EAN_UPDATE_SUCCESS,
    EAN_DELETE_SUCCESS,
)
from backend.api_v1.base.success import DomainSuccess, DeleteSuccess, CreateSuccess, UpdateSuccess


class EanCreateSuccess(CreateSuccess):
    message_key = EAN_CREATE_SUCCESS["message_key"]

    def __init__(self, ean: str) -> None:
        self.template_vars = {"ean": ean}
        self.fallback = EAN_CREATE_SUCCESS["fallback"]
        DomainSuccess.__init__(self, self.fallback)


class EanUpdateSuccess(UpdateSuccess):
    message_key = EAN_UPDATE_SUCCESS["message_key"]

    def __init__(self, ean: str) -> None:
        self.template_vars = {"ean": ean}
        self.fallback = EAN_UPDATE_SUCCESS["fallback"]
        DomainSuccess.__init__(self, self.fallback)


class EanDeleteSuccess(DeleteSuccess):
    message_key = EAN_DELETE_SUCCESS["message_key"]

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = EAN_DELETE_SUCCESS["fallback"]
        DomainSuccess.__init__(self, self.fallback)
