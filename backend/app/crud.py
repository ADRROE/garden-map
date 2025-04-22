from sqlalchemy.orm import Session
from app import models, schemas
import uuid

def get_elements(db: Session):
    return db.query(models.GardenElement).all()

def create_element(db: Session, element: schemas.GardenElementCreate):
    db_element = models.GardenElement(**element.dict())
    db.add(db_element)
    db.commit()
    db.refresh(db_element)
    return db_element

def update_element(db: Session, id: str, updates: schemas.GardenElementUpdate):
    db_element = db.query(models.GardenElement).filter(models.GardenElement.id == id).first()
    for key, value in updates.dict(exclude_unset=True).items():
        setattr(db_element, key, value)
    db.commit()
    return db_element

def delete_element(db: Session, id: str):
    db_element = db.query(models.GardenElement).filter(models.GardenElement.id == id).first()
    if db_element:
        db.delete(db_element)
        db.commit()
        return db_element
    return None

def get_zones(db: Session):
    return db.query(models.GardenZone).all()

def create_zone_with_cells(db: Session, zone: schemas.GardenZone):
    # Convert Pydantic cells to SQLAlchemy models
    db_cells = [
        models.ColoredCell(
            id=str(uuid.uuid4()),
            x=cell.x,
            y=cell.y,
            color=cell.color,
            menu_element_id=cell.menuElementId,
        )
        for cell in zone.coverage
    ]

    # Now associate these with a new GardenZone
    db_zone = models.GardenZone(
        id=zone.id,
        name=zone.name,
        color=zone.color,
        coverage=db_cells,
        borders=zone.borders
    )

    db.add(db_zone)
    db.commit()
    db.refresh(db_zone)

    return db_zone

def update_zone_name(db: Session, zone_id: str, new_name: str):
    zone = db.query(models.GardenZone).filter(models.GardenZone.id == zone_id).first()
    if zone:
        zone.name = new_name
        db.commit()
        db.refresh(zone)
    return zone

def delete_zone(db: Session, id: str):
    db_element = db.query(models.GardenZone).filter(models.GardenZone.id == id).first()
    if db_element:
        db.delete(db_element)
        db.commit()
        return db_element
    return None