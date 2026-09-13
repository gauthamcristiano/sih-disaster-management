from typing import Dict, Any


def clamp(
    value: float,
    minimum: float = 0.0,
    maximum: float = 1.0
) -> float:
    return max(minimum, min(maximum, value))


def normalize(
    value: float,
    minimum: float,
    maximum: float
) -> float:

    if maximum <= minimum:
        return 0.0

    return clamp(
        (value - minimum) / (maximum - minimum)
    )


def calculate_risk(
    rainfall: float,
    slope: float,
    elevation: float,
    soil_moisture: float,
    vegetation_loss: float,
) -> Dict[str, Any]:

    rainfall_score = normalize(
        rainfall,
        0,
        300
    )

    slope_score = normalize(
        slope,
        0,
        45
    )

    elevation_score = normalize(
        elevation,
        0,
        2500
    )

    moisture_score = normalize(
        soil_moisture,
        0,
        100
    )

    vegetation_score = normalize(
        vegetation_loss,
        0,
        100
    )

    weighted_score = (
        rainfall_score * 0.30
        + slope_score * 0.25
        + elevation_score * 0.10
        + moisture_score * 0.20
        + vegetation_score * 0.15
    )

    risk_score = round(
        weighted_score * 100,
        1
    )

    if risk_score < 25:
        risk_level = "LOW"
        severity = "Normal monitoring"

    elif risk_score < 50:
        risk_level = "MODERATE"
        severity = "Enhanced monitoring recommended"

    elif risk_score < 75:
        risk_level = "HIGH"
        severity = "Early warning recommended"

    else:
        risk_level = "CRITICAL"
        severity = "Immediate assessment recommended"

    factors = []

    if rainfall_score >= 0.70:

        factors.append({
            "name": "Heavy rainfall",
            "impact": "HIGH",
            "value": f"{rainfall:.0f} mm/day"
        })

    elif rainfall_score >= 0.45:

        factors.append({
            "name": "Elevated rainfall",
            "impact": "MEDIUM",
            "value": f"{rainfall:.0f} mm/day"
        })

    if slope_score >= 0.70:

        factors.append({
            "name": "Steep terrain",
            "impact": "HIGH",
            "value": f"{slope:.1f}°"
        })

    elif slope_score >= 0.45:

        factors.append({
            "name": "Moderate terrain slope",
            "impact": "MEDIUM",
            "value": f"{slope:.1f}°"
        })

    if moisture_score >= 0.70:

        factors.append({
            "name": "High soil moisture",
            "impact": "HIGH",
            "value": f"{soil_moisture:.0f}%"
        })

    elif moisture_score >= 0.45:

        factors.append({
            "name": "Elevated soil moisture",
            "impact": "MEDIUM",
            "value": f"{soil_moisture:.0f}%"
        })

    if vegetation_score >= 0.60:

        factors.append({
            "name": "Vegetation loss",
            "impact": "HIGH",
            "value": f"{vegetation_loss:.0f}%"
        })

    if elevation_score >= 0.70:

        factors.append({
            "name": "High-elevation terrain",
            "impact": "MEDIUM",
            "value": f"{elevation:.0f} m"
        })

    if not factors:

        factors.append({
            "name": "No dominant indicator",
            "impact": "LOW",
            "value": "Stable"
        })

    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "severity": severity,
        "confidence": round(
            72 + min(16, len(factors) * 4),
            1
        ),
        "factors": factors,
        "inputs": {
            "rainfall": rainfall,
            "slope": slope,
            "elevation": elevation,
            "soil_moisture": soil_moisture,
            "vegetation_loss": vegetation_loss,
        }
    }
