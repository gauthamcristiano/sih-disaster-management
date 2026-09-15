import { useState } from "react";
import "./App.css";
import RiskMap from "./components/RiskMap";

type RiskLevel = "LOW" | "MODERATE" | "HIGH" | "CRITICAL";

type Factor = {
  name: string;
  impact: "HIGH" | "MEDIUM" | "LOW";
  value: string;
};

type RiskResult = {
  risk_score: number;
  risk_level: RiskLevel;
  severity: string;
  confidence: number;
  factors: Factor[];
  inputs: {
    rainfall: number;
    slope: number;
    elevation: number;
    soil_moisture: number;
    vegetation_loss: number;
  };
};

type Location = {
  id: number;
  name: string;
  state: string;
  rainfall: number;
  slope: number;
  elevation: number;
  moisture: number;
  vegetation: number;
  latitude: number;
  longitude: number;
};

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const locations: Location[] = [
  {
    id: 1,
    name: "Aizawl",
    state: "Mizoram",
    rainfall: 228,
    slope: 38,
    elevation: 1132,
    moisture: 76,
    vegetation: 32,
    latitude: 23.7271,
    longitude: 92.7176,
  },
  {
    id: 2,
    name: "Gangtok",
    state: "Sikkim",
    rainfall: 185,
    slope: 34,
    elevation: 1650,
    moisture: 68,
    vegetation: 24,
    latitude: 27.3389,
    longitude: 88.6065,
  },
  {
    id: 3,
    name: "Shillong",
    state: "Meghalaya",
    rainfall: 205,
    slope: 29,
    elevation: 1496,
    moisture: 72,
    vegetation: 27,
    latitude: 25.5788,
    longitude: 91.8933,
  },
  {
    id: 4,
    name: "Itanagar",
    state: "Arunachal Pradesh",
    rainfall: 240,
    slope: 36,
    elevation: 750,
    moisture: 81,
    vegetation: 35,
    latitude: 27.0844,
    longitude: 93.6053,
  },
];

const emptyResult: RiskResult = {
  risk_score: 0,
  risk_level: "LOW",
  severity: "Waiting for analysis",
  confidence: 0,
  factors: [],
  inputs: {
    rainfall: 0,
    slope: 0,
    elevation: 0,
    soil_moisture: 0,
    vegetation_loss: 0,
  },
};

