from backend.api_v1.base.errors import NotFoundError
from backend.api_v1.lang.lang_messages import LANG_NOT_FOUND


class LangNotFound(NotFoundError):
    message_key = LANG_NOT_FOUND["message_key"]

    def __init__(self, lang_id: int):
        self.fallback = LANG_NOT_FOUND["fallback"]
        super().__init__("Lang", "id", lang_id)
