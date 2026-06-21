from typing import List, Optional

from sqlalchemy.ext.asyncio import AsyncSession

from backend.api_v1.base.base_service import BaseService
from backend.api_v1.base.i18n import lang_suffix_for, localized_name
from backend.api_v1.status_type.status_type_repository import StatusTypeRepository
from backend.api_v1.status_type.status_type_schema import StatusType as StatusTypeSchema
from backend.api_v1.employee.employee_schema import EmployeeSchema as UserSchema


class StatusTypeService(BaseService):
    """Read-only directory; status names resolved to the employee's language."""

    def __init__(self, repository: StatusTypeRepository, user: Optional[UserSchema] = None,
                 session: Optional[AsyncSession] = None):
        super().__init__(repository, user=user, session=session)

    def _to_schema(self, row) -> StatusTypeSchema:
        s = StatusTypeSchema.model_validate(row)
        s.name = localized_name(row, lang_suffix_for(self.user))
        return s

    async def list_status_types(self, sort: Optional[str] = None) -> List[StatusTypeSchema]:
        rows = await self.get_all(sort_json=sort)
        return [self._to_schema(r) for r in rows]

    async def get_by_id(self, id: int) -> Optional[StatusTypeSchema]:
        row = await self.repository.get_by_id(id)
        return self._to_schema(row) if row else None
