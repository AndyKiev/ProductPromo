from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Declarative base. Legacy models set __tablename__ explicitly and map
    physical column names via mapped_column("RealName", ...)."""
    pass
