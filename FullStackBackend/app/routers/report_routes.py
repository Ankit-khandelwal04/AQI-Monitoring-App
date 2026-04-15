"""
Report generation endpoints for AQI data
"""
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Literal

from app.database.database import get_db
from app.models.user import User
from app.models.city import City
from app.models.zone import Zone
from app.routers.auth_routes import get_current_user
from app.services import aqi_service
from app.utils.response import success

router = APIRouter()


@router.get("/generate")
def generate_report(
    city: str = Query(..., description="City name"),
    report_type: Literal["daily", "weekly", "monthly"] = Query("daily", description="Report type"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Generate AQI report for a city
    
    - **daily**: Last 24 hours
    - **weekly**: Last 7 days
    - **monthly**: Last 30 days
    """
    
    # Calculate date range based on report type
    end_date = datetime.now()
    if report_type == "daily":
        start_date = end_date - timedelta(days=1)
    elif report_type == "weekly":
        start_date = end_date - timedelta(days=7)
    else:  # monthly
        start_date = end_date - timedelta(days=30)
    
    # Get city by name
    city_obj = db.query(City).filter(City.city_name.ilike(f"%{city}%")).first()
    if not city_obj:
        raise HTTPException(status_code=404, detail=f"City not found: {city}")
    
    # Get all zones for the city
    zones = db.query(Zone).filter(Zone.city_id == city_obj.id).all()
    
    if not zones:
        raise HTTPException(status_code=404, detail=f"No zones found for city: {city}")
    
    # Collect AQI data for each zone
    report_data = []
    for zone in zones:
        history = aqi_service.get_aqi_history(
            db,
            zone_id=zone.id,
            start_date=start_date,
            end_date=end_date
        )
        
        if history:
            avg_aqi = sum(r.aqi_value for r in history) / len(history)
            max_aqi = max(r.aqi_value for r in history)
            min_aqi = min(r.aqi_value for r in history)
            
            report_data.append({
                "zone_name": zone.zone_name,
                "readings_count": len(history),
                "average_aqi": round(avg_aqi, 2),
                "max_aqi": round(max_aqi, 2),
                "min_aqi": round(min_aqi, 2),
            })
    
    return success({
        "report_type": report_type,
        "city": city_obj.city_name,
        "period": {
            "start": start_date.isoformat(),
            "end": end_date.isoformat(),
        },
        "zones": report_data,
        "total_zones": len(report_data),
        "generated_at": datetime.now().isoformat(),
        "generated_by": current_user.email,
    })
