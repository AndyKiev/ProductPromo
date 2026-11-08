from pp_common.crud import BaseRepository
from backend.api_v1.status_type.status_type_model import StatusType


class StatusTypeRepository(BaseRepository):
    model = StatusType
