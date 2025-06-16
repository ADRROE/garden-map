from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends
from app import schemas
from app import models
from app import crud
from app.database import SessionLocal

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=schemas.GardenItemRead)
def create_item(item: schemas.GardenItemCreate, db: Session = Depends(get_db)):
    print("CREATE ITEM CALLED with", item)
    return crud.create_item(db, item)

@router.get("/", response_model=list[schemas.GardenItemRead])
def get_items(db: Session = Depends(get_db)):
    print("GET ITEMS CALLED with response:", crud.get_items(db))
    return crud.get_items(db)

@router.get("/{id}/history", response_model=list[schemas.GardenItemHistory])
def get_item_history(id: str, db: Session = Depends(get_db)):
    return db.query(models.GardenItemHistory).filter_by(garden_item_id=id).order_by(models.GardenItemHistory.last_modified.desc()).all()

@router.put("/{id}", response_model=schemas.GardenItem)
def update_item(
    id: str,
    payload: schemas.GardenItemUpdateWrapper,
    db: Session = Depends(get_db)
):
    return crud.update_item(db, id, payload.updates, payload.operation)

@router.delete("/{id}", response_model=schemas.GardenItem)
def delete_item(id: str, db: Session = Depends(get_db)):
    print(f"DELETE ITEM CALLED with id={id}")
    return crud.delete_item(db, id)


