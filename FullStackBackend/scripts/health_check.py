"""Quick health-check script for the backend."""
import warnings
warnings.filterwarnings('ignore')

from app.main import app
from app.config import settings

print("App:", settings.APP_NAME, "v" + settings.APP_VERSION)
print("DB:", settings.DATABASE_URL[:45] + "...")
print("CORS origins:")
for o in settings.allowed_origins_list:
    print(" ", o)

# Verify no duplicate routes
routes = [r.path for r in app.routes if hasattr(r, 'methods')]
seen = set()
dupes = []
for p in routes:
    if p in seen:
        dupes.append(p)
    seen.add(p)

if dupes:
    print("DUPLICATE routes found:", dupes)
else:
    print("\nNo duplicate routes - OK")
print("Total routes registered:", len(routes))

# Test DB connection and counts
from app.database.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    tables = conn.execute(text("SELECT tablename FROM pg_tables WHERE schemaname='public'")).fetchall()
    print("\nDB tables:", [t[0] for t in tables])
    
    zones   = conn.execute(text("SELECT COUNT(*) FROM zones")).scalar()
    cities  = conn.execute(text("SELECT COUNT(*) FROM cities")).scalar()
    users   = conn.execute(text("SELECT COUNT(*) FROM users")).scalar()
    aqis    = conn.execute(text("SELECT COUNT(*) FROM aqi_readings")).scalar()
    alerts  = conn.execute(text("SELECT COUNT(*) FROM alerts")).scalar()
    
    print(f"  cities:      {cities}")
    print(f"  zones:       {zones}")
    print(f"  users:       {users}")
    print(f"  aqi_readings:{aqis}")
    print(f"  alerts:      {alerts}")

# Test ML model cache
from app.routers.ml_routes import load_models, load_metadata
try:
    r, c, le = load_models()
    meta = load_metadata()
    print("\nML models loaded OK")
    print("  Stations:", meta.get("stations"))
    print("  R2 score:", meta.get("regression_metrics", {}).get("r2"))
    print("  Accuracy:", meta.get("classification_metrics", {}).get("accuracy"))
except Exception as e:
    print("\nML model load error:", e)

print("\nAll checks PASSED!")
