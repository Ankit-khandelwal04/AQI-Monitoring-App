from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.database import Base


class AQIReading(Base):
    __tablename__ = "aqi_readings"

    id        = Column(Integer, primary_key=True, index=True)
    zone_id   = Column(Integer, ForeignKey("zones.id", ondelete="CASCADE"), nullable=False, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)

    # Composite AQI
    aqi_value = Column(Float, nullable=False)

    # Pollutant breakdown (µg/m³ unless noted)
    pm25 = Column(Float, nullable=True)   # Fine particulate matter
    pm10 = Column(Float, nullable=True)   # Coarse particulate matter
    no2  = Column(Float, nullable=True)   # Nitrogen dioxide
    so2  = Column(Float, nullable=True)   # Sulphur dioxide
    co   = Column(Float, nullable=True)   # Carbon monoxide (mg/m³)
    o3   = Column(Float, nullable=True)   # Ozone

    zone = relationship("Zone", back_populates="aqi_readings")

    def __repr__(self) -> str:
        return f"<AQIReading id={self.id} zone_id={self.zone_id} aqi={self.aqi_value}>"
