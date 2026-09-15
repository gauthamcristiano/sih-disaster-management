from typing import Any


# ============================================================
# LANDSLIDE AI — EXPLAINABLE RISK ENGINE
# ============================================================
#
# Current mode:
#   Explainable weighted baseline model
#
# Future mode:
#   Replace the baseline prediction layer with a trained
#   ML model using historical NER landslide datasets.
#
# Design principle:
#   Hazard signals drive the score.
#   Terrain context is retained separately.
# ============================================================


def clamp(
    value: float,
    minimum: float = 0.0,
    maximum: float = 1.0,
) -> float:
    """Keep a numeric value inside a defined range."""
    return max(minimum, min(maximum, value))


def normalize(
    value: float,
    minimum: float,
    maximum: float,
) -> float:
    """Normalize a value to a 0–1 range."""
    if maximum <= minimum:
        return 0.0

    return clamp(
        (value - minimum) / (maximum - minimum)
    )


def classify_risk(
    risk_score: float,
) -> tuple[str, str, str]:
    """
    Convert a numeric risk score into:
    risk level, severity and recommended action.
    """

    if risk_score >= 75:
        return (
            "CRITICAL",
            "Immediate assessment recommended",
            (
                "Initiate field verification and prepare "
                "early-warning communication."
            ),
        )

    if risk_score >= 50:
        return (
            "HIGH",
            "Early warning recommended",
            (
                "Increase monitoring and prioritize "
                "field verification."
            ),
        )

    if risk_score >= 25:
        return (
            "MODERATE",
            "Enhanced monitoring recommended",
            (
                "Continue enhanced monitoring and watch "
                "environmental changes."
            ),
        )

    return (
        "LOW",
        "Normal monitoring",
        "Maintain routine monitoring.",
    )


def build_factor(
    name: str,
    impact: str,
    value: str,
    contribution: float,
) -> dict[str, Any]:
    """Create a standardized explainability factor."""

    return {
        "name": name,
        "impact": impact,
        "value": value,
        "contribution": round(contribution, 1),
    }


