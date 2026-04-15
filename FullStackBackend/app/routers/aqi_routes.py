from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.user import User
from app.services.aqi_service import get_current_aqi, get_aqi_history, predict_aqi
from app.schemas.aqi_schema import AQIHistoryPoint, AQIPredictionRequest
from app.utils.security import get_current_user
from app.utils.response import success

router = APIRouter()


@router.get("/current", summary="Get current AQI for a city + zone")
def current_aqi(
    city: str = Query(..., description="City name e.g. Nashik"),
    zone: str = Query(..., description="Zone name e.g. Cidco"),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    data = get_current_aqi(db, city, zone)
    return success(data)


@router.get("/history", summary="Historical AQI readings for a zone")
def aqi_history(
    zone_id:    int = Query(..., description="Zone ID"),
    start_date: Optional[datetime] = Query(None, description="ISO datetime e.g. 2025-01-01T00:00:00"),
    end_date:   Optional[datetime] = Query(None, description="ISO datetime e.g. 2025-12-31T23:59:59"),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    readings = get_aqi_history(db, zone_id, start_date, end_date)
    data = [AQIHistoryPoint.model_validate(r).model_dump() for r in readings]
    return success({"zone_id": zone_id, "count": len(data), "readings": data})


@router.post("/predict", summary="ML AQI prediction (plug-in ready)")
def aqi_predict(
    payload: AQIPredictionRequest,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """
    Returns a prediction stub. Replace `predict_aqi()` in `aqi_service.py`
    with your actual ML model when ready — no other changes needed.
    """
    data = predict_aqi(db, payload.zone_id, payload.hours)
    return success(data)
