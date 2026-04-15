from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.aqi_reading import AQIReading
from app.models.zone import Zone
from app.models.city import City
from app.utils.response import classify_aqi


def get_current_aqi(db: Session, city: str, zone_name: str) -> dict:
    city_obj = db.query(City).filter(City.city_name.ilike(city)).first()
    if not city_obj:
        raise HTTPException(status_code=404, detail=f"City '{city}' not found")

    zone = (
        db.query(Zone)
        .filter(Zone.city_id == city_obj.id, Zone.zone_name.ilike(zone_name))
        .first()
    )
    if not zone:
        raise HTTPException(status_code=404, detail=f"Zone '{zone_name}' not found in {city}")

    reading = (
        db.query(AQIReading)
        .filter(AQIReading.zone_id == zone.id)
        .order_by(AQIReading.timestamp.desc())
        .first()
    )
    if not reading:
        raise HTTPException(status_code=404, detail="No AQI data available for this zone")

    classification = classify_aqi(reading.aqi_value)
    return {
        "zone_id":        zone.id,
        "zone_name":      zone.zone_name,
        "city_name":      city_obj.city_name,
        "aqi_value":      reading.aqi_value,
        "classification": classification,
        "pollutants": {
            "pm25": reading.pm25,
            "pm10": reading.pm10,
            "no2":  reading.no2,
            "so2":  reading.so2,
            "co":   reading.co,
            "o3":   reading.o3,
        },
        "timestamp": reading.timestamp,
    }


def get_aqi_history(
    db: Session,
    zone_id: int,
    start_date: Optional[datetime],
    end_date: Optional[datetime],
) -> list[AQIReading]:
    zone = db.query(Zone).filter(Zone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")

    query = db.query(AQIReading).filter(AQIReading.zone_id == zone_id)
    if start_date:
        query = query.filter(AQIReading.timestamp >= start_date)
    if end_date:
        query = query.filter(AQIReading.timestamp <= end_date)

    return query.order_by(AQIReading.timestamp.asc()).all()


# ── ML Prediction stub (plug-in ready) ───────────
def predict_aqi(db: Session, zone_id: int, hours: int = 24) -> dict:
    """
    Placeholder for ML model integration.
    Replace this function body with your LSTM/XGBoost model call.
    The schema (AQIPredictionResponse) is already defined in aqi_schema.py.
    """
    zone = db.query(Zone).filter(Zone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")

    # Get latest reading as baseline
    latest = (
        db.query(AQIReading)
        .filter(AQIReading.zone_id == zone_id)
        .order_by(AQIReading.timestamp.desc())
        .first()
    )
    mock_aqi = (latest.aqi_value * 1.05) if latest else 150.0
    classification = classify_aqi(mock_aqi)

    return {
        "zone_id":          zone_id,
        "zone_name":        zone.zone_name,
        "predicted_aqi":    round(mock_aqi, 1),
        "confidence":       0.0,
        "forecast_horizon": hours,
        "classification":   classification,
        "note":             "ML model not yet integrated – returning mock prediction",
    }
