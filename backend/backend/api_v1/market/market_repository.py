from pp_common.crud import BaseRepository
from backend.api_v1.market.market_model import Market


class MarketRepository(BaseRepository):
    model = Market