function App() {
  const [selectedLocation, setSelectedLocation] =
    useState<Location>(locations[0]);

  const [rainfall, setRainfall] = useState(
    locations[0].rainfall,
  );

  const [slope, setSlope] = useState(
    locations[0].slope,
  );

  const [elevation, setElevation] = useState(
    locations[0].elevation,
  );

  const [soilMoisture, setSoilMoisture] = useState(
    locations[0].moisture,
  );

  const [vegetationLoss, setVegetationLoss] = useState(
    locations[0].vegetation,
  );

  const [result, setResult] =
    useState<RiskResult>(emptyResult);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [simulationActive, setSimulationActive] =
    useState(false);

  async function runRiskAnalysis(
    rainfallValue = rainfall,
    soilMoistureValue = soilMoisture,
    isSimulation = false,
  ) {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/risk`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rainfall: rainfallValue,
            slope: slope,
            elevation: elevation,
            soil_moisture: soilMoistureValue,
            vegetation_loss: vegetationLoss,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          `Risk engine returned ${response.status}`,
        );
      }

      const data: RiskResult =
        await response.json();

      setResult(data);
      setSimulationActive(isSimulation);
    } catch (err) {
      console.error(err);

      setError(
        "Could not connect to the Python risk engine. Make sure FastAPI is running on port 8000.",
      );
    } finally {
      setLoading(false);
    }
  }

  function selectLocation(location: Location) {
    setSelectedLocation(location);

    setRainfall(location.rainfall);
    setSlope(location.slope);
    setElevation(location.elevation);
    setSoilMoisture(location.moisture);
    setVegetationLoss(location.vegetation);

    setResult(emptyResult);
    setSimulationActive(false);
    setError("");
  }

  function simulateHeavyRain() {
    const newRainfall = Math.min(
      rainfall + 65,
      500,
    );

    const newMoisture = Math.min(
      soilMoisture + 13,
      100,
    );

    setRainfall(newRainfall);
    setSoilMoisture(newMoisture);

    runRiskAnalysis(
      newRainfall,
      newMoisture,
      true,
    );
  }

  function resetSimulation() {
    setRainfall(selectedLocation.rainfall);
    setSlope(selectedLocation.slope);
    setElevation(selectedLocation.elevation);
    setSoilMoisture(selectedLocation.moisture);
    setVegetationLoss(
      selectedLocation.vegetation,
    );

    setResult(emptyResult);
    setSimulationActive(false);
    setError("");
  }

  const riskClass =
    result.risk_level.toLowerCase();

  return (
    <div className="app">

      {/* HEADER */}

      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">
            L
          </div>

          <div>
            <div className="brand-name">
              LANDSLIDE AI
            </div>

            <div className="brand-subtitle">
              NER RISK INTELLIGENCE CENTER
            </div>
          </div>
        </div>

        <div className="system-status">
          <span className="status-dot" />
          AI ENGINE ONLINE
        </div>
      </header>

      <main>

        {/* HERO */}

        <section className="hero">
          <div className="hero-copy">

            <div className="eyebrow">
              SIH26002 · NORTH EASTERN REGION
            </div>

            <h1>
              See the risk
              <br />
              <span>before the slide.</span>
            </h1>

            <p>
              AI-assisted landslide risk intelligence
              combining environmental signals, terrain
              conditions and explainable risk assessment.
            </p>

            <div className="hero-actions">

              <button
                className="primary-button"
                onClick={() =>
                  runRiskAnalysis()
                }
                disabled={loading}
              >
                {loading
                  ? "ANALYZING..."
                  : "RUN RISK ANALYSIS"}
              </button>

              <div className="hero-location">
                <span>MONITORING</span>

                <strong>
                  {selectedLocation.name}
                </strong>

                <small>
                  {selectedLocation.state}
                </small>
              </div>

            </div>
          </div>

          <div className="hero-risk">

            <div className="hero-risk-label">
              CURRENT MODEL RISK
            </div>

            <div
              className={`hero-risk-score ${riskClass}`}
            >
              {result.risk_score.toFixed(1)}
            </div>

            <div
              className={`hero-risk-level ${riskClass}`}
            >
              {result.risk_level}
            </div>

            <div className="hero-risk-caption">
              {loading
                ? "Processing environmental signals"
                : result.severity}
            </div>

          </div>
        </section>

        {/* ERROR */}

        {error && (
          <div className="error-banner">
            <div>
              <strong>
                RISK ENGINE CONNECTION ERROR
              </strong>

              <span>{error}</span>
            </div>

            <button
              onClick={() =>
                runRiskAnalysis()
              }
            >
              RETRY
            </button>
          </div>
        )}

        {/* OVERVIEW */}

        <section className="overview-section">

          <div className="section-heading">

            <div>
              <span className="section-kicker">
                01 · REGIONAL INTELLIGENCE
              </span>

              <h2>
                The slope gives signals.
              </h2>
            </div>

            <p>
              Environmental indicators are converted
              into interpretable risk intelligence for
              rapid decision-making.
            </p>

          </div>

          <div className="overview-grid">

            <div className="overview-card">
              <span>MONITORING ZONES</span>
              <strong>
                {locations.length}
              </strong>
              <small>
                Priority locations
              </small>
            </div>

            <div className="overview-card">
              <span>ACTIVE LOCATION</span>

              <strong>
                {selectedLocation.name}
              </strong>

              <small>
                {selectedLocation.state}
              </small>
            </div>

            <div className="overview-card">
              <span>RISK STATUS</span>

              <strong className={riskClass}>
                {result.risk_level}
              </strong>

              <small>
                Score {result.risk_score.toFixed(1)} / 100
              </small>
            </div>

            <div className="overview-card">
              <span>MODEL CONFIDENCE</span>

              <strong>
                {result.confidence > 0
                  ? `${result.confidence}%`
                  : "—"}
              </strong>

              <small>
                Prototype engine output
              </small>
            </div>

          </div>
        </section>

        {/* LOCATIONS */}

        <section className="location-section">

          <div className="section-heading">

            <div>
              <span className="section-kicker">
                02 · MONITORING ZONES
              </span>

              <h2>
                One region. Multiple risk surfaces.
              </h2>
            </div>

            <p>
              Select a monitored location to load its
              environmental conditions.
            </p>

          </div>

          <div className="location-grid">

            {locations.map((location) => (

              <button
                key={location.id}
                className={`location-card ${
                  selectedLocation.id ===
                  location.id
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  selectLocation(location)
                }
              >

                <div className="location-number">
                  0{location.id}
                </div>

                <div className="location-info">
                  <strong>
                    {location.name}
                  </strong>

                  <span>
                    {location.state}
                  </span>
                </div>

                <div className="location-meta">
                  <span>
                    {location.rainfall} mm
                  </span>

                  <small>
                    rainfall
                  </small>
                </div>

              </button>

            ))}

          </div>
        </section>

        {/* MAP */}

        <section className="map-section">

          <div className="section-heading">

            <div>
              <span className="section-kicker">
                03 · GEOSPATIAL INTELLIGENCE
              </span>

              <h2>
                One map. One score. One decision.
              </h2>
            </div>

            <p>
              Spatial monitoring layer for high-risk
              terrain.
            </p>

          </div>

          <div className="risk-map">
            <RiskMap
              location={selectedLocation.name}
              riskScore={result.risk_score}
              riskLevel={result.risk_level}
            />
          </div>

        </section>

        {/* ENVIRONMENTAL SIGNALS */}

        <section className="dashboard">

          <div className="panel">

            <div className="panel-header">

              <div>
                <span className="section-kicker">
                  04 · ENVIRONMENTAL SIGNALS
                </span>

                <h2>
                  Observe the slope.
                </h2>
              </div>

              <span className="panel-status">
                INPUT STREAM
              </span>

            </div>

            <div className="signal-summary">

              <div>
                <span>LOCATION</span>

                <strong>
                  {selectedLocation.name}
                </strong>
              </div>

              <div>
                <span>LAT / LONG</span>

                <strong>
                  {selectedLocation.latitude.toFixed(3)}
                  {" / "}
                  {selectedLocation.longitude.toFixed(3)}
                </strong>
              </div>

              <div>
                <span>ELEVATION</span>

                <strong>
                  {elevation} m
                </strong>
              </div>

            </div>

            <div className="parameters">

              {/* RAINFALL */}

              <div className="parameter">

                <div className="parameter-header">
                  <label>Rainfall</label>

                  <strong>
                    {rainfall} mm/day
                  </strong>
                </div>

                <input
                  type="range"
                  min="0"
                  max="500"
                  value={rainfall}
                  onChange={(event) =>
                    setRainfall(
                      Number(event.target.value),
                    )
                  }
                />

                <div className="range-labels">
                  <span>0</span>
                  <span>500 mm</span>
                </div>

              </div>

              {/* SLOPE */}

              <div className="parameter">

                <div className="parameter-header">
                  <label>
                    Terrain slope
                  </label>

                  <strong>
                    {slope}°
                  </strong>
                </div>

                <input
                  type="range"
                  min="0"
                  max="90"
                  value={slope}
                  onChange={(event) =>
                    setSlope(
                      Number(event.target.value),
                    )
                  }
                />

                <div className="range-labels">
                  <span>0°</span>
                  <span>90°</span>
                </div>

              </div>

              {/* SOIL MOISTURE */}

              <div className="parameter">

                <div className="parameter-header">
                  <label>
                    Soil moisture
                  </label>

                  <strong>
                    {soilMoisture}%
                  </strong>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={soilMoisture}
                  onChange={(event) =>
                    setSoilMoisture(
                      Number(event.target.value),
                    )
                  }
                />

                <div className="range-labels">
                  <span>Dry</span>
                  <span>Saturated</span>
                </div>

              </div>

              {/* VEGETATION */}

              <div className="parameter">

                <div className="parameter-header">
                  <label>
                    Vegetation loss
                  </label>

                  <strong>
                    {vegetationLoss}%
                  </strong>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={vegetationLoss}
                  onChange={(event) =>
                    setVegetationLoss(
                      Number(event.target.value),
                    )
                  }
                />

                <div className="range-labels">
                  <span>0%</span>
                  <span>100%</span>
                </div>

              </div>

              {/* ELEVATION */}

              <div className="parameter">

                <div className="parameter-header">
                  <label>
                    Elevation
                  </label>

                  <strong>
                    {elevation} m
                  </strong>
                </div>

                <input
                  type="range"
                  min="0"
                  max="5000"
                  value={elevation}
                  onChange={(event) =>
                    setElevation(
                      Number(event.target.value),
                    )
                  }
                />

                <div className="range-labels">
                  <span>0 m</span>
                  <span>5000 m</span>
                </div>

                <small className="parameter-note">
                  Terrain context — not directly weighted
                  in the prototype risk score.
                </small>

              </div>

            </div>

            {/* ACTIONS */}

            <div className="analysis-actions">

              <button
                className="analyse"
                onClick={() =>
                  runRiskAnalysis()
                }
                disabled={loading}
              >
                <span>
                  {loading
                    ? "PROCESSING RISK ENGINE"
                    : "RUN RISK ANALYSIS"}
                </span>

                <span>→</span>
              </button>

              <button
                className="simulate"
                onClick={simulateHeavyRain}
                disabled={loading}
              >
                SIMULATE HEAVY RAIN
              </button>

              {simulationActive && (
                <button
                  className="reset-simulation"
                  onClick={resetSimulation}
                  disabled={loading}
                >
                  RESET
                </button>
              )}

            </div>

            {simulationActive && (
              <div className="simulation-banner">

                <strong>
                  SCENARIO SIMULATION ACTIVE
                </strong>

                <span>
                  Heavy rainfall scenario is being
                  evaluated through the Python risk engine.
                </span>

              </div>
            )}

          </div>

          {/* ASSESSMENT */}

          <div className="panel assessment-panel">

            <div className="panel-header">

              <div>
                <span className="section-kicker">
                  05 · AI ASSESSMENT
                </span>

                <h2>
                  Explain the risk.
                </h2>
              </div>

            </div>

            {loading ? (

              <div className="waiting">

                <div className="loader-ring" />

                <strong>
                  ANALYZING ENVIRONMENTAL SIGNALS
                </strong>

                <span>
                  Sending data to Python risk engine...
                </span>

              </div>

            ) : result.confidence === 0 ? (

              <div className="waiting">

                <div className="waiting-mark">
                  —
                </div>

                <strong>
                  ANALYSIS REQUIRED
                </strong>

                <span>
                  Run the risk engine to generate an
                  assessment.
                </span>

              </div>

            ) : (

              <div className="assessment">

                <div className="assessment-top">

                  <div>

                    <span className="assessment-label">
                      RISK SCORE
                    </span>

                    <div
                      className={`score ${riskClass}`}
                    >
                      {result.risk_score.toFixed(1)}

                      <small>
                        /100
                      </small>
                    </div>

                  </div>

                  <div className="confidence">

                    <span>
                      CONFIDENCE
                    </span>

                    <strong>
                      {result.confidence}%
                    </strong>

                  </div>

                </div>

                <div
                  className={`severity ${riskClass}`}
                >

                  <span>
                    ASSESSMENT
                  </span>

                  <strong>
                    {result.severity}
                  </strong>

                </div>

                <div className="factor-heading">

                  <span>
                    CONTRIBUTING FACTORS
                  </span>

                  <small>
                    Python risk engine output
                  </small>

                </div>

                <div className="factors">

                  {result.factors.map(
                    (factor, index) => (

                      <div
                        className="factor"
                        key={`${factor.name}-${index}`}
                      >

                        <div className="factor-main">

                          <span className="factor-index">
                            {String(index + 1).padStart(
                              2,
                              "0",
                            )}
                          </span>

                          <div>

                            <strong>
                              {factor.name}
                            </strong>

                            <small>
                              {factor.value}
                            </small>

                          </div>

                        </div>

                        <span
                          className={`impact ${factor.impact.toLowerCase()}`}
                        >
                          {factor.impact}
                        </span>

                      </div>

                    ),
                  )}

                </div>

              </div>

            )}

          </div>

        </section>

        {/* DECISION LAYER */}

        <section className="decision-section">

          <div className="section-heading">

            <div>
              <span className="section-kicker">
                06 · DECISION LAYER
              </span>

              <h2>
                Not another dashboard.
              </h2>
            </div>

            <p>
              Risk intelligence should lead to an action,
              not just another number.
            </p>

          </div>

          <div className="decision-grid">

            <div className="decision-card">
              <span className="decision-number">
                01
              </span>

              <strong>OBSERVE</strong>

              <p>
                Monitor rainfall, terrain slope, soil
                moisture and vegetation conditions.
              </p>
            </div>

            <div className="decision-card">
              <span className="decision-number">
                02
              </span>

              <strong>PRIORITIZE</strong>

              <p>
                Rank locations according to their current
                modeled landslide risk.
              </p>
            </div>

            <div className="decision-card">
              <span className="decision-number">
                03
              </span>

              <strong>VERIFY</strong>

              <p>
                Direct field teams toward areas showing
                stronger environmental warning signals.
              </p>
            </div>

            <div className="decision-card">
              <span className="decision-number">
                04
              </span>

              <strong>ACT</strong>

              <p>
                Escalate monitoring or initiate early-warning
                procedures when thresholds are exceeded.
              </p>
            </div>

          </div>
        </section>

        {/* EARLY WARNING */}

        <section className="early-warning">

          <div className="warning-content">

            <span className="section-kicker">
              EARLY WARNING PROTOCOL
            </span>

            <h2>
              From signal
              <br />
              to response.
            </h2>

            <p>
              When environmental conditions converge,
              the system highlights the location for
              enhanced monitoring and response.
            </p>

          </div>

          <div className="warning-status">

            <span className="warning-status-label">
              CURRENT STATUS
            </span>

            <strong className={riskClass}>
              {result.risk_level}
            </strong>

            <span>
              {result.severity}
            </span>

          </div>

        </section>

        {/* PROTOTYPE NOTICE */}

        <section className="prototype-note">

          <div>

            <span className="section-kicker">
              PROTOTYPE DATA NOTICE
            </span>

            <strong>
              Environmental values currently represent
              demonstration inputs.
            </strong>

            <p>
              The production system can integrate satellite
              imagery, GIS layers, meteorological feeds,
              remote-sensing indicators and field observations
              to generate operational risk intelligence.
            </p>

          </div>

          <div className="prototype-tag">
            SIH26002
          </div>

        </section>

      </main>

      {/* FOOTER */}

      <footer>

        <div>
          <strong>
            LANDSLIDE AI
          </strong>

          <span>
            NER RISK INTELLIGENCE CENTER
          </span>
        </div>

        <span>
          AI-assisted landslide risk monitoring · SIH26002
        </span>

      </footer>

    </div>
  );
}

export default App;
