from backend.api_v1.nomenclature.nomenclature_messages import (
    NOMENCLATURE_CREATE_SUCCESS,
    NOMENCLATURE_UPDATE_SUCCESS,
    NOMENCLATURE_DELETE_SUCCESS,
)
from backend.api_v1.base.success import DomainSuccess, DeleteSuccess, CreateSuccess, UpdateSuccess


class NomenclatureCreateSuccess(CreateSuccess):
    message_key = NOMENCLATURE_CREATE_SUCCESS["message_key"]

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = NOMENCLATURE_CREATE_SUCCESS["fallback"]
        DomainSuccess.__init__(self, self.fallback)


class NomenclatureUpdateSuccess(UpdateSuccess):
    message_key = NOMENCLATURE_UPDATE_SUCCESS["message_key"]

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = NOMENCLATURE_UPDATE_SUCCESS["fallback"]
        DomainSuccess.__init__(self, self.fallback)


class NomenclatureDeleteSuccess(DeleteSuccess):
    message_key = NOMENCLATURE_DELETE_SUCCESS["message_key"]

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = NOMENCLATURE_DELETE_SUCCESS["fallback"]
        DomainSuccess.__init__(self, self.fallback)
