import sys
import os
from logging.config import fileConfig
from pathlib import Path

# ── Ensure project root is on sys.path so `app.*` can be imported ──
# This is needed when Alembic is run from any working directory.
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from sqlalchemy import engine_from_config, pool
from alembic import context

# Import all models so Alembic autogenerate detects schema changes
import app.models  # noqa: F401 — side-effect: registers all ORM models with Base.metadata
from app.database.database import Base
from app.config import settings

# ── Alembic config object ─────────────────────────────────────
config = context.config

# Override sqlalchemy.url with value from .env (via pydantic Settings)
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

# Configure logging from alembic.ini (if present)
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


# ── Offline mode (generates SQL without connecting) ──────────
def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


# ── Online mode (connects and runs migrations directly) ───────
def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,          # detect column type changes
            compare_server_default=True, # detect default value changes
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
