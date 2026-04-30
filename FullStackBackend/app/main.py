import logging
import sys

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database.database import Base, engine
from app.routers import auth_routes, aqi_routes, zone_routes, admin_routes, alert_routes, maps_routes, report_routes, ml_routes, setup_routes

# ── Logging ──────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger(__name__)

# ── App instance ─────────────────────────────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
## AQI Monitoring & Prediction API

Production-ready backend for Smart City Air Quality Monitoring.

### Features
- 🔐 JWT Authentication with role-based access (Admin / User)
- 📊 Real-time and historical AQI data per zone
- 🗺️ GeoJSON zone map with AQI colour classification
- 🔔 Alert broadcasting to affected zones
- 🗺️ Google Maps integration for city/zone coordinates
- 🤖 ML prediction endpoint stubs (plug-in ready)

### AQI Scale
| AQI | Level | Color |
|-----|-------|-------|
| 0–50 | Good | 🟢 Green |
| 51–100 | Satisfactory | 🟡 Yellow |
| 101–200 | Moderate | 🟠 Orange |
| 201–300 | Poor | 🔴 Red |
| 301+ | Very Poor | 🟣 Purple |
    """,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# ── CORS ─────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Startup ──────────────────────────────────────────────────
@app.on_event("startup")
async def startup_event():
    logger.info("Starting up %s v%s", settings.APP_NAME, settings.APP_VERSION)
    # Tables are created via Alembic migrations; this is a safety net for dev
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables verified.")
    
    # Automatically seed database if empty (for free tier deployment)
    try:
        import sys
        from pathlib import Path
        # Add parent directory to path to import seed_on_startup
        parent_dir = Path(__file__).parent.parent.parent
        if str(parent_dir) not in sys.path:
            sys.path.insert(0, str(parent_dir))
        from seed_on_startup import seed_database_on_startup
        seed_database_on_startup()
        logger.info("✅ Database seeding completed")
    except Exception as e:
        logger.error(f"❌ Automatic seed failed: {e}")
        import traceback
        logger.error(traceback.format_exc())


@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down %s", settings.APP_NAME)


# ── Routers ──────────────────────────────────────────────────
app.include_router(auth_routes.router,   prefix="/auth",    tags=["Authentication"])
app.include_router(aqi_routes.router,    prefix="/aqi",     tags=["AQI Data"])
app.include_router(zone_routes.router,   prefix="",         tags=["Cities & Zones"])
app.include_router(admin_routes.router,  prefix="/admin",   tags=["Admin"])
app.include_router(alert_routes.router,  prefix="/alerts",  tags=["Alerts"])
app.include_router(maps_routes.router,   prefix="/maps",    tags=["Maps & GeoJSON"])
app.include_router(report_routes.router, prefix="/reports", tags=["Reports"])
app.include_router(ml_routes.router,     prefix="/ml",      tags=["Machine Learning"])
app.include_router(setup_routes.router,  prefix="",         tags=["Setup"])


# ── Health check ─────────────────────────────────────────────
@app.get("/", tags=["Health"])
def root():
    return {
        "status": "success",
        "data": {
            "message": "AQI Monitoring API is running",
            "version": settings.APP_VERSION,
            "docs": "/docs",
        },
    }


@app.get("/health", tags=["Health"])
def health():
    return {"status": "success", "data": {"healthy": True}}


@app.get("/seed-now", tags=["Health"])
def seed_now():
    """Emergency seeding endpoint - call this if database is empty"""
    try:
        import sys
        from pathlib import Path
        parent_dir = Path(__file__).parent.parent.parent
        if str(parent_dir) not in sys.path:
            sys.path.insert(0, str(parent_dir))
        from seed_on_startup import seed_database_on_startup
        seed_database_on_startup()
        return {
            "status": "success",
            "message": "Database seeding triggered",
            "credentials": {
                "admin": "admin@nashikaqi.in / admin@123",
                "user": "ankit@nashikaqi.in / user@1234"
            }
        }
    except Exception as e:
        import traceback
        return {
            "status": "error",
            "message": str(e),
            "traceback": traceback.format_exc()
        }
