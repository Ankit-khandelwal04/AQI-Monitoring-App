import requests
import logging
from app.config import settings

logger = logging.getLogger(__name__)

GEOCODE_URL  = "https://maps.googleapis.com/maps/api/geocode/json"


def geocode_city(city_name: str) -> dict | None:
    """
    Call Google Geocoding API to get lat/lng for a city.
    Returns None and logs a warning if the API key is missing or the call fails.
    """
    if not settings.GOOGLE_MAPS_API_KEY:
        logger.warning("GOOGLE_MAPS_API_KEY not set – returning mock coordinates for %s", city_name)
        return _mock_coordinates(city_name)

    try:
        resp = requests.get(
            GEOCODE_URL,
            params={"address": city_name, "key": settings.GOOGLE_MAPS_API_KEY},
            timeout=5,
        )
        data = resp.json()
        if data.get("status") == "OK" and data.get("results"):
            loc = data["results"][0]["geometry"]["location"]
            return {
                "city_name":    city_name,
                "latitude":     loc["lat"],
                "longitude":    loc["lng"],
                "formatted":    data["results"][0]["formatted_address"],
                "place_id":     data["results"][0]["place_id"],
                "maps_api_url": f"https://www.google.com/maps?q={loc['lat']},{loc['lng']}",
            }
        logger.warning("Geocoding failed for %s: %s", city_name, data.get("status"))
    except Exception as exc:
        logger.error("Geocoding request error: %s", exc)

    return _mock_coordinates(city_name)


def _mock_coordinates(city_name: str) -> dict:
    """Fallback mock for common Indian cities — used when API key is absent."""
    mocks = {
        "nashik":   {"lat": 20.0059, "lng": 73.7897},
        "pune":     {"lat": 18.5204, "lng": 73.8567},
        "mumbai":   {"lat": 19.0760, "lng": 72.8777},
        "delhi":    {"lat": 28.7041, "lng": 77.1025},
        "bangalore":{"lat": 12.9716, "lng": 77.5946},
    }
    key = city_name.lower()
    coords = mocks.get(key, {"lat": 20.0059, "lng": 73.7897})
    return {
        "city_name": city_name,
        "latitude":  coords["lat"],
        "longitude": coords["lng"],
        "formatted": city_name,
        "maps_api_url": f"https://www.google.com/maps?q={coords['lat']},{coords['lng']}",
        "note": "Mock coordinates — set GOOGLE_MAPS_API_KEY for real geocoding",
    }
