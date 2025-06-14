from pydantic import BaseModel, Field
from typing import List, Tuple, Literal
from datetime import datetime

class Vec2(BaseModel):
    x: float
    y: float
    
class GardenDates(BaseModel):
    planted: datetime | None = None
    fertilized: datetime | None = None
    harvested: datetime | None = None
    pruned: datetime | None = None
    watered: datetime | None = None
    status_changed: datetime | None = None

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
    icon: str
    icon_width: int
    icon_height: int
    category: str
    position: Vec2
    width: int | None = None
    height: int | None = None
    dates: GardenDates | None = None
    location: str | None = None
    cursor: str | None = None
    coverage: list[Cell] | None = None
    sub_category: str | None = None
    wcvp_id: str | None = None
    rhs_id: str | None = None
    display_name: str | None = None
    display_species: str | None = None
    display_genus: str | None = None
    fertilizer_type: str | None = None
    plant_form: str | None = None
    circumference: int | None = None
    price: float | None = None
    status: str | None = None
    layer: str | None = None
    rotation: float | None = None

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
    icon_width: int
    icon_height: int
    category: str
    position: Vec2
    width: int | None = None
    height: int | None = None
    dates: GardenDates | None = None
    location: str | None = None
    cursor: str | None = None
    coverage: list[Cell] | None = None
    sub_category: str | None = None
    wcvp_id: str | None = None
    rhs_id: str | None = None
    display_name: str | None = None
    display_species: str | None = None
    display_genus: str | None = None
    fertilizer_type: str | None = None
    plant_form: str | None = None
    circumference: int | None = None
    price: float | None = None
    status: str | None = None
    layer: str | None = None
    rotation: float | None = None
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
    palette_item_id: str | None = None
    display_name: str | None = None
    icon: str | None = None
    icon_width: int | None = None
    icon_height: int | None = None
    category: str | None = None
    position: Vec2 | None = None
    width: int | None = None
    height: int | None = None
    dates: GardenDates | None = None
    location: str | None = None
    cursor: str | None = None
    coverage: list[Cell] | None = None
    sub_category: str | None = None
    wcvp_id: str | None = None
    rhs_id: str | None = None
    display_name: str | None = None
    display_species: str | None = None
    display_genus: str | None = None
    fertilizer_type: str | None = None
    plant_form: str | None = None
    circumference: int | None = None
    price: float | None = None
    status: str | None = None
    layer: str | None = None
    rotation: float | None = None
    operation: Literal["create", "modify"] | None = None

    class Config:
        populate_by_name = True

class GardenItemUpdateWrapper(BaseModel):
    updates: GardenItemUpdate
    operation: Literal["create", "modify"]

class GardenZone(BaseModel):
    id: str
    display_name: str | None = None
    color: str
    coverage: List[Cell]
    border_path: List[Tuple[int, int]] = None
    ph: float | None = None
    temp: float | None = None
    fert_date: datetime | None = None
    water_date: datetime | None = None
    water_amount: float | None = None
    fert_type: str | None = None
    soil_mix: str | None = None
    moisture: float | None = None
    sunshine: float | None = None

    class Config:
        from_attributes = True
        populate_by_name = True

class GardenZoneHistory(BaseModel):
    id: str
    garden_zone_id: str = Field(alias="gardenZoneId")
    display_name: str | None = None
    color: str
    coverage: List[Cell]
    border_path: List[Tuple[int, int]] = None
    ph: float | None = None
    temp: float | None = None
    fert_date: datetime | None = None
    water_date: datetime | None = None
    water_amount: float | None = None
    fert_type: str | None = None
    soil_mix: str | None = None
    moisture: float | None = None
    sunshine: float | None = None
    last_modified: datetime

    class Config:
        from_attributes = True
        populate_by_name = True

class GardenZoneUpdate(BaseModel):
    display_name: str | None = None
    color: str | None = None
    coverage: List[Cell] | None = None
    border_path: List[Tuple[int, int]] | None = None
    ph: float | None = None
    temp: float | None = None
    fert_date: datetime | None = None
    water_date: datetime | None = None
    water_amount: float | None = None
    fert_type: str | None = None
    soil_mix: str | None = None
    moisture: float | None = None
    sunshine: float | None = None
    operation: Literal["create", "modify"] | None = None

    class Config:
        from_attributes = True
        populate_by_name = True

class GardenZoneUpdateWrapper(BaseModel):
    updates: GardenZoneUpdate
    operation: Literal["create", "modify"]

class CreateZonePayload(BaseModel):
    display_name: str | None = None
    color: str | None = None
    cells: List[Cell]
    border_path: List[Tuple[int, int]] | None = None
    ph: float | None = None
    temp: float | None = None
    fert_date: datetime | None = None
    water_date: datetime | None = None
    water_amount: float | None = None
    fert_type: str | None = None
    soil_mix: str | None = None
    moisture: float | None = None
    sunshine: float | None = None

    class Config:
        from_attributes = True
        populate_by_name = True
