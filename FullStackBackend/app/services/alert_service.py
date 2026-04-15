from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException

from app.models.alert import Alert
from app.models.zone import Zone
from app.schemas.alert_schema import AlertCreate


def send_alert(db: Session, payload: AlertCreate) -> Alert:
    zone = db.query(Zone).filter(Zone.id == payload.zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    alert = Alert(**payload.model_dump())
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert


def get_alert_history(db: Session, zone_id: int | None = None, limit: int = 50) -> list[dict]:
    query = db.query(Alert).options(joinedload(Alert.zone))
    if zone_id:
        query = query.filter(Alert.zone_id == zone_id)
    alerts = query.order_by(Alert.created_at.desc()).limit(limit).all()
    return [
        {
            "id":         a.id,
            "zone_id":    a.zone_id,
            "zone_name":  a.zone.zone_name if a.zone else "Unknown",
            "message":    a.message,
            "severity":   a.severity,
            "created_at": a.created_at,
        }
        for a in alerts
    ]
