from backend.api_v1.category.category_messages import (
    CATEGORY_NOT_FOUND,
    CATEGORY_NAME_TAKEN,
    CATEGORY_DELETE_ERROR,
)
from backend.api_v1.base.errors import NotFoundError, AlreadyExistsError, DeleteError, DomainError


class CategoryNotFound(NotFoundError):
    message_key = CATEGORY_NOT_FOUND["message_key"]

    def __init__(self, id_: int) -> None:
        self.template_vars = {"id": id_}
        self.fallback = CATEGORY_NOT_FOUND["fallback"]
        super().__init__("Category", "id", id_)


class CategoryNameTaken(AlreadyExistsError):
    message_key = CATEGORY_NAME_TAKEN["message_key"]

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = CATEGORY_NAME_TAKEN["fallback"]
        super().__init__("Category", "name", name)


class CategoryDeleteError(DeleteError):
    message_key = CATEGORY_DELETE_ERROR["message_key"]

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = CATEGORY_DELETE_ERROR["fallback"]
        DomainError.__init__(self, self.fallback)
