from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.city import City
from app.models.zone import Zone
from app.models.aqi_reading import AQIReading
from app.schemas.zone_schema import ZoneCreate, ZoneUpdate
from app.utils.geojson_utils import make_zone_feature, build_feature_collection
from app.utils.response import classify_aqi


def list_cities(db: Session) -> list[City]:
    return db.query(City).order_by(City.city_name).all()


def list_zones(db: Session, city_id: int) -> list[Zone]:
    city = db.query(City).filter(City.id == city_id).first()
    if not city:
        raise HTTPException(status_code=404, detail="City not found")
    return db.query(Zone).filter(Zone.city_id == city_id).all()


def get_map_geojson(db: Session) -> dict:
    """Return a FeatureCollection with all zones coloured by latest AQI."""
    zones = db.query(Zone).all()
    features = []
    for zone in zones:
        latest = (
            db.query(AQIReading)
            .filter(AQIReading.zone_id == zone.id)
            .order_by(AQIReading.timestamp.desc())
            .first()
        )
        aqi_val = latest.aqi_value if latest else None
        clf = classify_aqi(aqi_val) if aqi_val is not None else {}
        features.append(make_zone_feature(zone, aqi_val, clf))
    return build_feature_collection(features)


def create_zone(db: Session, payload: ZoneCreate) -> Zone:
    city = db.query(City).filter(City.id == payload.city_id).first()
    if not city:
        raise HTTPException(status_code=404, detail="City not found")
    zone = Zone(**payload.model_dump())
    db.add(zone)
    db.commit()
    db.refresh(zone)
    return zone


def update_zone(db: Session, zone_id: int, payload: ZoneUpdate) -> Zone:
    zone = db.query(Zone).filter(Zone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(zone, field, value)
    db.commit()
    db.refresh(zone)
    return zone


def delete_zone(db: Session, zone_id: int) -> None:
    zone = db.query(Zone).filter(Zone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    db.delete(zone)
    db.commit()
