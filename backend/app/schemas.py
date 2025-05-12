from pydantic import BaseModel, Field
from typing import List, Tuple
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


class GardenElementCreate(GardenElementBase):
    pass


class GardenElement(GardenElementBase):
    pass


class GardenElementUpdate(BaseModel):
    id: str
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

    class Config:
        validate_by_name = True
        populate_by_name = True

class ColoredCell(BaseModel):
    x: float
    y: float
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
    borders: List[Tuple[Tuple[int, int], Tuple[int, int]]]

    class Config:
        from_attributes = True

class GardenZoneUpdate(BaseModel):
    name: str | None = None
    color: str | None = None
    coverage: List[ColoredCell] | None = None
    borders: List[Tuple[Tuple[int, int], Tuple[int, int]]] | None = None

class CreateZonePayload(BaseModel):
    name: str
    cells: list[ColoredCell]
    color: str | None = None
    borders: List[Tuple[Tuple[int, int], Tuple[int, int]]] | None = None
