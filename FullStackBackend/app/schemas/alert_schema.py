from datetime import datetime
from pydantic import BaseModel
from app.models.alert import AlertSeverity


class AlertCreate(BaseModel):
    zone_id:  int
    message:  str
    severity: AlertSeverity = AlertSeverity.advisory


class AlertResponse(BaseModel):
    id:         int
    zone_id:    int
    zone_name:  str
    message:    str
    severity:   AlertSeverity
    created_at: datetime

    model_config = {"from_attributes": True}
