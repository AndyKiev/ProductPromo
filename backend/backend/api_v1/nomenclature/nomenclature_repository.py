from pp_common.crud import BaseRepository
from backend.api_v1.nomenclature.nomenclature_model import Nomenclature


class NomenclatureRepository(BaseRepository):
    model = Nomenclature
