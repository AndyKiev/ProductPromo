from fastapi import APIRouter, Depends, Query
from backend.api_v1.msg.msg_service import MsgService
from backend.api_v1.msg.msg_dependencies import get_msg_service
from backend.api_v1.msg.msg_schema import MessageBundle

router = APIRouter(prefix="/messages", tags=["Translations"])


@router.get("", response_model=MessageBundle)
async def get_messages(lang_id: int = Query(gt=0), service: MsgService = Depends(get_msg_service)):
    return await service.bundle(lang_id)
