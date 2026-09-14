from backend.api_v1.import_code.import_code_messages import (
    IMPORT_CODE_CREATE_SUCCESS,
    IMPORT_CODE_UPDATE_SUCCESS,
    IMPORT_CODE_DELETE_SUCCESS,
)
from backend.api_v1.base.success import DomainSuccess, DeleteSuccess, CreateSuccess, UpdateSuccess


class ImportCodeCreateSuccess(CreateSuccess):
    message_key = IMPORT_CODE_CREATE_SUCCESS["message_key"]

    def __init__(self, code: str) -> None:
        self.template_vars = {"code": code}
        self.fallback = IMPORT_CODE_CREATE_SUCCESS["fallback"]
        DomainSuccess.__init__(self, self.fallback)


class ImportCodeUpdateSuccess(UpdateSuccess):
    message_key = IMPORT_CODE_UPDATE_SUCCESS["message_key"]

    def __init__(self, code: str) -> None:
        self.template_vars = {"code": code}
        self.fallback = IMPORT_CODE_UPDATE_SUCCESS["fallback"]
        DomainSuccess.__init__(self, self.fallback)


class ImportCodeDeleteSuccess(DeleteSuccess):
    message_key = IMPORT_CODE_DELETE_SUCCESS["message_key"]

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = IMPORT_CODE_DELETE_SUCCESS["fallback"]
        DomainSuccess.__init__(self, self.fallback)
