from uuid import uuid4
from app.utils import to_column_letter
from sqlalchemy.orm import Mapped, mapped_column, relationship, Session, object_session
from sqlalchemy import String, Float, DateTime, ForeignKey, JSON, func, event
from app.database import Base
from typing import List, Tuple


class GardenItem(Base):
    __tablename__ = "T_garden_items"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, index=True)
    palette_item_id: Mapped[str] = mapped_column(String(3))
    display_name: Mapped[str] = mapped_column(String(255))
    icon: Mapped[str] = mapped_column(String(255))
    x: Mapped[float] = mapped_column(Float)
    y: Mapped[float] = mapped_column(Float)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    width: Mapped[float] = mapped_column(Float)
    height: Mapped[float] = mapped_column(Float)
    rotation: Mapped[float] = mapped_column(Float, nullable=True)
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

    coverage: Mapped[list["Cell"]] = relationship(
        back_populates="item",
        cascade="all, delete-orphan"
    )

class GardenItemHistory(Base):
    __tablename__ = "T_garden_items_history"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    garden_item_id: Mapped[str] = mapped_column(String(36), index=True)
    palette_item_id: Mapped[str] = mapped_column(String(3))
    display_name: Mapped[str] = mapped_column(String(255))
    icon: Mapped[str] = mapped_column(String(255))
    x: Mapped[float] = mapped_column(Float)
    y: Mapped[float] = mapped_column(Float)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    width: Mapped[float] = mapped_column(Float)
    height: Mapped[float] = mapped_column(Float)
    rotation: Mapped[float] = mapped_column(Float, nullable=True)
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

    coverage: Mapped[list["Cell"]] = relationship(
        back_populates="item_history",
        cascade="all, delete-orphan"
    )

@event.listens_for(GardenItem, "before_update")
def track_garden_item_history(mapper, connection, target: GardenItem):
    session = object_session(target)
    if not session.info.get("record_history", False):
        return

    db_state = session.get(GardenItem, target.id)
    if not db_state:
        return
    
    if session.info.get(f"_history_created_for_{target.id}"):
        return
    session.info[f"_history_created_for_{target.id}"] = True

    history_entry = GardenItemHistory(
        garden_item_id=db_state.id,
        palette_item_id=db_state.palette_item_id,
        display_name=db_state.display_name,
        icon=db_state.icon,
        x=db_state.x,
        y=db_state.y,
        location=db_state.location,
        width=db_state.width,
        height=db_state.height,
        rotation=db_state.rotation,
        category=db_state.category,
        sub_category=db_state.sub_category,
        wcvp_id=db_state.wcvp_id,
        rhs_id=db_state.rhs_id,
        species=db_state.species,
        genus=db_state.genus,
        circumference=db_state.circumference,
        price=db_state.price,
        t_watered=db_state.t_watered,
        dt_watered=db_state.dt_watered,
        q_watered=db_state.q_watered,
        t_amended=db_state.t_amended,
        q_amended=db_state.q_amended,
        last_modified=db_state.last_modified,
    )

    for cell in db_state.coverage:
        copied_cell = Cell(
            col=cell.col,
            row=cell.row,
            color=cell.color,
            palette_item_id=cell.palette_item_id,
            serialized=cell.serialized,
            item_history=history_entry
        )
        history_entry.coverage.append(copied_cell)

    session.add(history_entry)

class GardenZone(Base):
    __tablename__ = "T_garden_zones"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, index=True)
    display_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    color: Mapped[str] = mapped_column(String(255), nullable=False)
    border_path: Mapped[List[Tuple[int, int]]] = mapped_column(JSON, nullable=False)
    ph: Mapped[float | None] = mapped_column(Float, nullable=True)
    temp: Mapped[float | None] = mapped_column(Float, nullable=True)
    moisture: Mapped[float | None] = mapped_column(Float, nullable=True)
    sunshine: Mapped[float | None] = mapped_column(Float, nullable=True)
    compaction: Mapped[float | None] = mapped_column(Float, nullable=True)
    soil_mix: Mapped[str | None] = mapped_column(String(36), nullable=True)
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
    garden_zone_id: Mapped[str] = mapped_column(String(36), index=True)
    display_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    color: Mapped[str] = mapped_column(String(255), nullable=False)
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
        back_populates="zone_history",
        cascade="all, delete-orphan"
    )

@event.listens_for(GardenZone, "before_update")
def track_garden_zone_history(mapper, connection, target: GardenZone):
    session = object_session(target)
    if not session.info.get("record_history", False):
        return
    db_state: GardenZone = session.get(GardenZone, target.id)
    if not db_state:
        return

    if session.info.get(f"_history_created_for_{target.id}"):
        return
    session.info[f"_history_created_for_{target.id}"] = True

    history_entry = GardenZoneHistory(
        garden_zone_id=db_state.id,
        display_name=db_state.display_name,
        color=db_state.color,
        border_path=db_state.border_path,
        ph=db_state.ph,
        temp=db_state.temp,
        moisture=db_state.moisture,
        sunshine=db_state.sunshine,
        compaction=db_state.compaction,
        soil_mix=db_state.soil_mix,
        t_watered=db_state.t_watered,
        dt_watered=db_state.dt_watered,
        q_watered=db_state.q_watered,
        t_amended=db_state.t_amended,
        q_amended=db_state.q_amended,
        last_modified=db_state.last_modified,
    )

    for cell in db_state.coverage:
        copied_cell = Cell(
            col=cell.col,
            row=cell.row,
            color=cell.color,
            palette_item_id=cell.palette_item_id,
            serialized=cell.serialized,
            zone_history=history_entry
        )
        history_entry.coverage.append(copied_cell)

    session.add(history_entry)

class Cell(Base):
    __tablename__ = "T_cells"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()), index=True)
    col: Mapped[float] = mapped_column(Float, nullable=False)
    row: Mapped[float] = mapped_column(Float, nullable=False)
    color: Mapped[str] = mapped_column(String(20), nullable=True)
    palette_item_id: Mapped[str] = mapped_column(String(50), nullable=True)
    serialized: Mapped[str] = mapped_column(String(10), nullable=True)

    # Foreign keys
    garden_zone_id: Mapped[str | None] = mapped_column(ForeignKey("T_garden_zones.id"), nullable=True)
    garden_item_id: Mapped[str | None] = mapped_column(ForeignKey("T_garden_items.id"), nullable=True)
    garden_zone_history_id: Mapped[str | None] = mapped_column(ForeignKey("T_garden_zones_history.id"), nullable=True)
    garden_item_history_id: Mapped[str | None] = mapped_column(ForeignKey("T_garden_items_history.id"), nullable=True)

    # Relationships
    zone: Mapped["GardenZone"] = relationship(
        back_populates="coverage",
        foreign_keys=[garden_zone_id]
    )

    item: Mapped["GardenItem"] = relationship(
        back_populates="coverage",
        foreign_keys=[garden_item_id]
    )

    zone_history: Mapped["GardenZoneHistory"] = relationship(
        back_populates="coverage",
        foreign_keys=[garden_zone_history_id]
    )

    item_history: Mapped["GardenItemHistory"] = relationship(
        back_populates="coverage",
        foreign_keys=[garden_item_history_id]
    )

@event.listens_for(Cell, "before_insert")
@event.listens_for(Cell, "before_update")
def set_serialized_cell(_mapper, _connection, target: Cell):
    if target.col is not None and target.row is not None:
        target.serialized = f"{to_column_letter(int(target.col))}{int(target.row)}"
