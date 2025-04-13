from sqlalchemy import Column, Integer, String, Float, DateTime, JSON
from app.database import Base

class GardenElement(Base):
    __tablename__ = "garden_elements"

    id = Column(String(36), primary_key=True, index=True)
    name = Column(String(255), nullable=False)  # frontend uses 'name', not 'type'
    icon = Column(String(255))
    x = Column(Float)
    y = Column(Float)
    width = Column(Float)
    height = Column(Float)
    location = Column(String(255), nullable=True)
    coverage = Column(JSON, nullable=True)
    default_width = Column(Float, nullable=True)
    default_height = Column(Float, nullable=True)
    cursor = Column(String(255), nullable=True)
    category = Column(String(255))
    sub_category = Column(String(255))
    wcvp_id = Column(String(255), nullable=True)
    rhs_id = Column(String(255), nullable=True)
    date_planted = Column(DateTime, nullable=True)
    price = Column(Float, nullable=True)
