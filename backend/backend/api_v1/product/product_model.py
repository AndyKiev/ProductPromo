from sqlalchemy import Integer, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.api_v1.base.base_model import Base


class Product(Base):
    __tablename__ = "product"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    code: Mapped[str] = mapped_column(String(16), nullable=False, unique=True, index=True)
    name: Mapped[str | None] = mapped_column(String(128), nullable=True, index=True)
    nomenclature_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("nomenclature.Id"), nullable=True, index=True
    )
    status_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("product_status.id"), nullable=True, index=True
    )
    import_code_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("import_code.id"), nullable=True, index=True
    )
    product_type_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("product_type.id"), nullable=True, index=True
    )

    nomenclature = relationship("Nomenclature", lazy="joined")
    status = relationship("ProductStatus", lazy="joined")
    import_code_ref = relationship("ImportCode", lazy="joined")
    product_type = relationship("ProductType", lazy="joined")
