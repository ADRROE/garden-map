from uuid import uuid4
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Float, DateTime, ForeignKey, JSON, func
from app.database import Base
from typing import List, Tuple


class GardenElement(Base):
    __tablename__ = "t_garden_elements"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, index=True)
    menu_element_id: Mapped[str] = mapped_column(String(3))
    display_name: Mapped[str] = mapped_column(String(255))
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
    display_species: Mapped[str | None] = mapped_column(String(255), nullable=True)
    display_genus: Mapped[str | None] = mapped_column(String(255), nullable=True)
    date_planted: Mapped[DateTime | None] = mapped_column(DateTime, nullable=True)
    date_fertilized: Mapped[DateTime | None] = mapped_column(DateTime, nullable=True)
    date_harvested: Mapped[DateTime | None] = mapped_column(DateTime, nullable=True)
    date_watered: Mapped[DateTime | None] = mapped_column(DateTime, nullable=True)
    amount_watered: Mapped[float | None] = mapped_column(Float, nullable=True)
    date_pruned: Mapped[DateTime | None] = mapped_column(DateTime, nullable=True)
    fertilizer_type: Mapped[str | None] = mapped_column(String(255), nullable=True)
    plant_form: Mapped[str | None] = mapped_column(String(255), nullable=True)
    status: Mapped[str | None] = mapped_column(String(255), nullable=True)
    date_status: Mapped[DateTime | None] = mapped_column(DateTime, nullable=True)
    circumference: Mapped[float | None] = mapped_column(Float, nullable=True)
    price: Mapped[float | None] = mapped_column(Float, nullable=True)
    last_modified: Mapped[DateTime] = mapped_column(DateTime, default=func.now(), onupdate=func.now())

class GardenElementHistory(Base):
    __tablename__ = "t_garden_elements_history"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    garden_element_id: Mapped[str] = mapped_column(String(36), index=True)
    menu_element_id: Mapped[str] = mapped_column(String(3))
    display_name: Mapped[str] = mapped_column(String(255))
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
    display_species: Mapped[str | None] = mapped_column(String(255), nullable=True)
    display_genus: Mapped[str | None] = mapped_column(String(255), nullable=True)
    date_planted: Mapped[DateTime | None] = mapped_column(DateTime, nullable=True)
    date_fertilized: Mapped[DateTime | None] = mapped_column(DateTime, nullable=True)
    date_harvested: Mapped[DateTime | None] = mapped_column(DateTime, nullable=True)
    date_watered: Mapped[DateTime | None] = mapped_column(DateTime, nullable=True)
    amount_watered: Mapped[float | None] = mapped_column(Float, nullable=True)
    date_pruned: Mapped[DateTime | None] = mapped_column(DateTime, nullable=True)
    fertilizer_type: Mapped[str | None] = mapped_column(String(255), nullable=True)
    plant_form: Mapped[str | None] = mapped_column(String(255), nullable=True)
    status: Mapped[str | None] = mapped_column(String(255), nullable=True)
    date_status: Mapped[DateTime | None] = mapped_column(DateTime, nullable=True)
    circumference: Mapped[float | None] = mapped_column(Float, nullable=True)
    price: Mapped[float | None] = mapped_column(Float, nullable=True)
    last_modified: Mapped[DateTime] = mapped_column(DateTime, default=func.now())

class GardenZoneHistory(Base):
    __tablename__ = "t_garden_zones_history"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    zone_id: Mapped[str] = mapped_column(String(36), index=True)
    display_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    color: Mapped[str] = mapped_column(String(255), nullable=False)
    border_path: Mapped[List[Tuple[int, int]]] = mapped_column(JSON, nullable=False)
    ph: Mapped[float | None] = mapped_column(Float, nullable=True)
    temp: Mapped[float | None] = mapped_column(Float, nullable=True)
    fert_date: Mapped[DateTime | None] = mapped_column(DateTime, nullable=True)
    water_date: Mapped[DateTime | None] = mapped_column(DateTime, nullable=True)
    water_amount: Mapped[float | None] = mapped_column(Float, nullable=True)
    fert_type: Mapped[str | None] = mapped_column(String(255), nullable=True)
    soil_mix: Mapped[str | None] = mapped_column(String(255), nullable=True)
    moisture: Mapped[float | None] = mapped_column(Float, nullable=True)
    sunshine: Mapped[float | None] = mapped_column(Float, nullable=True)
    last_modified: Mapped[DateTime] = mapped_column(DateTime, default=func.now(), onupdate=func.now())

class GardenZone(Base):
    __tablename__ = "t_garden_zones"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, index=True)
    display_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    color: Mapped[str] = mapped_column(String(255), nullable=False)
    border_path: Mapped[List[Tuple[int, int]]] = mapped_column(JSON, nullable=False)
    ph: Mapped[float | None] = mapped_column(Float, nullable=True)
    temp: Mapped[float | None] = mapped_column(Float, nullable=True)
    fert_date: Mapped[DateTime | None] = mapped_column(DateTime, nullable=True)
    water_date: Mapped[DateTime | None] = mapped_column(DateTime, nullable=True)
    water_amount: Mapped[float | None] = mapped_column(Float, nullable=True)
    fert_type: Mapped[str | None] = mapped_column(String(255), nullable=True)
    soil_mix: Mapped[str | None] = mapped_column(String(255), nullable=True)
    moisture: Mapped[float | None] = mapped_column(Float, nullable=True)
    sunshine: Mapped[float | None] = mapped_column(Float, nullable=True)
    last_modified: Mapped[DateTime] = mapped_column(DateTime, default=func.now(), onupdate=func.now())


    coverage: Mapped[list["Cell"]] = relationship(
        back_populates="zone",
        cascade="all, delete-orphan"
    )


class Cell(Base):
    __tablename__ = "t_colored_cells"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, index=True)
    col: Mapped[float] = mapped_column(Float, nullable=False)
    row: Mapped[float] = mapped_column(Float, nullable=False)
    color: Mapped[str] = mapped_column(String(20), nullable=True)
    menu_element_id: Mapped[str] = mapped_column(String(50), nullable=True)

    zone_id: Mapped[str] = mapped_column(ForeignKey("t_garden_zones.id"))
    zone: Mapped["GardenZone"] = relationship(back_populates="coverage")
