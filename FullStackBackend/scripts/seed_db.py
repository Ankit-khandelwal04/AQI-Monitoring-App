"""
seed_db.py — Comprehensive database seeder for AQI Monitoring App
Adds missing zones and seeds realistic hourly AQI readings for the past 7 days.
Safe to run multiple times (idempotent).
"""

import sys
import os
import random
import math
from datetime import datetime, timedelta, timezone
from pathlib import Path

# Make sure the app package is importable
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from app.database.database import SessionLocal
from app.models.city import City
from app.models.zone import Zone
from app.models.aqi_reading import AQIReading

# ── Zone definitions matching the mobile app's nashikAreas ───────────────────
# name must match exactly (case-insensitive lookup is used in backend)
NASHIK_ZONES = [
    {"name": "Cidco",          "base_aqi": 85,  "lat": 19.9975, "lng": 73.7898},
    {"name": "Nashik Road",    "base_aqi": 120, "lat": 20.0063, "lng": 73.7898},
    {"name": "College Road",   "base_aqi": 95,  "lat": 19.9872, "lng": 73.7956},
    {"name": "Gangapur Road",  "base_aqi": 145, "lat": 20.0144, "lng": 73.7679},
    {"name": "Satpur",         "base_aqi": 185, "lat": 20.0203, "lng": 73.7679},
    {"name": "Panchavati",     "base_aqi": 78,  "lat": 19.9955, "lng": 73.7956},
    {"name": "Old Agra Road",  "base_aqi": 165, "lat": 19.9831, "lng": 73.7679},
    {"name": "Dwarka",         "base_aqi": 92,  "lat": 19.9747, "lng": 73.7898},
    {"name": "Ashok Stambh",   "base_aqi": 110, "lat": 19.9912, "lng": 73.7820},
    {"name": "Makhmalabad",    "base_aqi": 135, "lat": 20.0089, "lng": 73.7820},
]

NASHIK_CITY = {"name": "Nashik", "latitude": 20.0059, "longitude": 73.7897}

# How many days of hourly readings to generate
DAYS_OF_HISTORY = 7


def make_realistic_aqi(base_aqi: float, hour: int, day_offset: int) -> dict:
    """Generate realistic pollutant readings for a given hour and day."""
    random.seed(base_aqi * 100 + hour + day_offset * 1000)  # deterministic per slot

    # Time-of-day factor (rush hours = higher pollution)
    if hour in [7, 8, 9, 18, 19, 20]:
        time_factor = 1.30
    elif hour in [0, 1, 2, 3, 4, 5]:
        time_factor = 0.70
    elif hour in [10, 11, 12, 13]:
        time_factor = 0.90
    else:
        time_factor = 1.0

    # Day-to-day variation (±15%)
    day_factor = 1.0 + (random.random() * 0.30 - 0.15)

    # Small random noise ±8%
    noise = 1.0 + (random.random() * 0.16 - 0.08)

    aqi = round(base_aqi * time_factor * day_factor * noise, 1)
    aqi = max(0.0, min(500.0, aqi))

    factor = aqi / 100.0
    return {
        "aqi_value": aqi,
        "pm25": round(35 * factor * (1 + random.random() * 0.2), 2),
        "pm10": round(50 * factor * (1 + random.random() * 0.2), 2),
        "no2":  round(40 * factor * (1 + random.random() * 0.2), 2),
        "so2":  round(20 * factor * (1 + random.random() * 0.2), 2),
        "co":   round(1.2 * factor * (1 + random.random() * 0.2), 3),
        "o3":   round(45 * factor * (1 + random.random() * 0.2), 2),
    }