def calculate_risk(
    rainfall: float,
    slope: float,
    elevation: float,
    soil_moisture: float,
    vegetation_loss: float,
) -> dict[str, Any]:

    # ========================================================
    # 1. FEATURE NORMALIZATION
    # ========================================================

    rainfall_score = normalize(
        rainfall,
        0,
        300,
    )

    slope_score = normalize(
        slope,
        0,
        45,
    )

    moisture_score = normalize(
        soil_moisture,
        0,
        100,
    )

    vegetation_score = normalize(
        vegetation_loss,
        0,
        100,
    )

    # Elevation is deliberately treated as terrain context.
    # It does not directly increase the hazard score.
    elevation_context = normalize(
        elevation,
        0,
        2500,
    )

    # ========================================================
    # 2. BASELINE MODEL
    # ========================================================
    #
    # These weights form the current explainable prototype.
    #
    # Future ML model can consume the same feature vector.
    # ========================================================

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

    risk_score = round(
        sum(contributions.values()) * 100,
        1,
    )

    # ========================================================
    # 3. RISK CLASSIFICATION
    # ========================================================

    risk_level, severity, action = classify_risk(
        risk_score
    )

    # ========================================================
    # 4. EXPLAINABILITY
    # ========================================================

    factors: list[dict[str, Any]] = []

    rainfall_contribution = (
        contributions["rainfall"] * 100
    )

    slope_contribution = (
        contributions["slope"] * 100
    )

    moisture_contribution = (
        contributions["soil_moisture"] * 100
    )

    vegetation_contribution = (
        contributions["vegetation_loss"] * 100
    )

    # Rainfall
    if rainfall_score >= 0.70:
        factors.append(
            build_factor(
                "Heavy rainfall",
                "HIGH",
                f"{rainfall:.0f} mm/day",
                rainfall_contribution,
            )
        )

    elif rainfall_score >= 0.45:
        factors.append(
            build_factor(
                "Elevated rainfall",
                "MEDIUM",
                f"{rainfall:.0f} mm/day",
                rainfall_contribution,
            )
        )

    # Slope
    if slope_score >= 0.70:
        factors.append(
            build_factor(
                "Steep terrain",
                "HIGH",
                f"{slope:.1f}°",
                slope_contribution,
            )
        )

    elif slope_score >= 0.45:
        factors.append(
            build_factor(
                "Moderate terrain slope",
                "MEDIUM",
                f"{slope:.1f}°",
                slope_contribution,
            )
        )

    # Soil moisture
    if moisture_score >= 0.70:
        factors.append(
            build_factor(
                "High soil moisture",
                "HIGH",
                f"{soil_moisture:.0f}%",
                moisture_contribution,
            )
        )

    elif moisture_score >= 0.45:
        factors.append(
            build_factor(
                "Elevated soil moisture",
                "MEDIUM",
                f"{soil_moisture:.0f}%",
                moisture_contribution,
            )
        )

    # Vegetation
    if vegetation_score >= 0.60:
        factors.append(
            build_factor(
                "Vegetation loss",
                "HIGH",
                f"{vegetation_loss:.0f}%",
                vegetation_contribution,
            )
        )

    elif vegetation_score >= 0.35:
        factors.append(
            build_factor(
                "Vegetation disturbance",
                "MEDIUM",
                f"{vegetation_loss:.0f}%",
                vegetation_contribution,
            )
        )

    # Elevation is contextual rather than a hazard contribution.
    if elevation_context >= 0.70:
        factors.append(
            build_factor(
                "High-elevation terrain",
                "CONTEXT",
                f"{elevation:.0f} m",
                0.0,
            )
        )

    factors.sort(
        key=lambda factor: factor["contribution"],
        reverse=True,
    )

    if not factors:
        factors.append(
            build_factor(
                "No dominant indicator",
                "LOW",
                "Stable",
                0.0,
            )
        )

    # ========================================================
    # 5. SIGNAL AGREEMENT
    # ========================================================
    #
    # This is still prototype confidence.
    # It must NOT be described as statistical ML confidence.
    # ========================================================

    signal_scores = [
        rainfall_score,
        slope_score,
        moisture_score,
        vegetation_score,
    ]

    active_signals = sum(
        score >= 0.45
        for score in signal_scores
    )

    confidence = min(
        94.0,
        round(70 + active_signals * 6, 1),
    )

    # ========================================================
    # 6. FEATURE VECTOR
    # ========================================================
    #
    # This gives the future ML layer a clean input structure.
    # ========================================================

    feature_vector = {
        "rainfall": round(rainfall, 2),
        "slope": round(slope, 2),
        "elevation": round(elevation, 2),
        "soil_moisture": round(soil_moisture, 2),
        "vegetation_loss": round(vegetation_loss, 2),
    }

    normalized_features = {
        "rainfall": round(rainfall_score, 4),
        "slope": round(slope_score, 4),
        "elevation_context": round(
            elevation_context,
            4,
        ),
        "soil_moisture": round(
            moisture_score,
            4,
        ),
        "vegetation_loss": round(
            vegetation_score,
            4,
        ),
    }

    # ========================================================
    # 7. MODEL OUTPUT
    # ========================================================

    return {
        "risk_score": risk_score,

        "risk_level": risk_level,

        "severity": severity,

        "recommended_action": action,

        "confidence": confidence,

        "factors": factors,

        "contributions": {
            "rainfall": round(
                rainfall_contribution,
                1,
            ),
            "slope": round(
                slope_contribution,
                1,
            ),
            "soil_moisture": round(
                moisture_contribution,
                1,
            ),
            "vegetation_loss": round(
                vegetation_contribution,
                1,
            ),
        },

        "feature_vector": feature_vector,

        "normalized_features": normalized_features,

        "inputs": {
            "rainfall": rainfall,
            "slope": slope,
            "elevation": elevation,
            "soil_moisture": soil_moisture,
            "vegetation_loss": vegetation_loss,
        },

        "model": {
            "name": "NER Landslide Risk Baseline",
            "type": "explainable weighted multi-factor model",
            "status": "prototype",
            "ml_ready": True,
        },

        "system": {
            "engine": "Explainable Landslide Risk Engine",
            "region": "North Eastern Region",
            "mode": "prototype",
            "prediction_layer": "baseline",
            "future_prediction_layer": "trained ML model",
        },
    }
