import { useState } from "react";
import "./App.css";

type Factor = {
  name: string;
  impact: string;
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
  const [error, setError] = useState("");

  const selectLocation = (index: number) => {
    const selected = locations[index];

    setLocationIndex(index);
    setRainfall(selected.rainfall);
    setSlope(selected.slope);
    setElevation(selected.elevation);
    setSoilMoisture(selected.moisture);
    setVegetationLoss(selected.vegetation);
    setResult(null);
    setError("");
  };

  const analyseRisk = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/risk",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rainfall,
            slope,
            elevation,
            soil_moisture: soilMoisture,
            vegetation_loss: vegetationLoss,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Risk engine unavailable");
      }

      const data: RiskResult = await response.json();

      setResult(data);
    } catch {
      setError(
        "Risk engine unavailable. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
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
              An AI-assisted monitoring platform designed to
              identify environmental conditions associated with
              elevated landslide risk and support earlier
              decision-making.
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

            <div className="mountain-shape">
              ▲
            </div>

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

                <span className="location-arrow">
                  →
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="dashboard">
          <div className="panel">
            <div className="panel-heading">
              <div>
                <span>02</span>
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

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
          </div>

          <div className="panel assessment-panel">
            <div className="panel-heading">
              <div>
                <span>03</span>
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
                  Environmental indicators are ready.
                  Run the risk engine to generate an assessment.
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
                  {result.factors.map(
                    (factor, index) => (
                      <div
                        className="factor"
                        key={index}
                      >
                        <div className="factor-number">
                          {String(index + 1).padStart(
                            2,
                            "0"
                          )}
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
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="early-warning">
          <div className="warning-icon">
            !
          </div>

          <div>
            <span>EARLY WARNING LAYER</span>

            <h2>
              From prediction to preparedness.
            </h2>

            <p>
              The next stage of the platform will combine
              real-time satellite, rainfall and geospatial
              data to automatically identify changing risk
              zones and prioritize locations requiring
              attention.
            </p>
          </div>

          <div className="warning-status">
            <span>DEVELOPMENT STATUS</span>
            <strong>PHASE 01</strong>
          </div>
        </section>
      </main>

      <footer>
        <span>
          LANDSLIDE AI · SIH26002
        </span>

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
