import { useMemo, useState } from "react";
import "./App.css";
import RiskMap from "./components/RiskMap";

type FactorImpact = "HIGH" | "MEDIUM" | "LOW";

type Factor = {
  name: string;
  impact: FactorImpact;
  value: string;
  contribution: number;
};

type RiskResult = {
  risk_score: number;
  risk_level: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
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
  latitude: string;
  longitude: string;
  population: string;
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
    latitude: "23.7271° N",
    longitude: "92.7176° E",
    population: "293K",
  },
  {
    name: "Gangtok",
    state: "Sikkim",
    rainfall: 190,
    slope: 38,
    elevation: 1650,
    moisture: 76,
    vegetation: 27,
    latitude: "27.3389° N",
    longitude: "88.6065° E",
    population: "100K",
  },
  {
    name: "Shillong",
    state: "Meghalaya",
    rainfall: 245,
    slope: 29,
    elevation: 1496,
    moisture: 86,
    vegetation: 24,
    latitude: "25.5788° N",
    longitude: "91.8933° E",
    population: "143K",
  },
  {
    name: "Itanagar",
    state: "Arunachal Pradesh",
    rainfall: 225,
    slope: 34,
    elevation: 320,
    moisture: 84,
    vegetation: 36,
    latitude: "27.0844° N",
    longitude: "93.6053° E",
    population: "59K",
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
  soilMoisture: number,
  vegetationLoss: number,
): RiskResult {
  /*
   * DEMO MODEL
   * This is intentionally presented as a prototype scoring model.
   * A production system would replace these weights with a trained,
   * validated ML model using real geospatial / meteorological datasets.
   */

  const rainfallScore = normalize(rainfall, 0, 300);
  const slopeScore = normalize(slope, 0, 45);
  const moistureScore = normalize(soilMoisture, 0, 100);
  const vegetationScore = normalize(vegetationLoss, 0, 100);

  const rainfallContribution = rainfallScore * 30;
  const slopeContribution = slopeScore * 30;
  const moistureContribution = moistureScore * 25;
  const vegetationContribution = vegetationScore * 15;

  const weightedScore =
    rainfallContribution +
    slopeContribution +
    moistureContribution +
    vegetationContribution;

  const riskScore = Number(clamp(weightedScore, 0, 100).toFixed(1));

  let riskLevel: RiskResult["risk_level"] = "LOW";
  let severity = "Continue routine monitoring.";
  let confidence = 76;

  if (riskScore >= 75) {
    riskLevel = "CRITICAL";
    severity = "Immediate assessment and local warning recommended.";
    confidence = 92;
  } else if (riskScore >= 50) {
    riskLevel = "HIGH";
    severity = "Early warning and field verification recommended.";
    confidence = 88;
  } else if (riskScore >= 25) {
    riskLevel = "MODERATE";
    severity = "Enhanced monitoring recommended.";
    confidence = 82;
  }

  const factors: Factor[] = [];

  if (rainfallScore >= 0.7) {
    factors.push({
      name: "Rainfall loading",
      impact: "HIGH",
      value: `${rainfall.toFixed(0)} mm/day`,
      contribution: Number(rainfallContribution.toFixed(1)),
    });
  } else if (rainfallScore >= 0.45) {
    factors.push({
      name: "Elevated rainfall",
      impact: "MEDIUM",
      value: `${rainfall.toFixed(0)} mm/day`,
      contribution: Number(rainfallContribution.toFixed(1)),
    });
  }

  if (slopeScore >= 0.7) {
    factors.push({
      name: "Steep terrain",
      impact: "HIGH",
      value: `${slope.toFixed(1)}°`,
      contribution: Number(slopeContribution.toFixed(1)),
    });
  } else if (slopeScore >= 0.45) {
    factors.push({
      name: "Terrain slope",
      impact: "MEDIUM",
      value: `${slope.toFixed(1)}°`,
      contribution: Number(slopeContribution.toFixed(1)),
    });
  }

  if (moistureScore >= 0.7) {
    factors.push({
      name: "Soil saturation",
      impact: "HIGH",
      value: `${soilMoisture.toFixed(0)}%`,
      contribution: Number(moistureContribution.toFixed(1)),
    });
  } else if (moistureScore >= 0.45) {
    factors.push({
      name: "Elevated soil moisture",
      impact: "MEDIUM",
      value: `${soilMoisture.toFixed(0)}%`,
      contribution: Number(moistureContribution.toFixed(1)),
    });
  }

  if (vegetationScore >= 0.6) {
    factors.push({
      name: "Vegetation disturbance",
      impact: "HIGH",
      value: `${vegetationLoss.toFixed(0)}% loss`,
      contribution: Number(vegetationContribution.toFixed(1)),
    });
  } else if (vegetationScore >= 0.35) {
    factors.push({
      name: "Vegetation change",
      impact: "MEDIUM",
      value: `${vegetationLoss.toFixed(0)}% loss`,
      contribution: Number(vegetationContribution.toFixed(1)),
    });
  }

  if (factors.length === 0) {
    factors.push({
      name: "No dominant indicator",
      impact: "LOW",
      value: "Stable conditions",
      contribution: Number(weightedScore.toFixed(1)),
    });
  }

  factors.sort((a, b) => b.contribution - a.contribution);

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
  const [result, setResult] = useState<RiskResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [simulationMode, setSimulationMode] = useState(false);

  const location = locations[locationIndex];

  const [rainfall, setRainfall] = useState(location.rainfall);
  const [slope, setSlope] = useState(location.slope);
  const [elevation, setElevation] = useState(location.elevation);
  const [soilMoisture, setSoilMoisture] = useState(location.moisture);
  const [vegetationLoss, setVegetationLoss] = useState(location.vegetation);

  const livePreview = useMemo(
    () =>
      calculateRisk(
        rainfall,
        slope,
        soilMoisture,
        vegetationLoss,
      ),
    [rainfall, slope, soilMoisture, vegetationLoss],
  );

  const selectLocation = (index: number) => {
    const selected = locations[index];

    setLocationIndex(index);
    setRainfall(selected.rainfall);
    setSlope(selected.slope);
    setElevation(selected.elevation);
    setSoilMoisture(selected.moisture);
    setVegetationLoss(selected.vegetation);
    setResult(null);
    setSimulationMode(false);
  };

  const analyseRisk = () => {
    setLoading(true);

    window.setTimeout(() => {
      const analysis = calculateRisk(
        rainfall,
        slope,
        soilMoisture,
        vegetationLoss,
      );

      setResult(analysis);
      setLoading(false);
    }, 850);
  };

  const simulateHeavyRain = () => {
    setSimulationMode(true);
    setLoading(true);

    window.setTimeout(() => {
      const simulatedRainfall = clamp(rainfall + 65, 0, 300);
      const simulatedMoisture = clamp(soilMoisture + 13, 0, 100);

      setRainfall(simulatedRainfall);
      setSoilMoisture(simulatedMoisture);

      const simulatedResult = calculateRisk(
        simulatedRainfall,
        slope,
        simulatedMoisture,
        vegetationLoss,
      );

      setResult(simulatedResult);
      setLoading(false);
    }, 1100);
  };

  const resetSimulation = () => {
    const selected = locations[locationIndex];

    setSimulationMode(false);
    setRainfall(selected.rainfall);
    setSlope(selected.slope);
    setElevation(selected.elevation);
    setSoilMoisture(selected.moisture);
    setVegetationLoss(selected.vegetation);
    setResult(null);
  };

  const activeResult = result ?? livePreview;

  const alertState =
    activeResult.risk_level === "CRITICAL"
      ? "CRITICAL"
      : activeResult.risk_level === "HIGH"
        ? "HIGH"
        : activeResult.risk_level === "MODERATE"
          ? "WATCH"
          : "NORMAL";

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
              NER RISK INTELLIGENCE CENTER
            </div>
          </div>
        </div>

        <div className="top-status">
          <span className="online-dot" />
          INTELLIGENCE ENGINE ONLINE
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="hero">
          <div className="hero-content">
            <div className="hero-label">
              SIH26002 · NORTH EASTERN REGION · PROTOTYPE
            </div>

            <h1>
              See the risk
              <br />
              <span>before the slide.</span>
            </h1>

            <p>
              An AI-assisted landslide risk intelligence platform that
              combines environmental signals into an explainable risk
              assessment for earlier decision-making.
            </p>

            <div className="hero-meta">
              <div>
                <span>MONITORING</span>
                <strong>REGIONAL</strong>
              </div>

              <div>
                <span>ENGINE</span>
                <strong>RISK MODEL v1</strong>
              </div>

              <div>
                <span>MODE</span>
                <strong>
                  {simulationMode ? "SIMULATION" : "ANALYSIS"}
                </strong>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="contour contour-1" />
            <div className="contour contour-2" />
            <div className="contour contour-3" />
            <div className="contour contour-4" />

            <div className="hero-orbit orbit-one" />
            <div className="hero-orbit orbit-two" />

            <div className="mountain-shape">▲</div>

            <div className="hero-signal signal-one">
              <span />
              RAIN
            </div>

            <div className="hero-signal signal-two">
              <span />
              TERRAIN
            </div>

            <div className="hero-signal signal-three">
              <span />
              SOIL
            </div>

            <div className="coordinate">
              {location.latitude}
              <br />
              {location.longitude}
            </div>

            <div className="hero-risk">
              <span>CURRENT MODEL RISK</span>
              <strong>{activeResult.risk_score}</strong>
              <small>/100</small>
            </div>
          </div>
        </section>

        {/* REGIONAL OVERVIEW */}
        <section className="overview-section">
          <div className="overview-heading">
            <div>
              <span>00</span>
              <h2>Regional Intelligence</h2>
            </div>

            <div className="overview-mode">
              <span className="status-dot" />
              PROTOTYPE DATA LAYER
            </div>
          </div>

          <div className="overview-grid">
            <div className="overview-card">
              <span>MONITORED ZONES</span>
              <strong>04</strong>
              <small>Northeast locations</small>
            </div>

            <div className="overview-card">
              <span>ACTIVE WATCH</span>
              <strong>{locations.length}</strong>
              <small>Risk assessment zones</small>
            </div>

            <div className="overview-card">
              <span>SELECTED ZONE</span>
              <strong>{location.name}</strong>
              <small>{location.state}</small>
            </div>

            <div className={`overview-card risk-card ${activeResult.risk_level.toLowerCase()}`}>
              <span>REGIONAL SIGNAL</span>
              <strong>{alertState}</strong>
              <small>{activeResult.risk_score}/100 current model</small>
            </div>
          </div>
        </section>

        {/* LOCATIONS */}
        <section className="location-section">
          <div className="section-heading">
            <div>
              <span>01</span>
              <h2>Monitoring Zones</h2>
            </div>

            <p>
              Select a monitored location in the Northeast.
            </p>
          </div>

          <div className="location-grid">
            {locations.map((item, index) => {
              const preview = calculateRisk(
                item.rainfall,
                item.slope,
                item.moisture,
                item.vegetation,
              );

              return (
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

                  <div className="location-risk">
                    <span>MODEL RISK</span>
                    <b>{preview.risk_score}</b>
                  </div>

                  <span className="location-arrow">→</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* MAP */}
        <section className="map-section">
          <div className="section-heading">
            <div>
              <span>02</span>
              <h2>Geospatial Risk Intelligence</h2>
            </div>

            <p>
              Spatial view of monitored environmental risk signals.
            </p>
          </div>

          <RiskMap
            location={location.name}
            riskScore={activeResult.risk_score}
            riskLevel={activeResult.risk_level}
          />
        </section>

        {/* DASHBOARD */}
        <section className="dashboard">
          <div className="panel">
            <div className="panel-heading">
              <div>
                <span>03</span>
                <h2>Environmental Signals</h2>
              </div>

              <small>{location.name.toUpperCase()}</small>
            </div>

            <div className="signal-summary">
              <div>
                <span>ZONE</span>
                <strong>{location.name}</strong>
              </div>

              <div>
                <span>STATE</span>
                <strong>{location.state}</strong>
              </div>

              <div>
                <span>ELEVATION</span>
                <strong>{elevation} m</strong>
              </div>
            </div>

            <Parameter
              label="Rainfall loading"
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

            <div className="analysis-actions">
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

              <button
                className="simulate"
                onClick={simulateHeavyRain}
                disabled={loading}
              >
                <span>⚠</span>
                SIMULATE HEAVY RAIN
              </button>

              {simulationMode && (
                <button
                  className="reset-simulation"
                  onClick={resetSimulation}
                  disabled={loading}
                >
                  RESET SCENARIO
                </button>
              )}
            </div>
          </div>

          {/* ASSESSMENT */}
          <div className="panel assessment-panel">
            <div className="panel-heading">
              <div>
                <span>04</span>
                <h2>AI Assessment</h2>
              </div>

              <small>
                {simulationMode ? "SIMULATION" : "MODEL OUTPUT"}
              </small>
            </div>

            {!result ? (
              <div className="waiting">
                <div className="pulse">
                  <div />
                </div>

                <h3>Model ready</h3>

                <p>
                  Environmental indicators are loaded for{" "}
                  <strong>{location.name}</strong>. Run an analysis
                  to generate the decision layer.
                </p>

                <div className="waiting-score">
                  <span>PREVIEW SIGNAL</span>
                  <strong>{livePreview.risk_score}/100</strong>
                </div>
              </div>
            ) : (
              <div className="assessment">
                <div className="assessment-banner">
                  <div>
                    <span>
                      {simulationMode
                        ? "SCENARIO RESULT"
                        : "MODEL ASSESSMENT"}
                    </span>

                    <strong>
                      {location.name} · {location.state}
                    </strong>
                  </div>

                  <div className={`alert-state ${result.risk_level.toLowerCase()}`}>
                    {result.risk_level}
                  </div>
                </div>

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

                  <div className={`risk-badge ${result.risk_level.toLowerCase()}`}>
                    {result.risk_level}
                  </div>
                </div>

                <div className="confidence">
                  <div>
                    <span>MODEL CONFIDENCE</span>

                    <strong>{result.confidence}%</strong>
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
                  <span>RECOMMENDED DECISION</span>

                  <strong>{result.severity}</strong>
                </div>

                <div className="factor-title">
                  WHY IS THIS ZONE AT RISK?
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
                        <strong>{factor.name}</strong>

                        <span>
                          {factor.value} · +{factor.contribution}
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

        {/* DECISION LAYER */}
        <section className="decision-section">
          <div className="decision-header">
            <div>
              <span>05</span>
              <h2>Decision Layer</h2>
            </div>

            <small>
              RISK → RESPONSE
            </small>
          </div>

          <div className="decision-grid">
            <div className="decision-card">
              <span>01 · OBSERVE</span>
              <strong>Monitor changing signals</strong>
              <p>
                Track rainfall, terrain slope, soil moisture and
                vegetation conditions.
              </p>
            </div>

            <div className="decision-card">
              <span>02 · PRIORITIZE</span>
              <strong>Rank high-risk zones</strong>
              <p>
                Use the composite risk score to identify areas
                requiring closer attention.
              </p>
            </div>

            <div className="decision-card">
              <span>03 · VERIFY</span>
              <strong>Trigger field assessment</strong>
              <p>
                High-risk outputs can guide field teams toward
                locations requiring verification.
              </p>
            </div>

            <div className={`decision-card action-card ${activeResult.risk_level.toLowerCase()}`}>
              <span>04 · ACT</span>
              <strong>
                {activeResult.risk_level === "CRITICAL"
                  ? "Immediate assessment"
                  : activeResult.risk_level === "HIGH"
                    ? "Early warning recommended"
                    : activeResult.risk_level === "MODERATE"
                      ? "Enhanced monitoring"
                      : "Routine monitoring"}
              </strong>
              <p>{activeResult.severity}</p>
            </div>
          </div>
        </section>

        {/* EARLY WARNING */}
        <section className="early-warning">
          <div className="warning-icon">
            {activeResult.risk_level === "CRITICAL" ? "!" : "↗"}
          </div>

          <div>
            <span>EARLY WARNING LAYER</span>

            <h2>
              From prediction to preparedness.
            </h2>

            <p>
              The prototype demonstrates how multiple environmental
              signals can be transformed into an explainable risk
              assessment and prioritized response recommendation.
              Future production integration can incorporate validated
              satellite, GIS, meteorological and historical landslide
              datasets.
            </p>
          </div>

          <div className="warning-status">
            <span>CURRENT STATE</span>
            <strong>{alertState}</strong>
          </div>
        </section>

        {/* DATA DISCLAIMER */}
        <section className="prototype-note">
          <div className="prototype-note-mark">i</div>

          <div>
            <strong>PROTOTYPE DATA NOTICE</strong>

            <p>
              Current locations and environmental values are
              demonstration inputs for the SIH prototype. They are not
              presented as live government, satellite or weather
              observations.
            </p>
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
