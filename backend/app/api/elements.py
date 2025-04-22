from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends
from app import schemas
from app import crud
from app.database import SessionLocal

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=schemas.GardenElement)
def create_element(element: schemas.GardenElementCreate, db: Session = Depends(get_db)):
    print("CREATE ELEMENT CALLED with", element)
    return crud.create_element(db, element)

@router.get("/", response_model=list[schemas.GardenElement])
def get_elements(db: Session = Depends(get_db)):
    print("GET ELEMENTS CALLED with response:", crud.get_elements(db))
    return crud.get_elements(db)

@router.put("/{id}", response_model=schemas.GardenElement)
def update_element(id: str, updates: schemas.GardenElementUpdate, db: Session = Depends(get_db)):
    print(f"UPDATE ELEMENT CALLED with id={id} and updates={updates}")
    return crud.update_element(db, id, updates)

@router.delete("/{id}", response_model=schemas.GardenElement)
def delete_element(id: str, db: Session = Depends(get_db)):
    print(f"DELETE ELEMENT CALLED with id={id}")
    return crud.delete_element(db, id)


