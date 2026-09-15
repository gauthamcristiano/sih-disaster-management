import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CloudRain,
  Gauge,
  Mountain,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Target,
  Waves,
  Wind,
} from "lucide-react";
import RiskMap from "./RiskMap";
import "./App.css";

type RiskLevel = "LOW" | "MODERATE" | "HIGH" | "CRITICAL";

type Factor = {
  name: string;
  impact: string;
  value: string;
  contribution: number;
};

type RiskResult = {
  risk_score: number;
  risk_level: RiskLevel;
  severity: string;
  recommended_action: string;
  confidence: number;
  factors: Factor[];
  contributions: {
    rainfall: number;
    slope: number;
    soil_moisture: number;
    vegetation_loss: number;
  };
};

type Location = {
  name: string;
  state: string;
  rainfall: number;
  slope: number;
  elevation: number;
  soil_moisture: number;
  vegetation_loss: number;
  population: string;
  lat: number;
  lon: number;
};

type Inputs = {
  rainfall: number;
  slope: number;
  elevation: number;
  soilMoisture: number;
  vegetationLoss: number;
};

const API_URL = "http://127.0.0.1:8000";

const locations: Location[] = [
  {
    name: "Aizawl",
    state: "Mizoram",
    rainfall: 184,
    slope: 38,
    elevation: 1132,
    soil_moisture: 76,
    vegetation_loss: 42,
    population: "293K",
    lat: 23.7271,
    lon: 92.7176,
  },
  {
    name: "Gangtok",
    state: "Sikkim",
    rainfall: 142,
    slope: 34,
    elevation: 1650,
    soil_moisture: 68,
    vegetation_loss: 31,
    population: "100K",
    lat: 27.3389,
    lon: 88.6065,
  },
  {
    name: "Shillong",
    state: "Meghalaya",
    rainfall: 128,
    slope: 27,
    elevation: 1496,
    soil_moisture: 61,
    vegetation_loss: 24,
    population: "143K",
    lat: 25.5788,
    lon: 91.8933,
  },
  {
    name: "Itanagar",
    state: "Arunachal Pradesh",
    rainfall: 116,
    slope: 24,
    elevation: 350,
    soil_moisture: 57,
    vegetation_loss: 19,
    population: "59K",
    lat: 27.0844,
    lon: 93.6053,
  },
];

