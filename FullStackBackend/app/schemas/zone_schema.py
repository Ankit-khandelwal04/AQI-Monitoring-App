from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel


# ── City ─────────────────────────────────────────
class CityResponse(BaseModel):
    id:        int
    city_name: str
    latitude:  float
    longitude: float

    model_config = {"from_attributes": True}


# ── Zone ─────────────────────────────────────────
class ZoneCreate(BaseModel):
    city_id:         int
    zone_name:       str
    geojson_polygon: Optional[Any] = None   # GeoJSON Feature dict


class ZoneUpdate(BaseModel):
    zone_name:       Optional[str] = None
    geojson_polygon: Optional[Any] = None


class ZoneResponse(BaseModel):
    id:              int
    city_id:         int
    zone_name:       str
    geojson_polygon: Optional[Any] = None
    created_at:      datetime

    model_config = {"from_attributes": True}


# ── GeoJSON map response ─────────────────────────
class ZoneMapFeature(BaseModel):
    type:       str = "Feature"
    properties: dict
    geometry:   Optional[Any] = None


class ZoneMapResponse(BaseModel):
    type:     str = "FeatureCollection"
    features: list[ZoneMapFeature]
