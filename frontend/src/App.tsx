import { useState } from "react";
import "./App.css";
import RiskMap from "./components/RiskMap";

type Factor = {
  name: string;
  impact: "HIGH" | "MEDIUM" | "LOW";
  value: string;
};

type RiskResult = {
  risk_score: number;
  risk_level: string;
  severity: string;
  confidence: number;
  factors: Factor[];
};

type Location = {
  name: string;
  state: string;
  rainfall: number;
  slope: number;
  elevation: number;
  moisture: number;
  vegetation: number;
};

const locations: Location[] = [
  {
    name: "Aizawl",
    state: "Mizoram",
    rainfall: 215,
    slope: 36,
    elevation: 1132,
    moisture: 82,
    vegetation: 31,
  },
  {
    name: "Gangtok",
    state: "Sikkim",
    rainfall: 190,
    slope: 38,
    elevation: 1650,
    moisture: 76,
    vegetation: 27,
  },
  {
    name: "Shillong",
    state: "Meghalaya",
    rainfall: 245,
    slope: 29,
    elevation: 1496,
    moisture: 86,
    vegetation: 24,
  },
  {
    name: "Itanagar",
    state: "Arunachal Pradesh",
    rainfall: 225,
    slope: 34,
    elevation: 320,
    moisture: 84,
    vegetation: 36,
  },
];

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function normalize(value: number, min: number, max: number) {
  if (max <= min) return 0;

  return clamp((value - min) / (max - min), 0, 1);
}

function calculateRisk(
  rainfall: number,
  slope: number,
  elevation: number,
  soilMoisture: number,
  vegetationLoss: number
): RiskResult {
  const rainfallScore = normalize(rainfall, 0, 300);
  const slopeScore = normalize(slope, 0, 45);
  const elevationScore = normalize(elevation, 0, 2500);
  const moistureScore = normalize(soilMoisture, 0, 100);
  const vegetationScore = normalize(vegetationLoss, 0, 100);

  const weightedScore =
    rainfallScore * 0.3 +
    slopeScore * 0.25 +
    elevationScore * 0.1 +
    moistureScore * 0.2 +
    vegetationScore * 0.15;

  const riskScore = Number((weightedScore * 100).toFixed(1));

  let riskLevel = "LOW";
  let severity = "Normal monitoring";

  if (riskScore >= 75) {
    riskLevel = "CRITICAL";
    severity = "Immediate assessment recommended";
  } else if (riskScore >= 50) {
    riskLevel = "HIGH";
    severity = "Early warning recommended";
  } else if (riskScore >= 25) {
    riskLevel = "MODERATE";
    severity = "Enhanced monitoring recommended";
  }

  const factors: Factor[] = [];

  if (rainfallScore >= 0.7) {
    factors.push({
      name: "Heavy rainfall",
      impact: "HIGH",
      value: `${rainfall.toFixed(0)} mm/day`,
    });
  } else if (rainfallScore >= 0.45) {
    factors.push({
      name: "Elevated rainfall",
      impact: "MEDIUM",
      value: `${rainfall.toFixed(0)} mm/day`,
    });
  }

  if (slopeScore >= 0.7) {
    factors.push({
      name: "Steep terrain",
      impact: "HIGH",
      value: `${slope.toFixed(1)}°`,
    });
  } else if (slopeScore >= 0.45) {
    factors.push({
      name: "Moderate terrain slope",
      impact: "MEDIUM",
      value: `${slope.toFixed(1)}°`,
    });
  }

  if (moistureScore >= 0.7) {
    factors.push({
      name: "High soil moisture",
      impact: "HIGH",
      value: `${soilMoisture.toFixed(0)}%`,
    });
  } else if (moistureScore >= 0.45) {
    factors.push({
      name: "Elevated soil moisture",
      impact: "MEDIUM",
      value: `${soilMoisture.toFixed(0)}%`,
    });
  }

  if (vegetationScore >= 0.6) {
    factors.push({
      name: "Vegetation loss",
      impact: "HIGH",
      value: `${vegetationLoss.toFixed(0)}%`,
    });
  }

  if (elevationScore >= 0.7) {
    factors.push({
      name: "High-elevation terrain",
      impact: "MEDIUM",
      value: `${elevation.toFixed(0)} m`,
    });
  }

  if (factors.length === 0) {
    factors.push({
      name: "No dominant indicator",
      impact: "LOW",
      value: "Stable",
    });
  }

  const confidence = clamp(72 + factors.length * 4, 72, 92);

  return {
    risk_score: riskScore,
    risk_level: riskLevel,
    severity,
    confidence,
    factors,
  };
}

