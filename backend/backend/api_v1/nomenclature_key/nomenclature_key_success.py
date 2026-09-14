from backend.api_v1.nomenclature_key.nomenclature_key_messages import (
    NOMENCLATURE_KEY_CREATE_SUCCESS,
    NOMENCLATURE_KEY_UPDATE_SUCCESS,
    NOMENCLATURE_KEY_DELETE_SUCCESS,
)
from backend.api_v1.base.success import DomainSuccess, DeleteSuccess, CreateSuccess, UpdateSuccess


class NomenclatureKeyCreateSuccess(CreateSuccess):
    message_key = NOMENCLATURE_KEY_CREATE_SUCCESS["message_key"]

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = NOMENCLATURE_KEY_CREATE_SUCCESS["fallback"]
        DomainSuccess.__init__(self, self.fallback)


class NomenclatureKeyUpdateSuccess(UpdateSuccess):
    message_key = NOMENCLATURE_KEY_UPDATE_SUCCESS["message_key"]

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = NOMENCLATURE_KEY_UPDATE_SUCCESS["fallback"]
        DomainSuccess.__init__(self, self.fallback)


class NomenclatureKeyDeleteSuccess(DeleteSuccess):
    message_key = NOMENCLATURE_KEY_DELETE_SUCCESS["message_key"]

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = NOMENCLATURE_KEY_DELETE_SUCCESS["fallback"]
        DomainSuccess.__init__(self, self.fallback)