def seed():
    db = SessionLocal()
    try:
        # ── 1. Ensure city exists ────────────────────────────────────────────
        city = db.query(City).filter(City.city_name.ilike(NASHIK_CITY["name"])).first()
        if not city:
            city = City(
                city_name=NASHIK_CITY["name"],
                latitude=NASHIK_CITY["latitude"],
                longitude=NASHIK_CITY["longitude"],
            )
            db.add(city)
            db.commit()
            db.refresh(city)
            print(f"✅ Created city: {city.city_name} (id={city.id})")
        else:
            print(f"ℹ️  City already exists: {city.city_name} (id={city.id})")

        # ── 2. Add missing zones ─────────────────────────────────────────────
        existing_zones = {z.zone_name.lower(): z for z in db.query(Zone).filter(Zone.city_id == city.id).all()}
        zone_map: dict[str, Zone] = {}

        for zdef in NASHIK_ZONES:
            key = zdef["name"].lower()
            if key in existing_zones:
                zone_map[zdef["name"]] = existing_zones[key]
                print(f"ℹ️  Zone already exists: {zdef['name']}")
            else:
                zone = Zone(city_id=city.id, zone_name=zdef["name"])
                db.add(zone)
                db.commit()
                db.refresh(zone)
                zone_map[zdef["name"]] = zone
                print(f"✅ Created zone: {zdef['name']} (id={zone.id})")

        # ── 3. Seed hourly AQI readings for past DAYS_OF_HISTORY days ───────
        # We generate readings for each hour slot; skip if that zone already
        # has a reading within 30 min of the target timestamp (idempotency).
        now = datetime.now(timezone.utc).replace(minute=0, second=0, microsecond=0)
        total_inserted = 0

        for zdef in NASHIK_ZONES:
            zone = zone_map[zdef["name"]]

            # Count existing readings for this zone to decide strategy
            existing_count = db.query(AQIReading).filter(AQIReading.zone_id == zone.id).count()

            if existing_count >= DAYS_OF_HISTORY * 24:
                print(f"Zone '{zdef['name']}' already has {existing_count} readings -- skipping")
                continue

            # Find the latest existing timestamp to avoid duplicating recent data
            latest_ts_row = (
                db.query(AQIReading.timestamp)
                .filter(AQIReading.zone_id == zone.id)
                .order_by(AQIReading.timestamp.desc())
                .first()
            )
            latest_existing_ts = latest_ts_row[0] if latest_ts_row else None

            # Bulk insert all hourly slots for the past DAYS_OF_HISTORY days
            readings_to_add = []
            for day in range(DAYS_OF_HISTORY, 0, -1):
                for hour in range(24):
                    ts = now - timedelta(days=day) + timedelta(hours=hour)
                    if ts > now:
                        continue
                    # Skip if already have a reading within 30 min of this slot
                    if latest_existing_ts and abs((ts - latest_existing_ts).total_seconds()) < 1800:
                        continue
                    data = make_realistic_aqi(zdef["base_aqi"], hour, day)
                    readings_to_add.append(AQIReading(
                        zone_id=zone.id,
                        timestamp=ts,
                        aqi_value=data["aqi_value"],
                        pm25=data["pm25"],
                        pm10=data["pm10"],
                        no2=data["no2"],
                        so2=data["so2"],
                        co=data["co"],
                        o3=data["o3"],
                    ))

            if readings_to_add:
                db.bulk_save_objects(readings_to_add)
                db.commit()
                total_inserted += len(readings_to_add)
                print(f"Inserted {len(readings_to_add)} readings for '{zdef['name']}'")
            else:
                print(f"Zone '{zdef['name']}' readings up to date")
        print(f"\n🎉 Seed complete! Total new readings inserted: {total_inserted}")

        # ── 4. Summary ───────────────────────────────────────────────────────
        print("\n📊 Final DB state:")
        for zdef in NASHIK_ZONES:
            zone = zone_map[zdef["name"]]
            count = db.query(AQIReading).filter(AQIReading.zone_id == zone.id).count()
            latest = (
                db.query(AQIReading)
                .filter(AQIReading.zone_id == zone.id)
                .order_by(AQIReading.timestamp.desc())
                .first()
            )
            latest_aqi = round(latest.aqi_value, 1) if latest else "N/A"
            print(f"  Zone {zone.id:2d} '{zone.zone_name}': {count} readings, latest AQI = {latest_aqi}")

    except Exception as e:
        db.rollback()
        print(f"❌ Error during seeding: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("🌱 Starting database seed...\n")
    seed()
