"""
Setup Routes - One-time database initialization endpoints
These endpoints should be disabled in production after initial setup
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.user import User, UserRole
from app.models.city import City
from app.models.zone import Zone
from app.models.aqi_reading import AQIReading
from app.models.alert import Alert, AlertSeverity
from app.utils.security import hash_password
from datetime import datetime, timedelta, timezone
import random

router = APIRouter(tags=["Setup"])

# Zone polygons for Nashik
ZONE_POLYGONS = {
    "Cidco": {
        "type": "Feature",
        "properties": {},
        "geometry": {
            "type": "Polygon",
            "coordinates": [[[73.77, 20.02],[73.79, 20.02],[73.79, 19.99],[73.77, 19.99],[73.77, 20.02]]],
        },
    },
    "Nashik Road": {
        "type": "Feature",
        "properties": {},
        "geometry": {
            "type": "Polygon",
            "coordinates": [[[73.80, 20.00],[73.83, 20.00],[73.83, 19.97],[73.80, 19.97],[73.80, 20.00]]],
        },
    },
    "College Road": {
        "type": "Feature",
        "properties": {},
        "geometry": {
            "type": "Polygon",
            "coordinates": [[[73.77, 20.03],[73.79, 20.03],[73.79, 20.01],[73.77, 20.01],[73.77, 20.03]]],
        },
    },
    "Gangapur Road": {
        "type": "Feature",
        "properties": {},
        "geometry": {
            "type": "Polygon",
            "coordinates": [[[73.74, 20.03],[73.76, 20.03],[73.76, 20.00],[73.74, 20.00],[73.74, 20.03]]],
        },
    },
    "Satpur": {
        "type": "Feature",
        "properties": {},
        "geometry": {
            "type": "Polygon",
            "coordinates": [[[73.75, 20.00],[73.77, 20.00],[73.77, 19.97],[73.75, 19.97],[73.75, 20.00]]],
        },
    },
    "Panchavati": {
        "type": "Feature",
        "properties": {},
        "geometry": {
            "type": "Polygon",
            "coordinates": [[[73.79, 20.04],[73.81, 20.04],[73.81, 20.02],[73.79, 20.02],[73.79, 20.04]]],
        },
    },
}

ZONE_BASE_AQI = {
    "Cidco": 148,
    "Nashik Road": 210,
    "College Road": 95,
    "Gangapur Road": 72,
    "Satpur": 230,
    "Panchavati": 88,
}


@router.post("/setup/seed-database")
async def seed_database(db: Session = Depends(get_db)):
    """
    One-time database seeding endpoint.
    Creates users, city, zones, and sample AQI readings.
    
    ⚠️ This endpoint should be called once after deployment.
    ⚠️ Safe to call multiple times (idempotent).
    """
    try:
        results = {
            "users_created": 0,
            "city_created": False,
            "zones_created": 0,
            "readings_created": 0,
            "alerts_created": 0,
            "message": ""
        }
        
        # 1. Create users if they don't exist
        existing_users = db.query(User).count()
        if existing_users == 0:
            users = [
                User(
                    name="Admin User",
                    email="admin@nashikaqi.in",
                    password_hash=hash_password("admin@123"),
                    role=UserRole.admin
                ),
                User(
                    name="Ankit Sharma",
                    email="ankit@nashikaqi.in",
                    password_hash=hash_password("user@1234"),
                    role=UserRole.user
                ),
                User(
                    name="Priya Patil",
                    email="priya@nashikaqi.in",
                    password_hash=hash_password("user@1234"),
                    role=UserRole.user
                ),
            ]
            db.add_all(users)
            db.commit()
            results["users_created"] = len(users)
        else:
            results["message"] += f"Users already exist ({existing_users} found). "
        
        # 2. Create city
        nashik = db.query(City).filter(City.city_name == "Nashik").first()
        if not nashik:
            nashik = City(city_name="Nashik", latitude=20.0059, longitude=73.7897)
            db.add(nashik)
            db.commit()
            db.refresh(nashik)
            results["city_created"] = True
        else:
            results["message"] += "City already exists. "
        
        # 3. Create zones
        zone_map = {}
        for zone_name, polygon in ZONE_POLYGONS.items():
            existing = db.query(Zone).filter(
                Zone.city_id == nashik.id,
                Zone.zone_name == zone_name
            ).first()
            
            if not existing:
                zone = Zone(
                    city_id=nashik.id,
                    zone_name=zone_name,
                    geojson_polygon=polygon
                )
                db.add(zone)
                db.commit()
                db.refresh(zone)
                zone_map[zone_name] = zone
                results["zones_created"] += 1
            else:
                zone_map[zone_name] = existing
        
        # 4. Create AQI readings (last 7 days, every 2 hours)
        now = datetime.now(timezone.utc)
        for zone_name, zone in zone_map.items():
            base_aqi = ZONE_BASE_AQI.get(zone_name, 100)
            
            # Check if readings exist
            existing_count = db.query(AQIReading).filter(
                AQIReading.zone_id == zone.id
            ).count()
            
            if existing_count < 20:  # Only seed if less than 20 readings
                for day_offset in range(7):
                    for hour in range(0, 24, 2):
                        ts = now - timedelta(days=day_offset, hours=hour)
                        
                        # Simulate daily pattern
                        hour_factor = 1.0 + 0.15 * (
                            1 if 7 <= ts.hour <= 9 or 17 <= ts.hour <= 20 else 0
                        )
                        aqi = round(base_aqi * hour_factor + random.uniform(-20, 20), 1)
                        aqi = max(10, aqi)
                        
                        pm25 = round(aqi * 0.38 + random.uniform(-5, 5), 1)
                        pm10 = round(aqi * 0.52 + random.uniform(-5, 5), 1)
                        
                        reading = AQIReading(
                            zone_id=zone.id,
                            timestamp=ts,
                            aqi_value=aqi,
                            pm25=pm25,
                            pm10=pm10,
                            no2=round(random.uniform(20, 60), 1),
                            so2=round(random.uniform(5, 30), 1),
                            co=round(random.uniform(0.5, 3.0), 2),
                            o3=round(random.uniform(10, 80), 1),
                        )
                        db.add(reading)
                        results["readings_created"] += 1
                
                db.commit()
        
        # 5. Create sample alerts
        if db.query(Alert).count() == 0:
            nashik_road = zone_map.get("Nashik Road")
            satpur = zone_map.get("Satpur")
            
            if nashik_road:
                db.add(Alert(
                    zone_id=nashik_road.id,
                    message="AQI has crossed 200 in Nashik Road area. Residents are advised to avoid outdoor activities.",
                    severity=AlertSeverity.warning
                ))
                results["alerts_created"] += 1
            
            if satpur:
                db.add(Alert(
                    zone_id=satpur.id,
                    message="Industrial emissions in Satpur MIDC are contributing to high AQI levels.",
                    severity=AlertSeverity.emergency
                ))
                results["alerts_created"] += 1
            
            db.commit()
        
        # Build success message
        if results["users_created"] > 0:
            results["message"] += f"✅ Created {results['users_created']} users. "
        if results["city_created"]:
            results["message"] += "✅ Created Nashik city. "
        if results["zones_created"] > 0:
            results["message"] += f"✅ Created {results['zones_created']} zones. "
        if results["readings_created"] > 0:
            results["message"] += f"✅ Created {results['readings_created']} AQI readings. "
        if results["alerts_created"] > 0:
            results["message"] += f"✅ Created {results['alerts_created']} alerts. "
        
        if not results["message"]:
            results["message"] = "Database already seeded. No changes made."
        
        results["credentials"] = {
            "admin": {
                "email": "admin@nashikaqi.in",
                "password": "admin@123"
            },
            "users": [
                {"email": "ankit@nashikaqi.in", "password": "user@1234"},
                {"email": "priya@nashikaqi.in", "password": "user@1234"}
            ]
        }
        
        return {
            "status": "success",
            "data": results
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Seeding failed: {str(e)}")


@router.get("/setup/check-database")
async def check_database(db: Session = Depends(get_db)):
    """
    Check database status - how many records exist.
    """
    try:
        user_count = db.query(User).count()
        city_count = db.query(City).count()
        zone_count = db.query(Zone).count()
        reading_count = db.query(AQIReading).count()
        alert_count = db.query(Alert).count()
        
        # Get user emails
        users = db.query(User.email, User.role).all()
        user_list = [{"email": u.email, "role": u.role.value} for u in users]
        
        return {
            "status": "success",
            "data": {
                "users": user_count,
                "cities": city_count,
                "zones": zone_count,
                "readings": reading_count,
                "alerts": alert_count,
                "user_list": user_list,
                "database_ready": user_count > 0 and zone_count > 0
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Check failed: {str(e)}")
