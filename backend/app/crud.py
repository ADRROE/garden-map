from sqlalchemy.orm import Session
from datetime import datetime
from typing import Literal
from app import models, schemas, algorithms
import uuid

def to_garden_item_read(item: schemas.GardenItem) -> schemas.GardenItemRead:
    data = item.__dict__.copy()
    data['position'] = {'x': data.pop('x'), 'y': data.pop('y')}
    return schemas.GardenItemRead(**data)

def get_items(db: Session) -> list[schemas.GardenItemRead]:
    items = db.query(models.GardenItem).all()

    return [to_garden_item_read(item) for item in items]

def create_item(db: Session, item: schemas.GardenItemCreate):
    data = item.dict()
    x = data['position']['x']
    y = data['position']['y']
    data.pop('position')
    db_item = models.GardenItem(**data, x=x, y=y)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return to_garden_item_read(db_item)

def update_item(
    db: Session, 
    id: str, 
    updates: schemas.GardenItemUpdate, 
    record: Literal["create", "modify"]
):
    timestamp = datetime.now()
    updates_data = updates.dict(exclude_unset=True)
    x = updates_data['position']['x']
    y = updates_data['position']['y']
    updates_data.pop('position')

    # Always update the main item
    db_item = db.query(models.GardenItem).filter(models.GardenItem.id == id).first()
    if not db_item:
        return None

    for key, value in updates_data.items():
        setattr(db_item, key, value)

    db_item.x = x
    db_item.y = y
    db_item.last_modified = timestamp

    # Add to history if requested
    if record == "create":

        # Prepare history data — exclude the primary key!
        history_data = updates_data.copy()
        history_data.pop("id", None)  # 🚨 remove existing id
        history_data["garden_item_id"] = id
        history_data["x"] = x
        history_data["y"] = y
        history_data["last_modified"] = timestamp

        db_history = models.GardenItemHistory(**history_data)
        db.add(db_history)

        db.commit()
        db.refresh(db_item)
        return db_item

    elif record == "modify":
        db_item = db.query(models.GardenItem).filter(models.GardenItem.id == id).first()
        if not db_item:
            return None

        updates_data = updates.dict(exclude_unset=True)

        # Apply changes
        for key, value in updates_data.items():
            setattr(db_item, key, value)
            
        db_item.x = x
        db_item.y = y
        db_item.last_modified = timestamp

        db.commit()
        db.refresh(db_item)
        return db_item

def delete_item(db: Session, id: str):
    db_item = db.query(models.GardenItem).filter(models.GardenItem.id == id).first()
    if db_item:
        db.delete(db_item)
        db.commit()
        return db_item
    return None

def get_zones(db: Session):
    return db.query(models.GardenZone).all()

def create_zone_with_cells(db: Session, zone: schemas.GardenZoneCreate):
    # Convert Pydantic cells to SQLAlchemy models
    db_cells = [
        models.Cell(
            id=str(uuid.uuid4()),
            col=cell.col,
            row=cell.row,
            color=cell.color,
            palette_item_id=cell.palette_item_id,
        )
        for cell in zone.coverage
    ]

    # Now associate these with a new GardenZone
    db_zone = models.GardenZone(
        id=zone.id,
        display_name=zone.display_name,
        color=zone.color,
        coverage=db_cells,
        border_path=zone.border_path
    )

    db.add(db_zone)
    db.commit()
    db.refresh(db_zone)

    return db_zone


def update_zone(
    db: Session,
    id: str,
    updates: schemas.GardenZoneUpdate,
    record: Literal["create", "modify"]
):
    timestamp = datetime.now()
    db_zone = db.query(models.GardenZone).filter(models.GardenZone.id == id).first()
    if not db_zone:
        return None

    updates_data = updates.dict(exclude_unset=True)

    if record == "create":
        # Prepare history data — exclude the primary key!
        history_data = updates_data.copy()
        history_data.pop("id", None)  # 🚨 remove existing id
        history_data["garden_zone_id"] = id
        history_data["last_modified"] = timestamp

        db_history = models.GardenZoneHistory(**history_data)
        db.add(db_history)

        db.commit()
        db.refresh(db_zone)
        return db_zone

    elif record == "modify":

        # Handle coverage update (Cells)
        if "coverage" in updates_data:
            db.query(models.Cell).filter(models.Cell.garden_zone_id == db_zone.id).delete()
            new_cells = [
                models.Cell(
                    id=str(uuid.uuid4()),
                    col=cell["col"],
                    row=cell["row"],
                    color=cell["color"],
                    palette_item_id=cell["palette_item_id"],
                    garden_zone_id=db_zone.id
                )
                for cell in updates_data["coverage"]
            ]
            db.add_all(new_cells)

            schema_cells = [
                schemas.Cell(
                    col=cell.col,
                    row=cell.row,
                    color=cell.color,
                    palette_item_id=cell.palette_item_id
                )
                for cell in new_cells
            ]
            merged_zones = algorithms.group_cells_into_zones(schema_cells)
            if merged_zones:
                db_zone.border_path = merged_zones[0].border_path

            updates_data.pop("coverage")

        # Apply updates
        for key, value in updates_data.items():
            setattr(db_zone, key, value)

        db_zone.last_modified = timestamp
        db.commit()
        db.refresh(db_zone)
        return db_zone


def get_zone_by_name(db: Session, name: str):
    return db.query(models.GardenZone).filter(models.GardenZone.display_name == name).first()

def deduplicate_cells(cells: list[schemas.Cell]) -> list[schemas.Cell]:
    unique = {}
    for cell in cells:
        key = (int(cell.col), int(cell.row))
        unique[key] = cell  # overwrite if duplicate
    return list(unique.values())

def merge_cells_into_existing_zone(db: Session, existing_zone: models.GardenZone, new_zone: schemas.GardenZone):
    # 1. Delete existing colored cells
    db.query(models.Cell).filter(models.Cell.garden_zone_id == existing_zone.id).delete()

    # 2. Merge and deduplicate cells
    all_cells = [
        schemas.Cell(
            col=cell.col,
            row=cell.row,
            color=cell.color,
            palette_item_id=cell.palette_item_id
        )
        for cell in existing_zone.coverage
    ] + [
        schemas.Cell(
            col=cell.col,
            row=cell.row,
            color=cell.color,
            palette_item_id=cell.palette_item_id
        )
        for cell in new_zone.coverage
    ]

    all_cells = deduplicate_cells(all_cells)

    # 3. Insert new colored cells
    new_db_cells = [
        models.Cell(
            id=str(uuid.uuid4()),
            col=cell.col,
            row=cell.row,
            color=cell.color,
            palette_item_id=cell.palette_item_id,
            garden_zone_id=existing_zone.id
        )
        for cell in all_cells
    ]
    db.add_all(new_db_cells)

    # 4. Recompute borders
    merged_zones = algorithms.group_cells_into_zones(all_cells)
    if merged_zones:
        merged_zone = merged_zones[0]
        existing_zone.border_path = merged_zone.border_path

    db.commit()
    db.refresh(existing_zone)

    return existing_zone

def delete_zone(db: Session, id: str):
    db_item = db.query(models.GardenZone).filter(models.GardenZone.id == id).first()
    if db_item:
        db.delete(db_item)
        db.commit()
        return db_item
    return None