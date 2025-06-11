from pydantic import BaseModel, Field
from typing import List, Tuple, Literal
from datetime import datetime


class GardenElementBase(BaseModel):
    id: str
    menu_element_id: str
    display_name: str
    icon: str
    x: float
    y: float
    width: float
    height: float
    location: str | None = None
    coverage: List[str] | None = None
    default_width: float | None = None
    default_height: float | None = None
    cursor: str | None = None
    category: str
    sub_category: str | None = None
    wcvp_id: str | None = None
    rhs_id: str | None = None
    display_species: str | None = None
    display_genus: str | None = None
    date_planted: datetime | None = None
    date_fertilized: datetime | None = None
    date_harvested: datetime | None = None
    date_watered: datetime | None = None
    amount_watered: float | None = None
    date_pruned: datetime | None = None
    fertilizer_type: str | None = None
    plant_form: str | None = None
    status: str | None = None
    date_status: datetime | None = None
    circumference: float | None = None
    price: float | None = None

    class Config:
        from_attributes = True
        validate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class GardenElementHistory(BaseModel):
    id: str
    garden_element_id: str
    menu_element_id: str
    display_name: str
    icon: str
    x: float
    y: float
    width: float
    height: float
    location: str | None = None
    coverage: List[str] | None = None
    default_width: float | None = None
    default_height: float | None = None
    cursor: str | None = None
    category: str
    sub_category: str | None = None
    wcvp_id: str | None = None
    rhs_id: str | None = None
    display_species: str | None = None
    display_genus: str | None = None
    date_planted: datetime | None = None
    date_fertilized: datetime | None = None
    date_harvested: datetime | None = None
    date_watered: datetime | None = None
    amount_watered: float | None = None
    date_pruned: datetime | None = None
    fertilizer_type: str | None = None
    plant_form: str | None = None
    status: str | None = None
    date_status: datetime | None = None
    circumference: float | None = None
    price: float | None = None
    last_modified: datetime

    class Config:
        from_attributes = True
        populate_by_name = True


class GardenElementCreate(GardenElementBase):
    pass


class GardenElement(GardenElementBase):
    pass


class GardenElementUpdate(BaseModel):
    id: str
    menu_element_id: str
    display_name: str
    icon: str
    x: float
    y: float
    width: float
    height: float
    location: str | None = None
    coverage: List[str] | None = None
    default_width: float | None = None
    default_height: float | None = None
    cursor: str | None = None
    category: str
    sub_category: str | None = None
    wcvp_id: str | None = None
    rhs_id: str | None = None
    display_species: str | None = None
    display_genus: str | None = None
    date_planted: datetime | None = None
    date_fertilized: datetime | None = None
    date_harvested: datetime | None = None
    date_watered: datetime | None = None
    amount_watered: float | None = None
    date_pruned: datetime | None = None
    fertilizer_type: str | None = None
    plant_form: str | None = None
    status: str | None = None
    date_status: datetime | None = None
    circumference: float | None = None
    price: float | None = None
    operation: Literal["create", "modify"] | None = None

    class Config:
        populate_by_name = True

class GardenElementUpdateWrapper(BaseModel):
    updates: GardenElementUpdate
    operation: Literal["create", "modify"]

class Cell(BaseModel):
    col: float
    row: float
    color: str | None = None
    menuElementId: str = None

    class Config:
        from_attributes = True
        populate_by_name = True

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
    operation: Literal["create", "modify"] | None = None

    class Config:
        from_attributes = True
        populate_by_name = True

class GardenZoneUpdateWrapper(BaseModel):
    updates: GardenZoneUpdate
    operation: Literal["create", "modify"]

class CreateZonePayload(BaseModel):
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
