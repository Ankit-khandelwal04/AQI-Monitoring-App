from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.user import User
from app.models.zone import Zone
from app.models.aqi_reading import AQIReading
from app.models.city import City
from app.schemas.zone_schema import ZoneCreate, ZoneUpdate, ZoneResponse
from app.services.zone_service import create_zone, update_zone, delete_zone
from app.utils.security import get_current_admin
from app.utils.response import success, classify_aqi

router = APIRouter()


@router.get("/dashboard", summary="Admin dashboard stats")
def dashboard(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    """
    Returns:
    - total zones
    - average AQI across all zones (latest readings)
    - highest AQI zone
    - number of red zones (AQI > 200)
    """
    zones = db.query(Zone).all()
    readings = []
    for zone in zones:
        latest = (
            db.query(AQIReading)
            .filter(AQIReading.zone_id == zone.id)
            .order_by(AQIReading.timestamp.desc())
            .first()
        )
        if latest:
            readings.append({"zone": zone, "aqi": latest.aqi_value})

    avg_aqi      = round(sum(r["aqi"] for r in readings) / len(readings), 1) if readings else 0
    highest      = max(readings, key=lambda r: r["aqi"], default=None)
    red_zones    = [r for r in readings if r["aqi"] > 200]

    return success({
        "total_zones":       len(zones),
        "average_aqi":       avg_aqi,
        "highest_aqi_zone":  {
            "zone_name": highest["zone"].zone_name if highest else None,
            "aqi":       highest["aqi"] if highest else None,
        },
        "red_zone_count":    len(red_zones),
        "red_zones": [
            {"zone_name": r["zone"].zone_name, "aqi": r["aqi"]}
            for r in red_zones
        ],
    })


@router.post("/create-zone", summary="Create a new zone (admin)")
def admin_create_zone(
    payload: ZoneCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    zone = create_zone(db, payload)
    return success(ZoneResponse.model_validate(zone).model_dump(), "Zone created")


@router.put("/update-zone/{zone_id}", summary="Update a zone (admin)")
def admin_update_zone(
    zone_id: int,
    payload: ZoneUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    zone = update_zone(db, zone_id, payload)
    return success(ZoneResponse.model_validate(zone).model_dump(), "Zone updated")


@router.delete("/delete-zone/{zone_id}", summary="Delete a zone (admin)")
def admin_delete_zone(
    zone_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    delete_zone(db, zone_id)
    return success(None, "Zone deleted")
