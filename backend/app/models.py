from sqlalchemy import Column, Integer, String, Float
from app.database import Base

class GardenElement(Base):
    __tablename__ = "garden_elements"

    id = Column(String(36), primary_key=True, index=True)
    type = Column(String(255), nullable=False)
    icon = Column(String(255))
    x = Column(Float)
    y = Column(Float)
    width = Column(Float)
    height = Column(Float)
    location = Column(String(255))