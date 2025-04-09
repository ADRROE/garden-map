from pydantic import BaseModel
from typing import Optional

class GardenElementBase(BaseModel):
    type: str
    icon: Optional[str]
    x: float
    y: float
    width: float
    height: float
    location: Optional[str]

class GardenElementCreate(GardenElementBase):
    id: str

class GardenElementUpdate(GardenElementBase):
    pass

class GardenElementInDB(GardenElementCreate):
    class Config:
        from_attributes = True
