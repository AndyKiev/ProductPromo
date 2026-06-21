from backend.api_v1.base.base_repository import BaseRepository
from backend.api_v1.status_type.status_type_model import StatusType


class StatusTypeRepository(BaseRepository):
    model = StatusType
