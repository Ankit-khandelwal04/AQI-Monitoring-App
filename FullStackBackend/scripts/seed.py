"""
Seed script — populates the database with sample data for Nashik city.

Run:
    python scripts/seed.py

Requires DATABASE_URL in .env (or environment).
"""
import sys
import os
from datetime import datetime, timedelta, timezone
import random

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database.database import SessionLocal, engine
from app.database.database import Base
from app.models.user import User, UserRole
from app.models.city import City
from app.models.zone import Zone
from app.models.aqi_reading import AQIReading
from app.models.alert import Alert, AlertSeverity
from app.utils.security import hash_password

Base.metadata.create_all(bind=engine)

# ── NASHIK AQI ZONE POLYGONS (approximate) ───────────────────
# Nashik centre: 20.0059° N, 73.7897° E
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

# Base AQI values per zone (realistic Nashik values)
ZONE_BASE_AQI = {
    "Cidco":         148,
    "Nashik Road":   210,  # industrial — red zone
    "College Road":  95,
    "Gangapur Road": 72,
    "Satpur":        230,  # industrial — red zone
    "Panchavati":    88,
}


def seed():
    db = SessionLocal()
    try:
        print("🌱 Starting seed...")

        # ── Users ───────────────────────────────────────────────
        if not db.query(User).first():
            users = [
                User(name="Admin User",   email="admin@nashikaqi.in",  password_hash=hash_password("admin@123"),   role=UserRole.admin),
                User(name="Ankit Sharma", email="ankit@nashikaqi.in",  password_hash=hash_password("user@1234"),   role=UserRole.user),
                User(name="Priya Patil",  email="priya@nashikaqi.in",  password_hash=hash_password("user@1234"),   role=UserRole.user),
            ]
            db.add_all(users)
            db.commit()
            print(f"  ✅ Created {len(users)} users")
        else:
            print("  ⏭️  Users already exist")

        # ── City ────────────────────────────────────────────────
        nashik = db.query(City).filter(City.city_name == "Nashik").first()
        if not nashik:
            nashik = City(city_name="Nashik", latitude=20.0059, longitude=73.7897)
            db.add(nashik)
            db.commit()
            print("  ✅ Created city: Nashik")
        else:
            print("  ⏭️  Nashik already exists")

        # ── Zones ───────────────────────────────────────────────
        created_zones = 0
        zone_map: dict[str, Zone] = {}
        for zone_name, polygon in ZONE_POLYGONS.items():
            existing = db.query(Zone).filter(Zone.city_id == nashik.id, Zone.zone_name == zone_name).first()
            if not existing:
                zone = Zone(city_id=nashik.id, zone_name=zone_name, geojson_polygon=polygon)
                db.add(zone)
                db.commit()
                db.refresh(zone)
                zone_map[zone_name] = zone
                created_zones += 1
            else:
                zone_map[zone_name] = existing
        print(f"  ✅ Created {created_zones} zones (skipped {len(ZONE_POLYGONS) - created_zones})")

        # ── AQI Readings (last 7 days, every 2 hours) ────────────
        created_readings = 0
        now = datetime.now(timezone.utc)
        for zone_name, zone in zone_map.items():
            base_aqi = ZONE_BASE_AQI[zone_name]
            # Check if readings exist
            existing_count = db.query(AQIReading).filter(AQIReading.zone_id == zone.id).count()
            if existing_count > 20:
                print(f"  ⏭️  Readings for {zone_name} already exist")
                continue
            for day_offset in range(7):
                for hour in range(0, 24, 2):
                    ts = now - timedelta(days=day_offset, hours=hour)
                    # Simulate daily AQI pattern (worse at peak traffic hours)
                    hour_factor = 1.0 + 0.15 * (1 if 7 <= ts.hour <= 9 or 17 <= ts.hour <= 20 else 0)
                    aqi = round(base_aqi * hour_factor + random.uniform(-20, 20), 1)
                    aqi = max(10, aqi)  # floor at 10
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
                    created_readings += 1
        db.commit()
        print(f"  ✅ Created {created_readings} AQI readings")

        # ── Alerts ──────────────────────────────────────────────
        if db.query(Alert).count() == 0:
            nashik_road = zone_map.get("Nashik Road")
            satpur       = zone_map.get("Satpur")
            if nashik_road:
                db.add(Alert(zone_id=nashik_road.id, message="AQI has crossed 200 in Nashik Road area. Residents are advised to avoid outdoor activities. Industries are requested to reduce emissions.", severity=AlertSeverity.warning))
            if satpur:
                db.add(Alert(zone_id=satpur.id,      message="Industrial emissions in Satpur MIDC are contributing to high AQI levels. Factories are advised to follow emission norms immediately.", severity=AlertSeverity.emergency))
            db.commit()
            print("  ✅ Created 2 sample alerts")

        print("\n✅ Seed complete!")
        print("\n📋 Login credentials:")
        print("   Admin : admin@nashikaqi.in  / admin@123")
        print("   User  : ankit@nashikaqi.in  / user@1234")

    except Exception as e:
        db.rollback()
        print(f"❌ Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
