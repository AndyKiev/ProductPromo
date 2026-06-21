from backend.api_v1.base.base_repository import BaseRepository
from backend.api_v1.nomenclature_key.nomenclature_key_model import NomenclatureKey


class NomenclatureKeyRepository(BaseRepository):
    model = NomenclatureKey
