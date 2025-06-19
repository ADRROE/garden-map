from pydantic import BaseModel, Field
from typing import List, Tuple, Literal
from datetime import datetime

class Vec2(BaseModel):
    x: float
    y: float
    
class Cell(BaseModel):
    col: int
    row: int
    color: str | None = None
    palette_item_id: str | None = None

    class Config:
        from_attributes = True
        populate_by_name = True

class GardenItemBase(BaseModel):
    id: str
    palette_item_id: str
    icon: str
    display_name: str | None = None
    position: Vec2
    location: str
    width: float
    height: float
    rotation: float | None = None
    coverage: List[str] | None = None
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
    q_amended: float | None = None
    
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
    icon: str
    display_name: str | None = None
    position: Vec2
    location: str
    width: float
    height: float
    rotation: float | None = None
    coverage: List[str] | None = None
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
    q_amended: float | None = None
    last_modified: datetime

    class Config:
        from_attributes = True
        populate_by_name = True

class GardenItemRead(BaseModel):
    id: str
    position: Vec2
    palette_item_id: str
    icon: str
    display_name: str | None = None
    location: str
    width: float
    height: float
    rotation: float | None = None
    coverage: List[str] | None = None
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
    q_amended: float | None = None

    class Config:
        from_attributes = True


class GardenItemCreate(GardenItemBase):
    pass


class GardenItem(GardenItemBase):
    pass


class GardenItemUpdate(BaseModel):
    id: str
    palette_item_id: str
    display_name: str | None = None
    icon: str | None = None
    position: Vec2 | None = None
    location: str
    width: float | None = None
    height: float | None = None
    rotation: float | None = None
    coverage: List[str] | None = None
    wcvp_id: str | None = None
    rhs_id: str | None = None
    species: str | None = None
    genus: str | None = None
    circumference: int | None = None     
    t_watered: datetime | None = None
    dt_watered: int | None = None
    q_watered: float | None = None
    t_amended: datetime | None = None
    q_amended: float | None = None
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
    q_amended: float | None = None

    class Config:
        from_attributes = True
        populate_by_name = True

class GardenZoneHistory(BaseModel):
    id: str
    garden_zone_id: str
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
    q_amended: float | None = None
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
    q_amended: float | None = None
    operation: Literal["create", "modify"] | None = None

    class Config:
        from_attributes = True
        populate_by_name = True

class GardenZoneUpdateWrapper(BaseModel):
    updates: GardenZoneUpdate
    operation: Literal["create", "modify"]

class GardenZoneCreate(GardenZoneBase):
    id: str | None = None
    display_name: str
    color: str | None = None
    cells: List[Cell]
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
    q_amended: float | None = None

    class Config:
        from_attributes = True
        populate_by_name = True
    
class GardenZone(GardenZoneBase):
    pass
