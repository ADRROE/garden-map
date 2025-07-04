from pydantic import BaseModel, Field, AliasChoices, computed_field, model_validator
from typing import List, Tuple, Literal, Any, Dict
from datetime import datetime

class Vec2(BaseModel):
    x: float
    y: float

class CoVec3(BaseModel):
    # ┌───────────────────┐
    # │  ALIAS MAPPINGS   │
    # └───────────────────┘
    # • The field will be filled with whichever alias arrives first.
    # • `x` may come in as “x” *or* “sand”, etc.
    x: float | None = Field(default=None, validation_alias=AliasChoices('x', 'sand'))
    y: float | None = Field(default=None, validation_alias=AliasChoices('y', 'silt'))
    z: float | None = Field(default=None, validation_alias=AliasChoices('z', 'clay'))

    # ┌───────────────────┐
    # │  NORMALISATION    │
    # └───────────────────┘
@model_validator(mode='after')
def normalise(cls, m: "CoVec3"):
    # If all are None or missing, that's allowed
    if m.x is None and m.y is None and m.z is None:
        return m

    # If some are missing but not all, raise error or handle
    if None in (m.x, m.y, m.z):
        raise ValueError("Incomplete soil mix: all of x/y/z must be provided")

    total = m.x + m.y + m.z
    if total == 0:
        raise ValueError('At least one component must be non-zero.')

    if abs(total - 1.0) > 1e-6:
        m.x, m.y, m.z = (m.x / total, m.y / total, m.z / total)
    return m
    
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
    coverage: List[Cell] | None = None
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
    coverage: List[Cell] | None = None
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
    palette_item_id: str
    icon: str
    display_name: str | None = None
    x: float
    y: float
    location: str
    width: float
    height: float
    rotation: float | None = None
    coverage: List[Cell] | None = None
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

    @computed_field
    def position(self) -> Dict[str, float]:
        return {"x": self.x, "y": self.y}

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
    coverage: List[Cell] | None = None
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
    soil_mix: CoVec3 | None = None
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
    soil_mix: CoVec3 | None = None
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
    soil_mix: CoVec3 | None = None
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
    soil_mix: CoVec3 | None = None
    t_watered: datetime | None = None
    dt_watered: int | None = None
    q_watered: float | None = None
    t_amended: datetime | None = None
    q_amended: float | None = None

    class Config:
        from_attributes = True
        populate_by_name = True

class GardenZoneRead(BaseModel):
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
    sand: float | None = None
    silt: float | None = None
    clay: float | None = None
    t_watered: datetime | None = None
    dt_watered: int | None = None
    q_watered: float | None = None
    t_amended: datetime | None = None
    q_amended: float | None = None

    @computed_field
    def soil_mix(self) -> Dict[str, float] | None:
        if self.sand is None and self.silt is None and self.clay is None:
            return None
        return {
            "sand": round((self.sand or 0) * 100, 2),
            "silt": round((self.silt or 0) * 100, 2),
            "clay": round((self.clay or 0) * 100, 2),
        }

    class Config:
        from_attributes = True
        fields = {
            "sand": {"exclude": True},
            "silt": {"exclude": True},
            "clay": {"exclude": True},
        }

    class Config:
        from_attributes = True
        fields = {
            "x": {"exclude": True},
            "y": {"exclude": True},
            "z": {"exclude": True},
        }
    
class GardenZone(GardenZoneBase):
    pass
