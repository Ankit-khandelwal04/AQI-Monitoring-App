"""
ML Prediction Routes for AQI Forecasting
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Optional
import pickle
import numpy as np
from pathlib import Path
from datetime import datetime, timedelta
import json

router = APIRouter(tags=["Machine Learning"])

# Paths
ML_DIR = Path(__file__).parent.parent.parent / 'ml'
MODELS_DIR = ML_DIR / 'models'
DATA_DIR = ML_DIR / 'data'


class PredictionInput(BaseModel):
    """Input schema for AQI prediction"""
    pm2_5: float = Field(..., ge=0, le=1000, description="PM2.5 concentration (µg/m³)")
    pm10: float = Field(..., ge=0, le=1000, description="PM10 concentration (µg/m³)")
    no2: float = Field(..., ge=0, le=500, description="NO2 concentration (µg/m³)")
    so2: float = Field(..., ge=0, le=500, description="SO2 concentration (µg/m³)")
    co: float = Field(..., ge=0, le=50, description="CO concentration (mg/m³)")
    o3: float = Field(default=30.0, ge=0, le=500, description="O3 concentration (µg/m³)")
    hour: int = Field(..., ge=0, le=23, description="Hour of day (0-23)")
    month: int = Field(..., ge=1, le=12, description="Month (1-12)")
    day_of_week: int = Field(default=0, ge=0, le=6, description="Day of week (0=Monday)")
    is_weekend: int = Field(default=0, ge=0, le=1, description="1 if weekend, 0 otherwise")
    station: str = Field(default="Satpur", description="Station name")


class PredictionOutput(BaseModel):
    """Output schema for AQI prediction"""
    predicted_aqi: float
    aqi_category: str
    confidence: float
    timestamp: str
    station: str


class ForecastOutput(BaseModel):
    """Output schema for AQI forecast"""
    station: str
    forecast: List[dict]
    generated_at: str


class ModelInfo(BaseModel):
    """Model metadata information"""
    created_at: str
    city: str
    total_records: int
    date_range: dict
    stations: List[str]
    regression_metrics: dict
    classification_metrics: dict
    aqi_categories: List[str]


def load_models():
    """Load trained ML models"""
    try:
        with open(MODELS_DIR / 'aqi_regressor.pkl', 'rb') as f:
            regressor = pickle.load(f)
        
        with open(MODELS_DIR / 'aqi_classifier.pkl', 'rb') as f:
            classifier = pickle.load(f)
        
        with open(MODELS_DIR / 'label_encoder.pkl', 'rb') as f:
            label_encoder = pickle.load(f)
        
        return regressor, classifier, label_encoder
    except FileNotFoundError:
        raise HTTPException(
            status_code=503,
            detail="ML models not found. Please train the models first by running ml/aqi_ml_pipeline.py"
        )


def load_metadata():
    """Load model metadata"""
    try:
        with open(MODELS_DIR / 'model_metadata.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        raise HTTPException(
            status_code=503,
            detail="Model metadata not found. Please train the models first."
        )


@router.post("/predict", response_model=PredictionOutput)
async def predict_aqi(input_data: PredictionInput):
    """
    Predict AQI value and category based on pollutant concentrations
    
    This endpoint uses trained Random Forest models to predict:
    - AQI value (regression)
    - AQI category (classification)
    - Prediction confidence
    """
    # Load models
    regressor, classifier, label_encoder = load_models()
    
    # Encode station
    try:
        station_encoded = label_encoder.transform([input_data.station])[0]
    except:
        station_encoded = 0  # Default to first station
    
    # Prepare features
    features = np.array([[
        input_data.pm2_5,
        input_data.pm10,
        input_data.no2,
        input_data.so2,
        input_data.co,
        input_data.o3,
        input_data.hour,
        input_data.month,
        input_data.day_of_week,
        input_data.is_weekend,
        station_encoded
    ]])
    
    # Predict AQI value
    predicted_aqi = regressor.predict(features)[0]
    
    # Predict AQI category
    predicted_category = classifier.predict(features)[0]
    
    # Get confidence
    confidence = classifier.predict_proba(features).max()
    
    return PredictionOutput(
        predicted_aqi=round(float(predicted_aqi), 2),
        aqi_category=predicted_category,
        confidence=round(float(confidence), 4),
        timestamp=datetime.now().isoformat(),
        station=input_data.station
    )


@router.get("/forecast/{station}", response_model=ForecastOutput)
async def forecast_aqi(
    station: str,
    hours: int = Query(default=24, ge=1, le=72, description="Number of hours to forecast")
):
    """
    Generate AQI forecast for the next N hours for a specific station
    
    Uses current pollutant levels and time-based patterns to predict future AQI
    """
    # Load models
    regressor, classifier, label_encoder = load_models()
    
    # Load metadata to get typical pollutant levels
    metadata = load_metadata()
    
    if station not in metadata['stations']:
        raise HTTPException(
            status_code=404,
            detail=f"Station '{station}' not found. Available stations: {', '.join(metadata['stations'])}"
        )
    
    # Generate forecast
    forecast = []
    current_time = datetime.now()
    
    # Base pollutant levels (these would ideally come from latest readings)
    base_pm25 = 80.0
    base_pm10 = 120.0
    base_no2 = 45.0
    base_so2 = 20.0
    base_co = 1.2
    base_o3 = 35.0
    
    for i in range(hours):
        forecast_time = current_time + timedelta(hours=i)
        hour = forecast_time.hour
        month = forecast_time.month
        day_of_week = forecast_time.weekday()
        is_weekend = 1 if day_of_week >= 5 else 0
        
        # Apply time-based variations
        if hour in [7, 8, 9, 18, 19, 20]:
            time_factor = 1.3  # Rush hours
        elif hour in [0, 1, 2, 3, 4, 5]:
            time_factor = 0.7  # Night time
        else:
            time_factor = 1.0
        
        # Seasonal variation
        seasonal_factor = 1.4 if month in [11, 12, 1, 2] else 1.0
        
        # Calculate pollutant levels
        pm25 = base_pm25 * time_factor * seasonal_factor
        pm10 = base_pm10 * time_factor * seasonal_factor
        no2 = base_no2 * time_factor * seasonal_factor
        so2 = base_so2 * seasonal_factor
        co = base_co * time_factor * seasonal_factor
        o3 = base_o3
        
        # Encode station
        station_encoded = label_encoder.transform([station])[0]
        
        # Prepare features
        features = np.array([[pm25, pm10, no2, so2, co, o3, hour, month, day_of_week, is_weekend, station_encoded]])
        
        # Predict
        predicted_aqi = regressor.predict(features)[0]
        predicted_category = classifier.predict(features)[0]
        confidence = classifier.predict_proba(features).max()
        
        forecast.append({
            'time': forecast_time.strftime('%Y-%m-%d %H:%M'),
            'hour': hour,
            'predicted_aqi': round(float(predicted_aqi), 2),
            'aqi_category': predicted_category,
            'confidence': round(float(confidence), 4),
            'pollutants': {
                'pm2_5': round(pm25, 2),
                'pm10': round(pm10, 2),
                'no2': round(no2, 2),
                'so2': round(so2, 2),
                'co': round(co, 2),
                'o3': round(o3, 2)
            }
        })
    
    return ForecastOutput(
        station=station,
        forecast=forecast,
        generated_at=datetime.now().isoformat()
    )


@router.get("/model-info", response_model=ModelInfo)
async def get_model_info():
    """
    Get information about the trained ML models
    
    Returns metadata including:
    - Training data statistics
    - Model performance metrics
    - Available stations
    - AQI categories
    """
    metadata = load_metadata()
    return ModelInfo(**metadata)


@router.get("/stations")
async def get_stations():
    """
    Get list of available monitoring stations in Nashik
    """
    metadata = load_metadata()
    return {
        'city': metadata['city'],
        'stations': metadata['stations'],
        'total_stations': len(metadata['stations'])
    }


@router.get("/feature-importance")
async def get_feature_importance():
    """
    Get feature importance from the trained regression model
    
    Shows which pollutants and factors contribute most to AQI predictions
    """
    regressor, _, _ = load_models()
    metadata = load_metadata()
    
    feature_columns = metadata['feature_columns']
    importances = regressor.feature_importances_
    
    feature_importance = [
        {
            'feature': feature,
            'importance': round(float(importance), 4),
            'percentage': round(float(importance) * 100, 2)
        }
        for feature, importance in zip(feature_columns, importances)
    ]
    
    # Sort by importance
    feature_importance.sort(key=lambda x: x['importance'], reverse=True)
    
    return {
        'feature_importance': feature_importance,
        'model_type': 'Random Forest Regressor'
    }


@router.post("/batch-predict")
async def batch_predict(inputs: List[PredictionInput]):
    """
    Predict AQI for multiple inputs at once
    
    Useful for bulk predictions or analyzing multiple scenarios
    """
    if len(inputs) > 100:
        raise HTTPException(
            status_code=400,
            detail="Maximum 100 predictions per batch request"
        )
    
    # Load models once
    regressor, classifier, label_encoder = load_models()
    
    results = []
    for input_data in inputs:
        # Encode station
        try:
            station_encoded = label_encoder.transform([input_data.station])[0]
        except:
            station_encoded = 0
        
        # Prepare features
        features = np.array([[
            input_data.pm2_5, input_data.pm10, input_data.no2,
            input_data.so2, input_data.co, input_data.o3,
            input_data.hour, input_data.month, input_data.day_of_week,
            input_data.is_weekend, station_encoded
        ]])
        
        # Predict
        predicted_aqi = regressor.predict(features)[0]
        predicted_category = classifier.predict(features)[0]
        confidence = classifier.predict_proba(features).max()
        
        results.append({
            'predicted_aqi': round(float(predicted_aqi), 2),
            'aqi_category': predicted_category,
            'confidence': round(float(confidence), 4),
            'station': input_data.station
        })
    
    return {
        'predictions': results,
        'count': len(results),
        'timestamp': datetime.now().isoformat()
    }


@router.get("/health")
async def ml_health_check():
    """
    Check if ML models are loaded and ready
    """
    try:
        load_models()
        load_metadata()
        return {
            'status': 'healthy',
            'models_loaded': True,
            'message': 'ML prediction service is operational'
        }
    except Exception as e:
        return {
            'status': 'unhealthy',
            'models_loaded': False,
            'message': str(e)
        }