function App() {
  const [locationIndex, setLocationIndex] = useState(0);

  const location = locations[locationIndex];

  const [rainfall, setRainfall] = useState(location.rainfall);
  const [slope, setSlope] = useState(location.slope);
  const [elevation, setElevation] = useState(location.elevation);
  const [soilMoisture, setSoilMoisture] = useState(location.moisture);
  const [vegetationLoss, setVegetationLoss] = useState(location.vegetation);

  const [result, setResult] = useState<RiskResult | null>(null);
  const [loading, setLoading] = useState(false);

  const selectLocation = (index: number) => {
    const selected = locations[index];

    setLocationIndex(index);
    setRainfall(selected.rainfall);
    setSlope(selected.slope);
    setElevation(selected.elevation);
    setSoilMoisture(selected.moisture);
    setVegetationLoss(selected.vegetation);
    setResult(null);
  };

  const analyseRisk = () => {
    setLoading(true);

    setTimeout(() => {
      const analysis = calculateRisk(
        rainfall,
        slope,
        elevation,
        soilMoisture,
        vegetationLoss
      );

      setResult(analysis);
      setLoading(false);
    }, 900);
  };

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">L</div>

          <div>
            <div className="brand-name">
              LANDSLIDE<span>AI</span>
            </div>

            <div className="brand-subtitle">
              RISK INTELLIGENCE PLATFORM
            </div>
          </div>
        </div>

        <div className="top-status">
          <span className="online-dot" />
          AI ENGINE ONLINE
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-content">
            <div className="hero-label">
              SIH26002 · NORTH EASTERN REGION
            </div>

            <h1>
              See the risk
              <br />
              <span>before the slide.</span>
            </h1>

            <p>
              An AI-assisted landslide risk intelligence platform designed
              to identify environmental conditions associated with elevated
              landslide risk and support earlier decision-making.
            </p>

            <div className="hero-meta">
              <div>
                <span>MONITORING</span>
                <strong>REGIONAL</strong>
              </div>

              <div>
                <span>ENGINE</span>
                <strong>AI RISK v1</strong>
              </div>

              <div>
                <span>STATUS</span>
                <strong>ACTIVE</strong>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="contour contour-1" />
            <div className="contour contour-2" />
            <div className="contour contour-3" />
            <div className="contour contour-4" />

            <div className="mountain-shape">▲</div>

            <div className="coordinate">
              23.1645° N
              <br />
              92.9376° E
            </div>
          </div>
        </section>

        <section className="location-section">
          <div className="section-heading">
            <div>
              <span>01</span>
              <h2>Monitoring Zone</h2>
            </div>

            <p>
              Select a monitored location in the Northeast.
            </p>
          </div>

          <div className="location-grid">
            {locations.map((item, index) => (
              <button
                className={`location-card ${
                  locationIndex === index ? "selected" : ""
                }`}
                key={item.name}
                onClick={() => selectLocation(index)}
              >
                <span className="location-state">
                  {item.state}
                </span>

                <strong>{item.name}</strong>

                <span className="location-arrow">→</span>
              </button>
            ))}
          </div>
        </section>

        <section className="map-section">
          <div className="section-heading">
            <div>
              <span>02</span>
              <h2>Geospatial Risk Intelligence</h2>
            </div>

            <p>
              Regional risk visualization based on monitored
              environmental indicators.
            </p>
          </div>

          <RiskMap
            location={location.name}
            riskScore={result?.risk_score ?? 0}
            riskLevel={result?.risk_level ?? "WAITING"}
          />
        </section>

        <section className="dashboard">
          <div className="panel">
            <div className="panel-heading">
              <div>
                <span>03</span>
                <h2>Environmental Signals</h2>
              </div>

              <small>
                {location.name.toUpperCase()}
              </small>
            </div>

            <Parameter
              label="Rainfall"
              value={`${rainfall} mm/day`}
              min={0}
              max={300}
              number={rainfall}
              onChange={setRainfall}
            />

            <Parameter
              label="Terrain slope"
              value={`${slope}°`}
              min={0}
              max={45}
              number={slope}
              onChange={setSlope}
            />

            <Parameter
              label="Elevation"
              value={`${elevation} m`}
              min={0}
              max={2500}
              number={elevation}
              onChange={setElevation}
            />

            <Parameter
              label="Soil moisture"
              value={`${soilMoisture}%`}
              min={0}
              max={100}
              number={soilMoisture}
              onChange={setSoilMoisture}
            />

            <Parameter
              label="Vegetation loss"
              value={`${vegetationLoss}%`}
              min={0}
              max={100}
              number={vegetationLoss}
              onChange={setVegetationLoss}
            />

            <button
              className="analyse"
              onClick={analyseRisk}
              disabled={loading}
            >
              <span>
                {loading
                  ? "ANALYSING CONDITIONS..."
                  : "RUN RISK ANALYSIS"}
              </span>

              <strong>→</strong>
            </button>
          </div>

          <div className="panel assessment-panel">
            <div className="panel-heading">
              <div>
                <span>04</span>
                <h2>AI Assessment</h2>
              </div>

              <small>LIVE RESULT</small>
            </div>

            {!result ? (
              <div className="waiting">
                <div className="pulse">
                  <div />
                </div>

                <h3>Awaiting analysis</h3>

                <p>
                  Environmental indicators are ready. Run the risk
                  engine to generate an assessment.
                </p>
              </div>
            ) : (
              <div className="assessment">
                <div className="score-row">
                  <div>
                    <span className="score-label">
                      COMPOSITE RISK SCORE
                    </span>

                    <div className="score">
                      {result.risk_score}
                      <small>/100</small>
                    </div>
                  </div>

                  <div
                    className={`risk-badge ${result.risk_level.toLowerCase()}`}
                  >
                    {result.risk_level}
                  </div>
                </div>

                <div className="confidence">
                  <div>
                    <span>MODEL CONFIDENCE</span>

                    <strong>
                      {result.confidence}%
                    </strong>
                  </div>

                  <div className="confidence-bar">
                    <div
                      style={{
                        width: `${result.confidence}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="severity">
                  <span>RECOMMENDATION</span>

                  <strong>
                    {result.severity}
                  </strong>
                </div>

                <div className="factor-title">
                  CONTRIBUTING INDICATORS
                </div>

                <div className="factors">
                  {result.factors.map((factor, index) => (
                    <div
                      className="factor"
                      key={`${factor.name}-${index}`}
                    >
                      <div className="factor-number">
                        {String(index + 1).padStart(2, "0")}
                      </div>

                      <div className="factor-main">
                        <strong>
                          {factor.name}
                        </strong>

                        <span>
                          {factor.value}
                        </span>
                      </div>

                      <div
                        className={`impact ${factor.impact.toLowerCase()}`}
                      >
                        {factor.impact}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="early-warning">
          <div className="warning-icon">!</div>

          <div>
            <span>EARLY WARNING LAYER</span>

            <h2>
              From prediction to preparedness.
            </h2>

            <p>
              The platform is designed to combine rainfall, terrain,
              soil moisture, vegetation and future satellite/geospatial
              data to identify changing risk zones and prioritize
              locations requiring attention.
            </p>
          </div>

          <div className="warning-status">
            <span>DEMO STATUS</span>
            <strong>PHASE 01</strong>
          </div>
        </section>
      </main>

      <footer>
        <span>LANDSLIDE AI · SIH26002</span>

        <span>
          AI · GIS · REMOTE SENSING · EARLY WARNING
        </span>
      </footer>
    </div>
  );
}

type ParameterProps = {
  label: string;
  value: string;
  min: number;
  max: number;
  number: number;
  onChange: (value: number) => void;
};

function Parameter({
  label,
  value,
  min,
  max,
  number,
  onChange,
}: ParameterProps) {
  return (
    <div className="parameter">
      <div className="parameter-top">
        <span>{label}</span>

        <strong>{value}</strong>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        value={number}
        onChange={(event) =>
          onChange(Number(event.target.value))
        }
      />

      <div className="range-labels">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

export default App;
