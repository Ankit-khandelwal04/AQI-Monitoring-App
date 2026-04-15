from typing import Any


def make_zone_feature(zone, aqi_value: float | None = None, classification: dict | None = None) -> dict:
    """Build a GeoJSON Feature from a Zone ORM object."""
    properties: dict[str, Any] = {
        "zone_id":   zone.id,
        "zone_name": zone.zone_name,
        "city_id":   zone.city_id,
    }
    if aqi_value is not None:
        properties["aqi_value"] = aqi_value
    if classification is not None:
        properties.update(classification)

    # Use stored polygon or generate a placeholder
    geometry = None
    if zone.geojson_polygon:
        raw = zone.geojson_polygon
        # Accept both raw Geometry dict and Feature dict
        if raw.get("type") == "Feature":
            geometry = raw.get("geometry")
        else:
            geometry = raw

    return {
        "type":       "Feature",
        "properties": properties,
        "geometry":   geometry,
    }


def build_feature_collection(features: list[dict]) -> dict:
    return {"type": "FeatureCollection", "features": features}


def validate_geojson_polygon(geojson: Any) -> bool:
    """Basic GeoJSON polygon validation."""
    if not isinstance(geojson, dict):
        return False
    geo_type = geojson.get("type")
    if geo_type == "Feature":
        return validate_geojson_polygon(geojson.get("geometry", {}))
    if geo_type not in ("Polygon", "MultiPolygon"):
        return False
    return "coordinates" in geojson
