"""Copy of the employee service's employees and jobs, received over RabbitMQ
(exchange `employee`, see backend/messaging/identity.py). Login reads it. Ids are
the employee service's ids; rows are deactivated, never deleted.

Column names are snake_case here (not this service's PascalCase): the columns come
from the shared mixins every ProductPromo app uses for this copy."""
from pp_common.employees import EmployeeReplicaMixin, JobReplicaMixin

from backend.api_v1.base.base_model import Base


class Employee(EmployeeReplicaMixin, Base):
    __tablename__ = "employee"


class Job(JobReplicaMixin, Base):
    __tablename__ = "job"
