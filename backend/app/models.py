from uuid import uuid4
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Integer, Float, DateTime, ForeignKey, JSON, func
from app.database import Base
from typing import List, Tuple


class GardenItem(Base):
    __tablename__ = "T_garden_items"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, index=True)
    palette_item_id: Mapped[str] = mapped_column(String(3))
    display_name: Mapped[str] = mapped_column(String(255))
    x: Mapped[float] = mapped_column(Float)
    y: Mapped[float] = mapped_column(Float)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    width: Mapped[float] = mapped_column(Float)
    height: Mapped[float] = mapped_column(Float)
    rotation: Mapped[float] = mapped_column(Float, nullable=True)
    coverage: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    category: Mapped[str] = mapped_column(String(255))
    sub_category: Mapped[str] = mapped_column(String(255))
    wcvp_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    rhs_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    species: Mapped[str | None] = mapped_column(String(255), nullable=True)
    genus: Mapped[str | None] = mapped_column(String(255), nullable=True)
    circumference: Mapped[int | None] = mapped_column(Float, nullable=True)
    price: Mapped[float | None] = mapped_column(Float, nullable=True)
    t_watered: Mapped[DateTime | None] = mapped_column(DateTime, nullable=True)
    dt_watered: Mapped[float] = mapped_column(Float, nullable=True)
    q_watered: Mapped[float | None] = mapped_column(Float, nullable=True)
    t_amended: Mapped[DateTime | None] = mapped_column(DateTime, nullable=True)
    q_amended: Mapped[float | None] = mapped_column(Float, nullable=True)
    last_modified: Mapped[DateTime] = mapped_column(DateTime, default=func.now(), onupdate=func.now())

class GardenItemHistory(Base):
    __tablename__ = "T_garden_items_history"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    garden_item_id: Mapped[str] = mapped_column(String(36), index=True)
    palette_item_id: Mapped[str] = mapped_column(String(3))
    display_name: Mapped[str] = mapped_column(String(255))
    x: Mapped[float] = mapped_column(Float)
    y: Mapped[float] = mapped_column(Float)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    width: Mapped[float] = mapped_column(Float)
    height: Mapped[float] = mapped_column(Float)
    rotation: Mapped[float] = mapped_column(Float, nullable=True)
    coverage: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    category: Mapped[str] = mapped_column(String(255))
    sub_category: Mapped[str] = mapped_column(String(255))
    wcvp_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    rhs_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    species: Mapped[str | None] = mapped_column(String(255), nullable=True)
    genus: Mapped[str | None] = mapped_column(String(255), nullable=True)
    circumference: Mapped[int | None] = mapped_column(Float, nullable=True)
    price: Mapped[float | None] = mapped_column(Float, nullable=True)
    t_watered: Mapped[DateTime | None] = mapped_column(DateTime, nullable=True)
    dt_watered: Mapped[float] = mapped_column(Float, nullable=True)
    q_watered: Mapped[float | None] = mapped_column(Float, nullable=True)
    t_amended: Mapped[DateTime | None] = mapped_column(DateTime, nullable=True)
    q_amended: Mapped[float | None] = mapped_column(Float, nullable=True)
    last_modified: Mapped[DateTime] = mapped_column(DateTime, default=func.now())

class GardenZone(Base):
    __tablename__ = "T_garden_zones"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, index=True)
    display_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    color: Mapped[str] = mapped_column(String(255), nullable=False)
    coverage: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    border_path: Mapped[List[Tuple[int, int]]] = mapped_column(JSON, nullable=False)
    ph: Mapped[float | None] = mapped_column(Float, nullable=True)
    temp: Mapped[float | None] = mapped_column(Float, nullable=True)
    moisture: Mapped[float | None] = mapped_column(Float, nullable=True)
    sunshine: Mapped[float | None] = mapped_column(Float, nullable=True)
    compaction: Mapped[float | None] = mapped_column(Float, nullable=True)
    soil_mix: Mapped[str | None] = mapped_column(String(255), nullable=True)
    t_watered: Mapped[DateTime | None] = mapped_column(DateTime, nullable=True)
    dt_watered: Mapped[float] = mapped_column(Float, nullable=True)
    q_watered: Mapped[float | None] = mapped_column(Float, nullable=True)
    t_amended: Mapped[DateTime | None] = mapped_column(DateTime, nullable=True)
    q_amended: Mapped[float | None] = mapped_column(Float, nullable=True)
    last_modified: Mapped[DateTime] = mapped_column(DateTime, default=func.now(), onupdate=func.now())


    coverage: Mapped[list["Cell"]] = relationship(
        back_populates="zone",
        cascade="all, delete-orphan"
    )

class GardenZoneHistory(Base):
    __tablename__ = "T_garden_zones_history"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    zone_id: Mapped[str] = mapped_column(String(36), index=True)
    display_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    color: Mapped[str] = mapped_column(String(255), nullable=False)
    coverage: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    border_path: Mapped[List[Tuple[int, int]]] = mapped_column(JSON, nullable=False)
    ph: Mapped[float | None] = mapped_column(Float, nullable=True)
    temp: Mapped[float | None] = mapped_column(Float, nullable=True)
    moisture: Mapped[float | None] = mapped_column(Float, nullable=True)
    sunshine: Mapped[float | None] = mapped_column(Float, nullable=True)
    compaction: Mapped[float | None] = mapped_column(Float, nullable=True)
    soil_mix: Mapped[str | None] = mapped_column(String(255), nullable=True)
    t_watered: Mapped[DateTime | None] = mapped_column(DateTime, nullable=True)
    dt_watered: Mapped[float] = mapped_column(Float, nullable=True)
    q_watered: Mapped[float | None] = mapped_column(Float, nullable=True)
    t_amended: Mapped[DateTime | None] = mapped_column(DateTime, nullable=True)
    q_amended: Mapped[float | None] = mapped_column(Float, nullable=True)
    last_modified: Mapped[DateTime] = mapped_column(DateTime, default=func.now(), onupdate=func.now())

class Cell(Base):
    __tablename__ = "T_cells"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, index=True)
    col: Mapped[float] = mapped_column(Float, nullable=False)
    row: Mapped[float] = mapped_column(Float, nullable=False)
    color: Mapped[str] = mapped_column(String(20), nullable=True)
    palette_item_id: Mapped[str] = mapped_column(String(50), nullable=True)

    zone_id: Mapped[str] = mapped_column(ForeignKey("t_garden_zones.id"))
    zone: Mapped["GardenZone"] = relationship(back_populates="coverage")
