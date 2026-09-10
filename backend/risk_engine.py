import math


def normalize(value, minimum, maximum):
    if maximum == minimum:
        return 0.0

    score = (value - minimum) / (maximum - minimum)
    return max(0.0, min(1.0, score))


def calculate_landslide_risk(
    rainfall,
    slope,
    elevation,
    soil_moisture,
    vegetation_loss
):
    """
    Initial landslide risk model.

    Inputs:
        rainfall       -> mm/day
        slope          -> degrees
        elevation      -> metres
        soil_moisture  -> percentage
        vegetation_loss -> percentage

    Returns:
        risk score, risk level and contributing factors
    """

    rainfall_score = normalize(rainfall, 0, 300)
    slope_score = normalize(slope, 0, 45)
    elevation_score = normalize(elevation, 0, 2500)
    moisture_score = normalize(soil_moisture, 0, 100)
    vegetation_score = normalize(vegetation_loss, 0, 100)

    # Initial weighted model.
    # These weights will later be replaced/refined
    # using trained ML models and real datasets.

    score = (
        rainfall_score * 0.30 +
        slope_score * 0.25 +
        elevation_score * 0.10 +
        moisture_score * 0.20 +
        vegetation_score * 0.15
    )

    risk_score = round(score * 100, 2)

    if risk_score < 25:
        level = "LOW"
    elif risk_score < 50:
        level = "MODERATE"
    elif risk_score < 75:
        level = "HIGH"
    else:
        level = "CRITICAL"

    factors = []

    if rainfall_score >= 0.7:
        factors.append("Heavy rainfall detected")

    if slope_score >= 0.7:
        factors.append("Steep terrain detected")

    if moisture_score >= 0.7:
        factors.append("High soil moisture")

    if vegetation_score >= 0.6:
        factors.append("Significant vegetation loss")

    if elevation_score >= 0.7:
        factors.append("High-elevation terrain")

    if not factors:
        factors.append("No major risk factor detected")

    return {
        "risk_score": risk_score,
        "risk_level": level,
        "factors": factors,
        "inputs": {
            "rainfall": rainfall,
            "slope": slope,
            "elevation": elevation,
            "soil_moisture": soil_moisture,
            "vegetation_loss": vegetation_loss
        }
    }
