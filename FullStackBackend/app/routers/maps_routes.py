from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.user import User
from app.services.maps_service import geocode_city
from app.utils.security import get_current_user
from app.utils.response import success

router = APIRouter()


@router.get("/geocode", summary="Get coordinates for a city via Google Maps API")
def geocode(
    city: str = Query(..., description="City name e.g. Nashik"),
    _:   User = Depends(get_current_user),
):
    """
    Returns lat/lng, formatted address, and a Google Maps URL.
    Falls back to mock coordinates if GOOGLE_MAPS_API_KEY is not set.
    """
    data = geocode_city(city)
    return success(data)


@router.get("/aqi-color-scale", summary="AQI colour classification reference")
def aqi_color_scale():
    """
    Returns the full AQI colour scale used by the frontend map.
    No auth required — can be called by the mobile app at startup.
    """
    return success([
        {"min": 0,   "max": 50,  "level": "Good",         "color": "#22c55e", "color_code": "green"},
        {"min": 51,  "max": 100, "level": "Satisfactory", "color": "#84cc16", "color_code": "yellow"},
        {"min": 101, "max": 200, "level": "Moderate",     "color": "#eab308", "color_code": "orange"},
        {"min": 201, "max": 300, "level": "Poor",         "color": "#f97316", "color_code": "red"},
        {"min": 301, "max": 500, "level": "Very Poor",    "color": "#ef4444", "color_code": "purple"},
    ])
