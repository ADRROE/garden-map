from uuid import uuid4
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Float, DateTime, ForeignKey, JSON, func
from app.database import Base
from typing import List, Tuple


class GardenElement(Base):
    __tablename__ = "t_garden_elements"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, index=True)
    menu_element_id: Mapped[str] = mapped_column(String(3))
    name: Mapped[str] = mapped_column(String(255))
    icon: Mapped[str] = mapped_column(String(255))
    x: Mapped[float] = mapped_column(Float)
    y: Mapped[float] = mapped_column(Float)
    width: Mapped[float] = mapped_column(Float)
    height: Mapped[float] = mapped_column(Float)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    coverage: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    default_width: Mapped[float | None] = mapped_column(Float, nullable=True)
    default_height: Mapped[float | None] = mapped_column(Float, nullable=True)
    cursor: Mapped[str | None] = mapped_column(String(255), nullable=True)
    category: Mapped[str] = mapped_column(String(255))
    sub_category: Mapped[str] = mapped_column(String(255))
    wcvp_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    rhs_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    date_planted: Mapped[DateTime | None] = mapped_column(DateTime, nullable=True)
    price: Mapped[float | None] = mapped_column(Float, nullable=True)
    last_modified: Mapped[DateTime] = mapped_column(DateTime, default=func.now(), onupdate=func.now())

class GardenElementHistory(Base):
    __tablename__ = "t_garden_elements_history"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    garden_element_id: Mapped[str] = mapped_column(String(36), index=True)
    menu_element_id: Mapped[str] = mapped_column(String(3))
    name: Mapped[str] = mapped_column(String(255))
    icon: Mapped[str] = mapped_column(String(255))
    x: Mapped[float] = mapped_column(Float)
    y: Mapped[float] = mapped_column(Float)
    width: Mapped[float] = mapped_column(Float)
    height: Mapped[float] = mapped_column(Float)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    coverage: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    default_width: Mapped[float | None] = mapped_column(Float, nullable=True)
    default_height: Mapped[float | None] = mapped_column(Float, nullable=True)
    cursor: Mapped[str | None] = mapped_column(String(255), nullable=True)
    category: Mapped[str] = mapped_column(String(255))
    sub_category: Mapped[str] = mapped_column(String(255))
    wcvp_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    rhs_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    date_planted: Mapped[DateTime | None] = mapped_column(DateTime, nullable=True)
    price: Mapped[float | None] = mapped_column(Float, nullable=True)
    last_modified: Mapped[DateTime] = mapped_column(DateTime, default=func.now())

class GardenZoneHistory(Base):
    __tablename__ = "t_garden_zones_history"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    zone_id: Mapped[str] = mapped_column(String(36), index=True)
    name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    color: Mapped[str] = mapped_column(String(255), nullable=False)
    border_path: Mapped[List[Tuple[int, int]]] = mapped_column(JSON, nullable=False)
    last_modified: Mapped[DateTime] = mapped_column(DateTime, default=func.now(), onupdate=func.now())

class GardenZone(Base):
    __tablename__ = "t_garden_zones"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, index=True)
    name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    color: Mapped[str] = mapped_column(String(255), nullable=False)
    border_path: Mapped[List[Tuple[int, int]]] = mapped_column(JSON, nullable=False)
    last_modified: Mapped[DateTime] = mapped_column(DateTime, default=func.now(), onupdate=func.now())


    coverage: Mapped[list["ColoredCell"]] = relationship(
        back_populates="zone",
        cascade="all, delete-orphan"
    )


class ColoredCell(Base):
    __tablename__ = "t_colored_cells"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, index=True)
    col: Mapped[float] = mapped_column(Float, nullable=False)
    row: Mapped[float] = mapped_column(Float, nullable=False)
    color: Mapped[str] = mapped_column(String(20), nullable=False)
    menu_element_id: Mapped[str] = mapped_column(String(50), nullable=False)

    zone_id: Mapped[str] = mapped_column(ForeignKey("t_garden_zones.id"))
    zone: Mapped["GardenZone"] = relationship(back_populates="coverage")
