from typing import Any


def clamp(value: float, minimum: float = 0.0, maximum: float = 1.0) -> float:
    return max(minimum, min(maximum, value))


def normalize(value: float, minimum: float, maximum: float) -> float:
    if maximum <= minimum:
        return 0.0
    return clamp((value - minimum) / (maximum - minimum))


def calculate_risk(
    rainfall: float,
    slope: float,
    elevation: float,
    soil_moisture: float,
    vegetation_loss: float,
) -> dict[str, Any]:

    # Core hazard signals.
    rainfall_score = normalize(rainfall, 0, 300)
    slope_score = normalize(slope, 0, 45)
    moisture_score = normalize(soil_moisture, 0, 100)
    vegetation_score = normalize(vegetation_loss, 0, 100)

    # Elevation is terrain context, not a direct hazard multiplier.
    elevation_context = normalize(elevation, 0, 2500)

    weights = {
        "rainfall": 0.30,
        "slope": 0.30,
        "soil_moisture": 0.25,
        "vegetation_loss": 0.15,
    }

    contributions = {
        "rainfall": rainfall_score * weights["rainfall"],
        "slope": slope_score * weights["slope"],
        "soil_moisture": moisture_score * weights["soil_moisture"],
        "vegetation_loss": vegetation_score * weights["vegetation_loss"],
    }

    risk_score = round(sum(contributions.values()) * 100, 1)

    if risk_score >= 75:
        risk_level = "CRITICAL"
        severity = "Immediate assessment recommended"
        action = "Initiate field verification and prepare early-warning communication."
    elif risk_score >= 50:
        risk_level = "HIGH"
        severity = "Early warning recommended"
        action = "Increase monitoring and prioritize field verification."
    elif risk_score >= 25:
        risk_level = "MODERATE"
        severity = "Enhanced monitoring recommended"
        action = "Continue enhanced monitoring and watch environmental changes."
    else:
        risk_level = "LOW"
        severity = "Normal monitoring"
        action = "Maintain routine monitoring."

    factors = []

    if rainfall_score >= 0.70:
        factors.append({
            "name": "Heavy rainfall",
            "impact": "HIGH",
            "value": f"{rainfall:.0f} mm/day",
            "contribution": round(contributions["rainfall"] * 100, 1),
        })
    elif rainfall_score >= 0.45:
        factors.append({
            "name": "Elevated rainfall",
            "impact": "MEDIUM",
            "value": f"{rainfall:.0f} mm/day",
            "contribution": round(contributions["rainfall"] * 100, 1),
        })

    if slope_score >= 0.70:
        factors.append({
            "name": "Steep terrain",
            "impact": "HIGH",
            "value": f"{slope:.1f}°",
            "contribution": round(contributions["slope"] * 100, 1),
        })
    elif slope_score >= 0.45:
        factors.append({
            "name": "Moderate terrain slope",
            "impact": "MEDIUM",
            "value": f"{slope:.1f}°",
            "contribution": round(contributions["slope"] * 100, 1),
        })

    if moisture_score >= 0.70:
        factors.append({
            "name": "High soil moisture",
            "impact": "HIGH",
            "value": f"{soil_moisture:.0f}%",
            "contribution": round(contributions["soil_moisture"] * 100, 1),
        })
    elif moisture_score >= 0.45:
        factors.append({
            "name": "Elevated soil moisture",
            "impact": "MEDIUM",
            "value": f"{soil_moisture:.0f}%",
            "contribution": round(contributions["soil_moisture"] * 100, 1),
        })

    if vegetation_score >= 0.60:
        factors.append({
            "name": "Vegetation loss",
            "impact": "HIGH",
            "value": f"{vegetation_loss:.0f}%",
            "contribution": round(contributions["vegetation_loss"] * 100, 1),
        })
    elif vegetation_score >= 0.35:
        factors.append({
            "name": "Vegetation disturbance",
            "impact": "MEDIUM",
            "value": f"{vegetation_loss:.0f}%",
            "contribution": round(contributions["vegetation_loss"] * 100, 1),
        })

    if elevation_context >= 0.70:
        factors.append({
            "name": "High-elevation terrain",
            "impact": "CONTEXT",
            "value": f"{elevation:.0f} m",
            "contribution": 0.0,
        })

    factors.sort(
        key=lambda factor: factor["contribution"],
        reverse=True
    )

    if not factors:
        factors.append({
            "name": "No dominant indicator",
            "impact": "LOW",
            "value": "Stable",
            "contribution": 0.0,
        })

    # Prototype confidence based on signal agreement.
    active_signals = sum(
        score >= 0.45
        for score in (
            rainfall_score,
            slope_score,
            moisture_score,
            vegetation_score,
        )
    )

    confidence = round(70 + active_signals * 6, 1)
    confidence = min(confidence, 94.0)

    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "severity": severity,
        "recommended_action": action,
        "confidence": confidence,
        "factors": factors,
        "contributions": {
            "rainfall": round(contributions["rainfall"] * 100, 1),
            "slope": round(contributions["slope"] * 100, 1),
            "soil_moisture": round(contributions["soil_moisture"] * 100, 1),
            "vegetation_loss": round(contributions["vegetation_loss"] * 100, 1),
        },
        "inputs": {
            "rainfall": rainfall,
            "slope": slope,
            "elevation": elevation,
            "soil_moisture": soil_moisture,
            "vegetation_loss": vegetation_loss,
        },
        "system": {
            "engine": "Explainable Landslide Risk Engine",
            "mode": "prototype",
            "model_type": "weighted multi-factor risk scoring",
        },
    }
