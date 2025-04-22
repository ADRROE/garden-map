from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends
from app import schemas
from app import crud
from app.database import SessionLocal
from app import algorithms

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=list[schemas.GardenZone])
def get_zones(db: Session = Depends(get_db)):
    print("GET ZONES CALLED with response:", crud.get_zones(db))
    return crud.get_zones(db)

@router.post("/", response_model=list[schemas.GardenZone])
def calculate_zones(
    cells: list[schemas.ColoredCell],
    db: Session = Depends(get_db)
):
    print("RECEIVED CELLS:", cells)

    # Use the grouping algorithm from algorithms.py
    grouped_zones = algorithms.group_cells_into_zones(cells)

    saved_zones = []

    for zone in grouped_zones:
        # Save the zone and its colored cells to the database
        saved_zone = crud.create_zone_with_cells(db, zone)
        saved_zones.append(saved_zone)

    return saved_zones

@router.put("/{id}", response_model=schemas.GardenZone)
def name_zone(id: str, updates: schemas.GardenZoneUpdateName, db: Session = Depends(get_db)
):
    updated_zone = crud.update_zone_name(db, id, updates)
    if not updated_zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    return updated_zone

@router.delete("/{id}", response_model=schemas.GardenZone)
def delete_zone(id: str, db: Session = Depends(get_db)):
    print(f"DELETE ZONE CALLED with id={id}")
    return crud.delete_zone(db, id)