const emptyResult: RiskResult = {
  risk_score: 0,
  risk_level: "LOW",
  severity: "Waiting for analysis",
  recommended_action: "Run an assessment to generate a decision.",
  confidence: 0,
  factors: [],
  contributions: {
    rainfall: 0,
    slope: 0,
    soil_moisture: 0,
    vegetation_loss: 0,
  },
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function normalize(value: number, min: number, max: number) {
  if (max <= min) return 0;
  return clamp((value - min) / (max - min), 0, 1);
}

function calculateLocalRisk(inputs: Inputs): RiskResult {
  const rainfallScore = normalize(inputs.rainfall, 0, 300);
  const slopeScore = normalize(inputs.slope, 0, 45);
  const moistureScore = normalize(inputs.soilMoisture, 0, 100);
  const vegetationScore = normalize(inputs.vegetationLoss, 0, 100);

  const contributions = {
    rainfall: rainfallScore * 30,
    slope: slopeScore * 30,
    soil_moisture: moistureScore * 25,
    vegetation_loss: vegetationScore * 15,
  };

  const riskScore = Number(
    (
      contributions.rainfall +
      contributions.slope +
      contributions.soil_moisture +
      contributions.vegetation_loss
    ).toFixed(1),
  );

  let riskLevel: RiskLevel = "LOW";
  let severity = "Normal monitoring";
  let action = "Maintain routine monitoring.";

  if (riskScore >= 75) {
    riskLevel = "CRITICAL";
    severity = "Immediate assessment recommended";
    action =
      "Initiate field verification and prepare early-warning communication.";
  } else if (riskScore >= 50) {
    riskLevel = "HIGH";
    severity = "Early warning recommended";
    action =
      "Increase monitoring and prioritize field verification.";
  } else if (riskScore >= 25) {
    riskLevel = "MODERATE";
    severity = "Enhanced monitoring recommended";
    action =
      "Continue enhanced monitoring and watch environmental changes.";
  }

  const factors: Factor[] = [];

  if (rainfallScore >= 0.7) {
    factors.push({
      name: "Heavy rainfall",
      impact: "HIGH",
      value: `${Math.round(inputs.rainfall)} mm/day`,
      contribution: Number(contributions.rainfall.toFixed(1)),
    });
  } else if (rainfallScore >= 0.45) {
    factors.push({
      name: "Elevated rainfall",
      impact: "MEDIUM",
      value: `${Math.round(inputs.rainfall)} mm/day`,
      contribution: Number(contributions.rainfall.toFixed(1)),
    });
  }

  if (slopeScore >= 0.7) {
    factors.push({
      name: "Steep terrain",
      impact: "HIGH",
      value: `${inputs.slope.toFixed(1)}°`,
      contribution: Number(contributions.slope.toFixed(1)),
    });
  } else if (slopeScore >= 0.45) {
    factors.push({
      name: "Moderate terrain slope",
      impact: "MEDIUM",
      value: `${inputs.slope.toFixed(1)}°`,
      contribution: Number(contributions.slope.toFixed(1)),
    });
  }

  if (moistureScore >= 0.7) {
    factors.push({
      name: "High soil moisture",
      impact: "HIGH",
      value: `${Math.round(inputs.soilMoisture)}%`,
      contribution: Number(contributions.soil_moisture.toFixed(1)),
    });
  } else if (moistureScore >= 0.45) {
    factors.push({
      name: "Elevated soil moisture",
      impact: "MEDIUM",
      value: `${Math.round(inputs.soilMoisture)}%`,
      contribution: Number(contributions.soil_moisture.toFixed(1)),
    });
  }

  if (vegetationScore >= 0.6) {
    factors.push({
      name: "Vegetation loss",
      impact: "HIGH",
      value: `${Math.round(inputs.vegetationLoss)}%`,
      contribution: Number(contributions.vegetation_loss.toFixed(1)),
    });
  } else if (vegetationScore >= 0.35) {
    factors.push({
      name: "Vegetation disturbance",
      impact: "MEDIUM",
      value: `${Math.round(inputs.vegetationLoss)}%`,
      contribution: Number(contributions.vegetation_loss.toFixed(1)),
    });
  }

  factors.sort((a, b) => b.contribution - a.contribution);

  if (factors.length === 0) {
    factors.push({
      name: "No dominant indicator",
      impact: "LOW",
      value: "Stable",
      contribution: 0,
    });
  }

  const activeSignals = [
    rainfallScore,
    slopeScore,
    moistureScore,
    vegetationScore,
  ].filter((score) => score >= 0.45).length;

  const confidence = Math.min(94, 70 + activeSignals * 6);

  return {
    risk_score: riskScore,
    risk_level: riskLevel,
    severity,
    recommended_action: action,
    confidence,
    factors,
    contributions: {
      rainfall: Number(contributions.rainfall.toFixed(1)),
      slope: Number(contributions.slope.toFixed(1)),
      soil_moisture: Number(contributions.soil_moisture.toFixed(1)),
      vegetation_loss: Number(contributions.vegetation_loss.toFixed(1)),
    },
  };
}

function riskClass(level: RiskLevel) {
  return level.toLowerCase();
}

function App() {
  const [selectedLocation, setSelectedLocation] = useState(locations[0]);

  const [rainfall, setRainfall] = useState(locations[0].rainfall);
  const [slope, setSlope] = useState(locations[0].slope);
  const [elevation, setElevation] = useState(locations[0].elevation);
  const [soilMoisture, setSoilMoisture] = useState(
    locations[0].soil_moisture,
  );
  const [vegetationLoss, setVegetationLoss] = useState(
    locations[0].vegetation_loss,
  );

  const [result, setResult] = useState<RiskResult>(emptyResult);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [engineMode, setEngineMode] = useState<"API" | "LOCAL">("LOCAL");

  const inputs = useMemo<Inputs>(
    () => ({
      rainfall,
      slope,
      elevation,
      soilMoisture,
      vegetationLoss,
    }),
    [
      rainfall,
      slope,
      elevation,
      soilMoisture,
      vegetationLoss,
    ],
  );

  const currentSignals = useMemo(
    () => [
      {
        label: "Rainfall",
        value: rainfall,
        unit: "mm/day",
        icon: CloudRain,
      },
      {
        label: "Slope",
        value: slope,
        unit: "degrees",
        icon: Mountain,
      },
      {
        label: "Soil moisture",
        value: soilMoisture,
        unit: "%",
        icon: Waves,
      },
      {
        label: "Vegetation loss",
        value: vegetationLoss,
        unit: "%",
        icon: Wind,
      },
    ],
    [rainfall, slope, soilMoisture, vegetationLoss],
  );

  function selectLocation(location: Location) {
    setSelectedLocation(location);
    setRainfall(location.rainfall);
    setSlope(location.slope);
    setElevation(location.elevation);
    setSoilMoisture(location.soil_moisture);
    setVegetationLoss(location.vegetation_loss);
    setResult(emptyResult);
    setApiError("");
  }

  async function analyseRisk(customInputs?: Inputs) {
    const analysisInputs = customInputs || inputs;

    setLoading(true);
    setApiError("");

    try {
      const response = await fetch(`${API_URL}/api/risk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rainfall: analysisInputs.rainfall,
          slope: analysisInputs.slope,
          elevation: analysisInputs.elevation,
          soil_moisture: analysisInputs.soilMoisture,
          vegetation_loss: analysisInputs.vegetationLoss,
        }),
      });

      if (!response.ok) {
        throw new Error("Risk engine returned an error.");
      }

      const data = await response.json();

      setResult(data);
      setEngineMode("API");
    } catch {
      const localResult = calculateLocalRisk(analysisInputs);

      setResult(localResult);
      setEngineMode("LOCAL");
      setApiError(
        "Remote risk engine unavailable. Showing the built-in prototype engine.",
      );
    } finally {
      setLoading(false);
    }
  }

  function simulateHeavyRain() {
    const simulatedInputs: Inputs = {
      ...inputs,
      rainfall: Math.min(inputs.rainfall + 75, 500),
      soilMoisture: Math.min(inputs.soilMoisture + 12, 100),
    };

    setRainfall(simulatedInputs.rainfall);
    setSoilMoisture(simulatedInputs.soilMoisture);

    void analyseRisk(simulatedInputs);
  }

  function resetSignals() {
    setRainfall(selectedLocation.rainfall);
    setSlope(selectedLocation.slope);
    setElevation(selectedLocation.elevation);
    setSoilMoisture(selectedLocation.soil_moisture);
    setVegetationLoss(selectedLocation.vegetation_loss);
    setResult(emptyResult);
    setApiError("");
  }

  const topFactor = result.factors[0];

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">
            <Mountain size={22} />
          </div>

          <div>
            <strong>LANDSLIDE AI</strong>
            <span>NER RISK INTELLIGENCE CENTER</span>
          </div>
        </div>

        <div className="system-status">
          <span className="status-dot" />
          PROTOTYPE SYSTEM ONLINE
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">
              NORTH EASTERN REGION / DISASTER INTELLIGENCE
            </p>

            <h1>
              Predict the slope
              <br />
              <em>before it moves.</em>
            </h1>

            <p className="hero-text">
              An explainable landslide risk-intelligence prototype that
              converts environmental signals into a prioritized operational
              decision.
            </p>

            <div className="hero-actions">
              <button
                className="primary-button"
                onClick={() => void analyseRisk()}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <RefreshCw className="spin" size={17} />
                    ANALYZING
                  </>
                ) : (
                  <>
                    RUN RISK ANALYSIS
                    <ArrowUpRight size={17} />
                  </>
                )}
              </button>

              <button
                className="ghost-button"
                onClick={simulateHeavyRain}
                disabled={loading}
              >
                <CloudRain size={17} />
                SIMULATE HEAVY RAIN
              </button>
            </div>
          </div>

          <div className={`hero-risk ${riskClass(result.risk_level)}`}>
            <span>CURRENT MODEL RISK</span>

            <strong>
              {result.risk_score > 0 ? result.risk_score : "--"}
            </strong>

            <small>
              {result.risk_score > 0
                ? result.risk_level
                : "AWAITING ANALYSIS"}
            </small>
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">01 / REGIONAL INTELLIGENCE</p>
              <h2>Monitoring zones</h2>
            </div>

            <span className="section-meta">
              {locations.length} prototype zones monitored
            </span>
          </div>

          <div className="location-grid">
            {locations.map((location) => (
              <button
                key={location.name}
                className={`location-card ${
                  selectedLocation.name === location.name
                    ? "selected"
                    : ""
                }`}
                onClick={() => selectLocation(location)}
              >
                <div>
                  <span>{location.state}</span>
                  <h3>{location.name}</h3>
                </div>

                <div className="location-arrow">
                  <ArrowUpRight size={18} />
                </div>

                <div className="location-data">
                  <span>
                    {location.rainfall}
                    <small> mm/day</small>
                  </span>

                  <span>
                    {location.slope}
                    <small>° slope</small>
                  </span>

                  <span>
                    {location.elevation}
                    <small> m</small>
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="section intelligence-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">02 / GEOSPATIAL INTELLIGENCE</p>
              <h2>Regional risk field</h2>
            </div>

            <span className="section-meta">
              NER / prototype visualization
            </span>
          </div>

          <div className="map-panel">
            <RiskMap
              locations={locations}
              selected={selectedLocation.name}
              riskLevel={result.risk_level}
              onSelect={(name) => {
                const location = locations.find(
                  (item) => item.name === name,
                );

                if (location) {
                  selectLocation(location);
                }
              }}
            />

            <div className="map-side">
              <div className="map-side-header">
                <span>SELECTED ZONE</span>
                <Target size={18} />
              </div>

              <h3>{selectedLocation.name}</h3>
              <p>{selectedLocation.state}</p>

              <div className="map-stat">
                <span>Population context</span>
                <strong>{selectedLocation.population}</strong>
              </div>

              <div className="map-stat">
                <span>Elevation</span>
                <strong>{elevation} m</strong>
              </div>

              <div className="map-stat">
                <span>Coordinates</span>
                <strong>
                  {selectedLocation.lat.toFixed(2)}°N /{" "}
                  {selectedLocation.lon.toFixed(2)}°E
                </strong>
              </div>

              <div className="legend">
                <span>
                  <i className="dot low" /> Low
                </span>

                <span>
                  <i className="dot moderate" /> Moderate
                </span>

                <span>
                  <i className="dot high" /> High
                </span>

                <span>
                  <i className="dot critical" /> Critical
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">03 / ENVIRONMENTAL SIGNALS</p>
              <h2>Analyze the slope</h2>
            </div>

            <SlidersHorizontal size={20} />
          </div>

          <div className="analysis-layout">
            <div className="signals-panel">
              {currentSignals.map((signal) => {
                const Icon = signal.icon;

                const value =
                  signal.label === "Rainfall"
                    ? rainfall
                    : signal.label === "Slope"
                      ? slope
                      : signal.label === "Soil moisture"
                        ? soilMoisture
                        : vegetationLoss;

                const max =
                  signal.label === "Rainfall"
                    ? 300
                    : signal.label === "Slope"
                      ? 45
                      : 100;

                const update =
                  signal.label === "Rainfall"
                    ? setRainfall
                    : signal.label === "Slope"
                      ? setSlope
                      : signal.label === "Soil moisture"
                        ? setSoilMoisture
                        : setVegetationLoss;

                return (
                  <div className="signal" key={signal.label}>
                    <div className="signal-top">
                      <div className="signal-name">
                        <Icon size={18} />
                        <span>{signal.label}</span>
                      </div>

                      <strong>
                        {value}
                        <small> {signal.unit}</small>
                      </strong>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max={max}
                      step="1"
                      value={value}
                      onChange={(event) =>
                        update(Number(event.target.value))
                      }
                    />
                  </div>
                );
              })}

              <div className="analysis-buttons">
                <button
                  className="primary-button full"
                  onClick={() => void analyseRisk()}
                  disabled={loading}
                >
                  <Gauge size={17} />
                  {loading ? "PROCESSING..." : "ANALYZE SIGNALS"}
                </button>

                <button
                  className="reset-button"
                  onClick={resetSignals}
                >
                  RESET
                </button>
              </div>

              <div className="engine-indicator">
                <span>ACTIVE ENGINE</span>
                <strong>
                  {engineMode === "API"
                    ? "REMOTE RISK API"
                    : "LOCAL PROTOTYPE"}
                </strong>
              </div>

              {apiError && (
                <div className="error-box">
                  {apiError}
                </div>
              )}
            </div>

            <div
              className={`result-panel ${riskClass(
                result.risk_level,
              )}`}
            >
              <div className="result-header">
                <span>RISK ASSESSMENT</span>

                {result.risk_level === "CRITICAL" ||
                result.risk_level === "HIGH" ? (
                  <ShieldAlert size={20} />
                ) : (
                  <ShieldCheck size={20} />
                )}
              </div>

              {result.risk_score > 0 ? (
                <>
                  <div className="result-score">
                    <strong>{result.risk_score}</strong>
                    <span>/ 100</span>
                  </div>

                  <div className="risk-badge">
                    {result.risk_level}
                  </div>

                  <p className="result-severity">
                    {result.severity}
                  </p>

                  <div className="confidence">
                    <span>MODEL CONFIDENCE</span>
                    <strong>{result.confidence}%</strong>
                  </div>

                  <div className="factors">
                    <h4>DOMINANT SIGNALS</h4>

                    {result.factors.slice(0, 4).map((factor) => (
                      <div
                        className="factor"
                        key={factor.name}
                      >
                        <div>
                          <span>{factor.name}</span>
                          <small>{factor.value}</small>
                        </div>

                        <b>{factor.impact}</b>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="waiting-state">
                  <Activity size={34} />

                  <h3>Awaiting analysis</h3>

                  <p>
                    Adjust the environmental signals and run
                    the risk engine.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {result.risk_score > 0 && (
          <section className="section decision-section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">
                  04 / DECISION INTELLIGENCE
                </p>

                <h2>From prediction to action</h2>
              </div>
            </div>

            <div className="decision-grid">
              <div className="decision-card">
                <span>PRIMARY DRIVER</span>

                <div className="decision-icon">
                  <AlertTriangle size={20} />
                </div>

                <h3>
                  {topFactor?.name || "No dominant factor"}
                </h3>

                <p>
                  {topFactor
                    ? `${topFactor.impact} impact detected at ${topFactor.value}.`
                    : "No significant environmental driver detected."}
                </p>
              </div>

              <div className="decision-card action-card">
                <span>RECOMMENDED ACTION</span>

                <div className="decision-icon">
                  <Target size={20} />
                </div>

                <h3>Priority response</h3>

                <p>{result.recommended_action}</p>
              </div>

              <div className="decision-card">
                <span>DECISION STATE</span>

                <div className="decision-icon">
                  <ShieldAlert size={20} />
                </div>

                <h3>
                  {result.risk_level === "LOW"
                    ? "Monitor"
                    : result.risk_level === "MODERATE"
                      ? "Prioritize"
                      : result.risk_level === "HIGH"
                        ? "Verify"
                        : "Act"}
                </h3>

                <p>
                  Risk intelligence translated into an
                  operational response level.
                </p>
              </div>
            </div>
          </section>
        )}

        <section className="prototype-note">
          <div>
            <span>DATA STATUS</span>

            <strong>
              Prototype / simulated environmental inputs
            </strong>
          </div>

          <p>
            This demonstration uses simulated inputs. Real
            deployment would integrate meteorological,
            satellite, terrain, geological and historical
            landslide datasets.
          </p>
        </section>
      </main>

      <footer>
        <span>LANDSLIDE AI / NER</span>
        <span>EXPLAINABLE RISK INTELLIGENCE</span>
      </footer>
    </div>
  );
}

export default App;
