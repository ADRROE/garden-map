from sqlalchemy.orm import Session
from app import models, schemas, algorithms
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


def update_zone(db: Session, zone_id: str, updates: schemas.GardenZoneUpdate):
    zone = db.query(models.GardenZone).filter(models.GardenZone.id == zone_id).first()
    if not zone:
        return None

    updates_data = updates.dict(exclude_unset=True)

    if "coverage" in updates_data:
        # 1. Delete old coverage
        db.query(models.ColoredCell).filter(models.ColoredCell.zone_id == zone.id).delete()

        # 2. Add new coverage
        new_cells = [
            models.ColoredCell(
                id=str(uuid.uuid4()),
                x=cell['x'],
                y=cell['y'],
                color=cell['color'],
                menu_element_id=cell['menuElementId'],
                zone_id=zone.id
            )
            for cell in updates_data["coverage"]
        ]
        db.add_all(new_cells)

        # 3. RECOMPUTE borders
        # 3.1 Convert to schemas.ColoredCell (needed for algorithm)
        schema_cells = [
            schemas.ColoredCell(
                x=cell.x,
                y=cell.y,
                color=cell.color,
                menuElementId=cell.menu_element_id
            )
            for cell in new_cells
        ]
        merged_zones = algorithms.group_cells_into_zones(schema_cells)
        if merged_zones:
            zone.borders = merged_zones[0].borders

        updates_data.pop("coverage")  # we've already handled it manually

    # Update other fields (name, color, etc.)
    for key, value in updates_data.items():
        setattr(zone, key, value)

    db.commit()
    db.refresh(zone)

    return zone


def get_zone_by_name(db: Session, name: str):
    return db.query(models.GardenZone).filter(models.GardenZone.name == name).first()

def deduplicate_cells(cells: list[schemas.ColoredCell]) -> list[schemas.ColoredCell]:
    unique = {}
    for cell in cells:
        key = (int(cell.x), int(cell.y))
        unique[key] = cell  # overwrite if duplicate
    return list(unique.values())

def merge_cells_into_existing_zone(db: Session, existing_zone: models.GardenZone, new_zone: schemas.GardenZone):
    # 1. Delete existing colored cells
    db.query(models.ColoredCell).filter(models.ColoredCell.zone_id == existing_zone.id).delete()

    # 2. Merge and deduplicate cells
    all_cells = [
        schemas.ColoredCell(
            x=cell.x,
            y=cell.y,
            color=cell.color,
            menuElementId=cell.menu_element_id
        )
        for cell in existing_zone.coverage
    ] + [
        schemas.ColoredCell(
            x=cell.x,
            y=cell.y,
            color=cell.color,
            menuElementId=cell.menuElementId
        )
        for cell in new_zone.coverage
    ]

    all_cells = deduplicate_cells(all_cells)

    # 3. Insert new colored cells
    new_db_cells = [
        models.ColoredCell(
            id=str(uuid.uuid4()),
            x=cell.x,
            y=cell.y,
            color=cell.color,
            menu_element_id=cell.menuElementId,
            zone_id=existing_zone.id
        )
        for cell in all_cells
    ]
    db.add_all(new_db_cells)

    # 4. Recompute borders
    merged_zones = algorithms.group_cells_into_zones(all_cells)
    if merged_zones:
        merged_zone = merged_zones[0]
        existing_zone.borders = merged_zone.borders

    db.commit()
    db.refresh(existing_zone)

    return existing_zone

def delete_zone(db: Session, id: str):
    db_element = db.query(models.GardenZone).filter(models.GardenZone.id == id).first()
    if db_element:
        db.delete(db_element)
        db.commit()
        return db_element
    return None