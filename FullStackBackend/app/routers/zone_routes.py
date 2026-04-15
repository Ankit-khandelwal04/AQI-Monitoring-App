from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.services.zone_service import list_cities, list_zones, get_map_geojson
from app.schemas.zone_schema import CityResponse, ZoneResponse
from app.utils.security import get_current_user
from app.models.user import User
from app.utils.response import success

router = APIRouter()


@router.get("/cities", summary="List all cities")
def cities(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    data = list_cities(db)
    return success([CityResponse.model_validate(c).model_dump() for c in data])


@router.get("/zones/{city_id}", summary="List zones in a city")
def zones_by_city(
    city_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    data = list_zones(db, city_id)
    return success([ZoneResponse.model_validate(z).model_dump() for z in data])


@router.get("/map/zones", summary="GeoJSON FeatureCollection of all zones with AQI colours")
def map_zones(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """
    Returns a GeoJSON FeatureCollection.
    Each Feature's `properties` includes zone_id, zone_name, aqi_value,
    level (Good/Moderate/…), color (#hex), and color_code (semantic name).
    Feed this directly into your React Native map renderer.
    """
    geojson = get_map_geojson(db)
    return success(geojson)
