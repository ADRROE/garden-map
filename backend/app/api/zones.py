from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException
from app import schemas, models
from app import crud
from app.database import SessionLocal
from app import algorithms
import uuid


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

@router.get("/zones/{id}/history", response_model=list[schemas.GardenZoneHistory])
def get_zone_history(id: str, db: Session = Depends(get_db)):
    return db.query(models.GardenZoneHistory).filter_by(garden_zone_id=id).order_by(models.GardenZoneHistory.last_modified.desc()).all()

@router.post("/", response_model=list[schemas.GardenZone])
def calculate_zones(
    payload: schemas.CreateZonePayload,
    db: Session = Depends(get_db)
):
    print("RECEIVED CELLS:", payload.cells)

    # Use the grouping algorithm from algorithms.py
    grouped_zones = algorithms.group_cells_into_zones(payload.cells)

    saved_zones = []

    for zone in grouped_zones:
        zone.name = payload.name
        saved_zone = crud.create_zone_with_cells(db, zone)
        saved_zones.append(saved_zone)

        return saved_zones

@router.put("/{id}", response_model=schemas.GardenZone)
def update_zone(
    id: str,
    payload: schemas.GardenZoneUpdateWrapper,
    db: Session = Depends(get_db)
):
    updated_zone = crud.update_zone(db, id, payload.updatedZone, payload.operation)
    if not updated_zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    return updated_zone

@router.delete("/{id}", response_model=schemas.GardenZone)
def delete_zone(id: str, db: Session = Depends(get_db)):
    print(f"DELETE ZONE CALLED with id={id}")
    return crud.delete_zone(db, id)
