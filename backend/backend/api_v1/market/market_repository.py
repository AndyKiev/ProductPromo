from backend.api_v1.base.base_repository import BaseRepository
from backend.api_v1.market.market_model import Market


class MarketRepository(BaseRepository):
    model = Market
