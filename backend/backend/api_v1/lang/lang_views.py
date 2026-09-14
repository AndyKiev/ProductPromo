from fastapi import APIRouter, Depends
from backend.api_v1.lang.lang_dependencies import get_lang_service
from backend.api_v1.lang.lang_service import LangService
from backend.api_v1.lang.lang_schema import LangRead

router = APIRouter(prefix="/langs", tags=["Translations"])


@router.get("", response_model=list[LangRead])
async def list_languages(service: LangService = Depends(get_lang_service)):
    return await service.list_languages()
