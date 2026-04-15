import enum

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.database import Base


class AlertSeverity(str, enum.Enum):
    info       = "info"
    advisory   = "advisory"
    warning    = "warning"
    emergency  = "emergency"


class Alert(Base):
    __tablename__ = "alerts"

    id         = Column(Integer, primary_key=True, index=True)
    zone_id    = Column(Integer, ForeignKey("zones.id", ondelete="CASCADE"), nullable=False, index=True)
    message    = Column(Text, nullable=False)
    severity   = Column(Enum(AlertSeverity), default=AlertSeverity.advisory, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    zone = relationship("Zone", back_populates="alerts")

    def __repr__(self) -> str:
        return f"<Alert id={self.id} zone_id={self.zone_id} severity={self.severity}>"
