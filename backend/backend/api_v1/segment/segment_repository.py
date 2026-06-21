from backend.api_v1.base.base_repository import BaseRepository
from backend.api_v1.segment.segment_model import Segment


class SegmentRepository(BaseRepository):
    model = Segment

    async def by_parent(self, market_id: int):
        return await self.get_all(filters={"market_id": market_id}, sort="name")
