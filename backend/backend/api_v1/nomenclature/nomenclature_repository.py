from backend.api_v1.base.base_repository import BaseRepository
from backend.api_v1.nomenclature.nomenclature_model import Nomenclature


class NomenclatureRepository(BaseRepository):
    model = Nomenclature
