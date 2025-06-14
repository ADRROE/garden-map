from pydantic import BaseModel, Field
from typing import List, Tuple, Literal
from datetime import datetime

class Vec2(BaseModel):
    x: float
    y: float
    
class Cell(BaseModel):
    col: int
    row: int
    color: str
    palette_item_id: str | None = None

    class Config:
        from_attributes = True
        populate_by_name = True

class GardenItemBase(BaseModel):
    id: str
    palette_item_id: str
    display_name: str | None = None
    position: Vec2
    location: str
    width: int
    height: int
    rotation: float | None = None
    coverage: list[Cell] | None = None
    category: str
    sub_category: str | None = None
    wcvp_id: str | None = None
    rhs_id: str | None = None
    species: str | None = None
    genus: str | None = None
    circumference: int | None = None
    price: float | None = None
    t_watered: datetime | None = None
    dt_watered: int | None = None
    q_watered: float | None = None
    t_amended: datetime | None = None
    q_amended: datetime | None = None
    
    class Config:
        from_attributes = True
        validate_assignment = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
        }

class GardenItemHistory(BaseModel):
    id: str
    garden_item_id: str
    palette_item_id: str
    display_name: str | None = None
    position: Vec2
    location: str
    width: int
    height: int
    rotation: float | None = None
    coverage: list[Cell] | None = None
    category: str
    sub_category: str | None = None
    wcvp_id: str | None = None
    rhs_id: str | None = None
    species: str | None = None
    genus: str | None = None
    circumference: int | None = None
    price: float | None = None
    t_watered: datetime | None = None
    dt_watered: int | None = None
    q_watered: float | None = None
    t_amended: datetime | None = None
    q_amended: datetime | None = None
    last_modified: datetime

    class Config:
        from_attributes = True
        populate_by_name = True


class GardenItemCreate(GardenItemBase):
    pass


class GardenItem(GardenItemBase):
    pass


class GardenItemUpdate(BaseModel):
    id: str
    palette_item_id: str
    display_name: str | None = None
    position: Vec2 | None = None
    location: str
    width: int | None = None
    height: int | None = None
    rotation: float | None = None
    coverage: list[Cell] | None = None
    wcvp_id: str | None = None
    rhs_id: str | None = None
    species: str | None = None
    genus: str | None = None
    circumference: int | None = None     
    t_watered: datetime | None = None
    dt_watered: int | None = None
    q_watered: float | None = None
    t_amended: datetime | None = None
    q_amended: datetime | None = None
    price: float | None = None
    operation: Literal["create", "modify"] | None = None

    class Config:
        populate_by_name = True

class GardenItemUpdateWrapper(BaseModel):
    updates: GardenItemUpdate
    operation: Literal["create", "modify"]

class GardenZoneBase(BaseModel):
    id: str
    display_name: str | None = None
    color: str
    coverage: List[Cell]
    border_path: List[Tuple[int, int]] = None
    ph: float | None = None
    temp: float | None = None
    moisture: float | None = None
    sunshine: float | None = None
    compaction: float | None = None
    soil_mix: str | None = None
    t_watered: datetime | None = None
    dt_watered: int | None = None
    q_watered: float | None = None
    t_amended: datetime | None = None
    q_amended: datetime | None = None

    class Config:
        from_attributes = True
        populate_by_name = True

class GardenZoneHistory(BaseModel):
    id: str
    zone_id: str
    display_name: str | None = None
    color: str
    coverage: List[Cell]
    border_path: List[Tuple[int, int]] = None
    ph: float | None = None
    temp: float | None = None
    moisture: float | None = None
    sunshine: float | None = None
    compaction: float | None = None
    soil_mix: str | None = None
    t_watered: datetime | None = None
    dt_watered: int | None = None
    q_watered: float | None = None
    t_amended: datetime | None = None
    q_amended: datetime | None = None
    last_modified: datetime

    class Config:
        from_attributes = True
        populate_by_name = True

class GardenZoneUpdate(BaseModel):
    id: str
    display_name: str | None = None
    color: str | None = None
    coverage: List[Cell] | None = None
    border_path: List[Tuple[int, int]] | None = None
    ph: float | None = None
    temp: float | None = None
    moisture: float | None = None
    sunshine: float | None = None
    compaction: float | None = None
    soil_mix: str | None = None
    t_watered: datetime | None = None
    dt_watered: int | None = None
    q_watered: float | None = None
    t_amended: datetime | None = None
    q_amended: datetime | None = None
    operation: Literal["create", "modify"] | None = None

    class Config:
        from_attributes = True
        populate_by_name = True

class GardenZoneUpdateWrapper(BaseModel):
    updates: GardenZoneUpdate
    operation: Literal["create", "modify"]

class GardenZoneCreate(GardenZoneBase):
    pass
    
class GardenZone(GardenZoneBase):
    pass
