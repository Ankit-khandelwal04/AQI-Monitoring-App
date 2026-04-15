from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.user import User
from app.schemas.alert_schema import AlertCreate, AlertResponse
from app.services.alert_service import send_alert, get_alert_history
from app.utils.security import get_current_admin, get_current_user
from app.utils.response import success

router = APIRouter()


@router.post("/send", summary="Send an alert to a zone (admin)")
def create_alert(
    payload: AlertCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    alert = send_alert(db, payload)
    return success(
        {
            "id":         alert.id,
            "zone_id":    alert.zone_id,
            "severity":   alert.severity,
            "created_at": alert.created_at,
        },
        "Alert sent successfully",
    )


@router.get("/history", summary="Get alert history (all users)")
def alert_history(
    zone_id: Optional[int] = Query(None, description="Filter by zone ID"),
    limit:   int = Query(50, ge=1, le=200),
    db:      Session = Depends(get_db),
    _:       User = Depends(get_current_user),
):
    data = get_alert_history(db, zone_id, limit)
    return success({"count": len(data), "alerts": data})
