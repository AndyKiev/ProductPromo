from backend.api_v1.category.category_messages import (
    CATEGORY_CREATE_SUCCESS,
    CATEGORY_UPDATE_SUCCESS,
    CATEGORY_DELETE_SUCCESS,
)
from backend.api_v1.base.success import DomainSuccess, DeleteSuccess, CreateSuccess, UpdateSuccess


class CategoryCreateSuccess(CreateSuccess):
    message_key = CATEGORY_CREATE_SUCCESS["message_key"]

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = CATEGORY_CREATE_SUCCESS["fallback"]
        DomainSuccess.__init__(self, self.fallback)


class CategoryUpdateSuccess(UpdateSuccess):
    message_key = CATEGORY_UPDATE_SUCCESS["message_key"]

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = CATEGORY_UPDATE_SUCCESS["fallback"]
        DomainSuccess.__init__(self, self.fallback)


class CategoryDeleteSuccess(DeleteSuccess):
    message_key = CATEGORY_DELETE_SUCCESS["message_key"]

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = CATEGORY_DELETE_SUCCESS["fallback"]
        DomainSuccess.__init__(self, self.fallback)
