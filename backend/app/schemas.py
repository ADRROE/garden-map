from pydantic import BaseModel, Field
from typing import List, Tuple, Literal
from datetime import datetime


class GardenElementBase(BaseModel):
    id: str
    menu_element_id: str = Field(alias="menuElementId")
    name: str
    icon: str
    x: float
    y: float
    width: float
    height: float
    location: str | None = None
    coverage: List[str] | None = None
    default_width: float | None = Field(default=None, alias="defaultWidth")
    default_height: float | None = Field(default=None, alias="defaultHeight")
    cursor: str | None = None
    category: str
    sub_category: str = Field(default=None, alias="subCategory")
    wcvp_id: str | None = Field(default=None, alias="wcvpId")
    rhs_id: str | None = Field(default=None, alias="rhsId")
    date_planted: datetime | None = Field(default=None, alias="datePlanted")
    price: float | None = None

    class Config:
        from_attributes = True
        validate_by_name = True
        populate_by_name = True  # supports both aliases and real names
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class GardenElementHistory(BaseModel):
    id: str
    garden_element_id: str = Field(alias="gardenElementId")
    menu_element_id: str = Field(alias="menuElementId")
    name: str
    icon: str
    x: float
    y: float
    width: float
    height: float
    location: str | None = None
    coverage: List[str] | None = None
    default_width: float | None = Field(default=None, alias="defaultWidth")
    default_height: float | None = Field(default=None, alias="defaultHeight")
    cursor: str | None = None
    category: str
    sub_category: str = Field(default=None, alias="subCategory")
    wcvp_id: str | None = Field(default=None, alias="wcvpId")
    rhs_id: str | None = Field(default=None, alias="rhsId")
    date_planted: datetime | None = Field(default=None, alias="datePlanted")
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
    menu_element_id: str = Field(alias="menuElementId")
    name: str | None = None
    icon: str | None = None
    x: float | None = None
    y: float | None = None
    width: float | None = None
    height: float | None = None
    location: str | None = None
    coverage: List[str] | None = None
    default_width: float | None = Field(default=None, alias="defaultWidth")
    default_height: float | None = Field(default=None, alias="defaultHeight")
    cursor: str | None = None
    category: str | None = None
    sub_category: str | None = Field(default=None, alias="subCategory")
    wcvp_id: str | None = Field(default=None, alias="wcvpId")
    rhs_id: str | None = Field(default=None, alias="rhsId")
    date_planted: datetime | None = Field(default=None, alias="datePlanted")
    price: float | None = None
    operation: Literal["create", "modify"] | None = None

    class Config:
        validate_by_name = True
        populate_by_name = True

class GardenElementUpdateWrapper(BaseModel):
    updates: GardenElementUpdate
    operation: Literal["create", "modify"]

class ColoredCell(BaseModel):
    col: float
    row: float
    color: str
    menuElementId: str = Field(default=None, alias="menu_element_id")

    class Config:
        from_attributes = True
        populate_by_name = True

class GardenZone(BaseModel):
    id: str
    name: str | None = None
    color: str
    coverage: List[ColoredCell]
    border_path: List[Tuple[int, int]] = Field(default=None, alias="borderPath")

    class Config:
        from_attributes = True
        populate_by_name = True

class GardenZoneHistory(BaseModel):
    id: str
    garden_zone_id: str = Field(alias="gardenZoneId")
    name: str | None = None
    color: str
    coverage: List[ColoredCell]
    border_path: List[Tuple[int, int]] = Field(default=None, alias="borderPath")
    last_modified: datetime

    class Config:
        from_attributes = True
        populate_by_name = True

class GardenZoneUpdate(BaseModel):
    name: str | None = None
    color: str | None = None
    coverage: List[ColoredCell] | None = None
    border_path: List[Tuple[int, int]] | None = Field(default=None, alias="borderPath")
    operation: Literal["create", "modify"] | None = None

    class Config:
        from_attributes = True
        populate_by_name = True

class GardenZoneUpdateWrapper(BaseModel):
    updates: GardenZoneUpdate
    operation: Literal["create", "modify"]

class CreateZonePayload(BaseModel):
    name: str
    cells: list[ColoredCell]
    color: str | None = None
    border_path: List[Tuple[int, int]] | None = Field(default=None, alias="borderPath")

    class Config:
        from_attributes = True
        populate_by_name = True
