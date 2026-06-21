from pydantic import BaseModel, ConfigDict
from typing import Optional


class StatusType(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    code: Optional[str] = None
    name: Optional[str] = None      # resolved to the employee's language in the service
