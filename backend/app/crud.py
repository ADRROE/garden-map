from sqlalchemy.orm import Session
from app import models, schemas


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
    db.delete(db_element)
    db.commit()