from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import crud, schemas
from app.database import SessionLocal

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=list[schemas.GardenElementInDB])
def read_elements(db: Session = Depends(get_db)):
    return crud.get_elements(db)

@router.post("/", response_model=schemas.GardenElementInDB)
def add_element(element: schemas.GardenElementCreate, db: Session = Depends(get_db)):
    return crud.create_element(db, element)

@router.put("/", response_model=schemas.GardenElementInDB)
def modify_element(element: schemas.GardenElementCreate, db: Session = Depends(get_db)):
    return crud.update_element(db, element.id, element)

@router.delete("/")
def remove_element(id: str, db: Session = Depends(get_db)):
    crud.delete_element(db, id)
    return {"ok": True}
