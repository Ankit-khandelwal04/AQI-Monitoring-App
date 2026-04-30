"""
Force seed the database - Run this manually if automatic seeding fails
Usage: python force_seed.py
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database.database import SessionLocal
from app.models.user import User, UserRole
from app.models.city import City
from app.models.zone import Zone
from app.models.aqi_reading import AQIReading
from app.models.alert import Alert, AlertSeverity
from app.utils.security import hash_password
from datetime import datetime, timedelta, timezone
import random

print("=" * 60)
print("FORCE DATABASE SEEDING")
print("=" * 60)

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

db = SessionLocal()

try:
    print("\n1. Checking existing data...")
    user_count = db.query(User).count()
    print(f"   Found {user_count} users")
    
    if user_count > 0:
        print("\n⚠️  Database already has users!")
        response = input("   Do you want to continue anyway? (yes/no): ")
        if response.lower() != 'yes':
            print("   Aborted.")
            sys.exit(0)
    
    print("\n2. Creating users...")
    # Delete existing users if any
    if user_count > 0:
        db.query(User).delete()
        db.commit()
        print("   Deleted existing users")
    
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
    print(f"   ✅ Created {len(users)} users")
    
    print("\n3. Creating city...")
    nashik = db.query(City).filter(City.city_name == "Nashik").first()
    if not nashik:
        nashik = City(city_name="Nashik", latitude=20.0059, longitude=73.7897)
        db.add(nashik)
        db.commit()
        db.refresh(nashik)
        print("   ✅ Created Nashik city")
    else:
        print("   ℹ️  Nashik city already exists")
    
    print("\n4. Creating zones...")
    zone_map = {}
    zones_created = 0
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
            zones_created += 1
        else:
            zone_map[zone_name] = existing
    
    print(f"   ✅ Created {zones_created} zones (total: {len(zone_map)})")
    
    print("\n5. Creating AQI readings...")
    now = datetime.now(timezone.utc)
    readings_created = 0
    
    for zone_name, zone in zone_map.items():
        base_aqi = ZONE_BASE_AQI.get(zone_name, 100)
        
        for day_offset in range(7):
            for hour in range(0, 24, 2):
                ts = now - timedelta(days=day_offset, hours=hour)
                
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
                readings_created += 1
    
    db.commit()
    print(f"   ✅ Created {readings_created} AQI readings")
    
    print("\n6. Creating alerts...")
    nashik_road = zone_map.get("Nashik Road")
    satpur = zone_map.get("Satpur")
    alerts_created = 0
    
    if nashik_road:
        db.add(Alert(
            zone_id=nashik_road.id,
            message="AQI has crossed 200 in Nashik Road area. Residents are advised to avoid outdoor activities.",
            severity=AlertSeverity.warning
        ))
        alerts_created += 1
    
    if satpur:
        db.add(Alert(
            zone_id=satpur.id,
            message="Industrial emissions in Satpur MIDC are contributing to high AQI levels.",
            severity=AlertSeverity.emergency
        ))
        alerts_created += 1
    
    db.commit()
    print(f"   ✅ Created {alerts_created} alerts")
    
    print("\n" + "=" * 60)
    print("✅ DATABASE SEEDING COMPLETE!")
    print("=" * 60)
    print("\n📋 Login Credentials:")
    print("   Admin: admin@nashikaqi.in / admin@123")
    print("   User:  ankit@nashikaqi.in / user@1234")
    print("   User:  priya@nashikaqi.in / user@1234")
    print("\n⚠️  Remember: Passwords are all lowercase!")
    print("=" * 60)
    
except Exception as e:
    db.rollback()
    print(f"\n❌ ERROR: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
finally:
    db.close()
