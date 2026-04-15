# AQI Monitoring Backend — FastAPI

Production-ready Python backend for the **Nashik Smart City AQI Monitoring System**.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | FastAPI 0.115 |
| Database | PostgreSQL 16 |
| ORM / Migrations | SQLAlchemy 2.0 + Alembic |
| Auth | JWT (python-jose) + bcrypt |
| Maps | Google Maps Geocoding API |
| Server | Uvicorn |
| Containers | Docker + Docker Compose |

---

## Project Structure

```
FullStackBackend/
├── app/
│   ├── main.py              # FastAPI app, CORS, router registration
│   ├── config.py            # Settings from .env
│   ├── models/              # SQLAlchemy ORM models
│   ├── schemas/             # Pydantic request/response models
│   ├── routers/             # API route handlers
│   ├── services/            # Business logic (DB queries)
│   └── utils/               # JWT, AQI classifier, GeoJSON helpers
├── alembic/                 # Alembic migration files
├── scripts/
│   └── seed.py              # Sample data (Nashik zones + AQI readings)
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
└── .env.example
```

---

## Option A — Local Setup (Manual)

### 1. Prerequisites
- Python 3.11+
- PostgreSQL 16 running locally

### 2. Clone & create virtual environment

```bash
cd "Full Stack/FullStackBackend"
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt 
```

### 4. Configure environment

```bash
copy .env.example .env       # Windows
# OR
cp .env.example .env         # macOS/Linux
```

Edit `.env`:
```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/aqi_db
SECRET_KEY=your-very-long-secret-key-here
GOOGLE_MAPS_API_KEY=your-google-maps-api-key   # optional
```

### 5. Create PostgreSQL database

```bash
psql -U postgres -c "CREATE DATABASE aqi_db;"
```

### 6. Run Alembic migrations

```bash
alembic revision --autogenerate -m "initial schema"
alembic upgrade head
```

### 7. Seed sample data

```bash
python scripts/seed.py
```

Output:
```
✅ Created 3 users
✅ Created city: Nashik
✅ Created 6 zones
✅ Created 504 AQI readings
✅ Created 2 sample alerts

📋 Login credentials:
   Admin : admin@nashikaqi.in  / admin@123
   User  : ankit@nashikaqi.in  / user@1234
```

### 8. Start the server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API is live at: **http://localhost:8000**
Swagger docs: **http://localhost:8000/docs**

---

## Option B — Docker Setup (Recommended)

```bash
# Copy env file first
copy .env.example .env

# Build and start all services
docker-compose up --build
```

Services started:
- **FastAPI API** → http://localhost:8000/docs
- **PostgreSQL 16** → localhost:5432

To seed data in Docker:
```bash
docker-compose exec api python scripts/seed.py
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Register new user |
| POST | `/auth/login` | No | Login → returns JWT |
| GET | `/auth/me` | Bearer | Current user profile |

### AQI Data
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/aqi/current?city=Nashik&zone=Cidco` | Bearer | Latest AQI reading |
| GET | `/aqi/history?zone_id=1&start_date=…&end_date=…` | Bearer | Historical time-series |
| POST | `/aqi/predict` | Bearer | ML prediction (stub, plug-in ready) |

### Cities & Zones
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/cities` | Bearer | List all cities |
| GET | `/zones/{city_id}` | Bearer | Zones in a city |
| GET | `/map/zones` | Bearer | GeoJSON FeatureCollection with AQI colours |

### Admin (requires admin JWT)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/dashboard` | Avg AQI, highest zone, red zone count |
| POST | `/admin/create-zone` | Create zone with GeoJSON polygon |
| PUT | `/admin/update-zone/{id}` | Update zone |
| DELETE | `/admin/delete-zone/{id}` | Delete zone |

### Alerts
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/alerts/send` | Admin | Send alert to a zone |
| GET | `/alerts/history` | Bearer | Alert history (optional zone filter) |

### Maps
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/maps/geocode?city=Nashik` | Bearer | Lat/lng from Google Maps API |
| GET | `/maps/aqi-color-scale` | No | AQI colour classification reference |

---

## Example API Responses

### POST /auth/login
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "name": "Ankit Sharma",
    "email": "ankit@nashikaqi.in",
    "role": "user",
    "created_at": "2026-03-18T05:30:00Z"
  }
}
```

### GET /aqi/current?city=Nashik&zone=Cidco
```json
{
  "status": "success",
  "data": {
    "zone_id": 1,
    "zone_name": "Cidco",
    "city_name": "Nashik",
    "aqi_value": 148.0,
    "classification": {
      "level": "Moderate",
      "color": "#eab308",
      "color_code": "orange"
    },
    "pollutants": {
      "pm25": 56.2, "pm10": 77.1,
      "no2": 38.4, "so2": 14.7,
      "co": 1.2, "o3": 45.3
    },
    "timestamp": "2026-03-18T05:28:00Z"
  }
}
```

### GET /map/zones (GeoJSON excerpt)
```json
{
  "status": "success",
  "data": {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "properties": {
          "zone_id": 2,
          "zone_name": "Nashik Road",
          "aqi_value": 210.5,
          "level": "Poor",
          "color": "#f97316",
          "color_code": "red"
        },
        "geometry": { "type": "Polygon", "coordinates": [[[73.80, 20.00], ...]] }
      }
    ]
  }
}
```

---

## AQI Color Classification

| AQI Range | Level | Hex Color |
|-----------|-------|-----------|
| 0 – 50 | Good | `#22c55e` 🟢 |
| 51 – 100 | Satisfactory | `#84cc16` 🟡 |
| 101 – 200 | Moderate | `#eab308` 🟠 |
| 201 – 300 | Poor | `#f97316` 🔴 |
| 301+ | Very Poor | `#ef4444` 🟣 |

---

## Connecting the React Native Frontend

In your mobile app, point API calls to:
```
http://<YOUR_LOCAL_IP>:8000
```

Include the JWT in every request header:
```
Authorization: Bearer <token>
```

Enable the CORS origin in `.env`:
```env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:19006,exp://192.168.0.244:8081
```

---

## Adding ML Predictions (Future)

To plug in your LSTM/XGBoost model:

1. Open `app/services/aqi_service.py`
2. Replace the body of `predict_aqi()` with your model call
3. The `POST /aqi/predict` endpoint schema is already defined — no other changes needed

---

## Alembic Migration Workflow

```bash
# After changing a model:
alembic revision --autogenerate -m "describe your change"
alembic upgrade head

# Rollback:
alembic downgrade -1
```
