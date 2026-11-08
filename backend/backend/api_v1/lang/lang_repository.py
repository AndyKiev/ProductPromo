from pp_common.crud import BaseRepository
from backend.api_v1.lang.lang_model import Lang


class LangRepository(BaseRepository):
    model = Lang
