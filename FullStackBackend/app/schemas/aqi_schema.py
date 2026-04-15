from datetime import datetime
from typing import Optional
from pydantic import BaseModel


# ── AQI Colour helper ────────────────────────────
class AQIClassification(BaseModel):
    level: str
    color: str      # hex
    color_code: str # semantic name


# ── Current AQI response ─────────────────────────
class PollutantBreakdown(BaseModel):
    pm25: Optional[float] = None
    pm10: Optional[float] = None
    no2:  Optional[float] = None
    so2:  Optional[float] = None
    co:   Optional[float] = None
    o3:   Optional[float] = None


class AQICurrentResponse(BaseModel):
    zone_id:        int
    zone_name:      str
    city_name:      str
    aqi_value:      float
    classification: AQIClassification
    pollutants:     PollutantBreakdown
    timestamp:      datetime

    model_config = {"from_attributes": True}


# ── History ──────────────────────────────────────
class AQIHistoryPoint(BaseModel):
    timestamp: datetime
    aqi_value: float
    pm25:      Optional[float] = None
    pm10:      Optional[float] = None
    no2:       Optional[float] = None
    so2:       Optional[float] = None
    co:        Optional[float] = None
    o3:        Optional[float] = None

    model_config = {"from_attributes": True}


# ── ML Prediction placeholder (plug-in ready) ────
class AQIPredictionRequest(BaseModel):
    zone_id:   int
    hours:     int = 24   # how many hours ahead to predict


class AQIPredictionResponse(BaseModel):
    zone_id:          int
    zone_name:        str
    predicted_aqi:    float
    confidence:       float
    forecast_horizon: int    # hours
    classification:   AQIClassification
    note:             str = "ML model not yet integrated – returning mock prediction"
