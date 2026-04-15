from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.database import Base


class Zone(Base):
    __tablename__ = "zones"

    id              = Column(Integer, primary_key=True, index=True)
    city_id         = Column(Integer, ForeignKey("cities.id", ondelete="CASCADE"), nullable=False, index=True)
    zone_name       = Column(String(150), nullable=False)
    geojson_polygon = Column(JSON, nullable=True)   # GeoJSON Feature object
    created_at      = Column(DateTime(timezone=True), server_default=func.now())

    city         = relationship("City", back_populates="zones")
    aqi_readings = relationship("AQIReading", back_populates="zone", cascade="all, delete-orphan")
    alerts       = relationship("Alert",      back_populates="zone", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Zone id={self.id} name={self.zone_name} city_id={self.city_id}>"
