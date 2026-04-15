from typing import Any


def success(data: Any = None, message: str = "OK") -> dict:
    return {"status": "success", "message": message, "data": data}


def error(message: str, code: int = 400) -> dict:
    return {"status": "error", "message": message, "data": None}


# AQI classification ─────────────────────────────
def classify_aqi(aqi: float) -> dict:
    if aqi <= 50:
        return {"level": "Good",         "color": "#22c55e", "color_code": "green"}
    elif aqi <= 100:
        return {"level": "Satisfactory", "color": "#84cc16", "color_code": "yellow"}
    elif aqi <= 200:
        return {"level": "Moderate",     "color": "#eab308", "color_code": "orange"}
    elif aqi <= 300:
        return {"level": "Poor",         "color": "#f97316", "color_code": "red"}
    else:
        return {"level": "Very Poor",    "color": "#ef4444", "color_code": "purple"}
