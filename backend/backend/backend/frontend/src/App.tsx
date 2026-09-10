import { useState } from "react";
import "./App.css";

type RiskResult = {
  risk_score: number;
  risk_level: string;
  factors: string[];
};

function App() {
  const [rainfall, setRainfall] = useState(180);
  const [slope, setSlope] = useState(32);
  const [elevation, setElevation] = useState(1200);
  const [soilMoisture, setSoilMoisture] = useState(78);
  const [vegetationLoss, setVegetationLoss] = useState(35);

  const [result, setResult] = useState<RiskResult | null>(null);
  const [loading, setLoading] = useState(false);

  const predictRisk = async () => {
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/risk", {
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
      });

      const data = await response.json();

      setResult(data);
    } catch (error) {
      console.error(error);
      alert("Unable to connect to the AI risk engine.");
    }

    setLoading(false);
  };

  return (
    <div className="app">

      <header>
        <div>
          <span className="tag">SIH26002</span>
          <h1>Landslide Risk Intelligence</h1>
          <p>
            AI-assisted early warning and risk assessment for vulnerable
            mountainous regions.
          </p>
        </div>

        <div className="status">
          <span></span>
          SYSTEM ONLINE
        </div>
      </header>

      <main>

        <section className="hero-card">
          <div>
            <p className="eyebrow">REGIONAL MONITORING</p>

            <h2>
              Predict risk before
              <br />
              the slope moves.
            </h2>

            <p className="description">
              Combining environmental and terrain indicators to identify
              locations with elevated landslide susceptibility.
            </p>
          </div>

          <div className="mountain">
            🏔️
          </div>
        </section>

        <section className="dashboard">

          <div className="panel">

            <h3>Environmental Inputs</h3>

            <label>
              Rainfall
              <strong>{rainfall} mm/day</strong>
            </label>

            <input
              type="range"
              min="0"
              max="300"
              value={rainfall}
              onChange={(e) => setRainfall(Number(e.target.value))}
            />

            <label>
              Slope
              <strong>{slope}°</strong>
            </label>

            <input
              type="range"
              min="0"
              max="45"
              value={slope}
              onChange={(e) => setSlope(Number(e.target.value))}
            />

            <label>
              Elevation
              <strong>{elevation} m</strong>
            </label>

            <input
              type="range"
              min="0"
              max="2500"
              value={elevation}
              onChange={(e) => setElevation(Number(e.target.value))}
            />

            <label>
              Soil Moisture
              <strong>{soilMoisture}%</strong>
            </label>

            <input
              type="range"
              min="0"
              max="100"
              value={soilMoisture}
              onChange={(e) => setSoilMoisture(Number(e.target.value))}
            />

            <label>
              Vegetation Loss
              <strong>{vegetationLoss}%</strong>
            </label>

            <input
              type="range"
              min="0"
              max="100"
              value={vegetationLoss}
              onChange={(e) => setVegetationLoss(Number(e.target.value))}
            />

            <button onClick={predictRisk}>
              {loading ? "ANALYSING..." : "ANALYSE RISK →"}
            </button>

          </div>

          <div className="panel result-panel">

            <p className="eyebrow">AI ASSESSMENT</p>

            {!result ? (
              <div className="empty">
                <div className="radar">◎</div>
                <h3>Awaiting analysis</h3>
                <p>
                  Adjust environmental conditions and run the risk engine.
                </p>
              </div>
            ) : (
              <>
                <div className="risk-score">
                  <span>{result.risk_score}</span>
                  <small>/100</small>
                </div>

                <div className={`risk ${result.risk_level.toLowerCase()}`}>
                  {result.risk_level} RISK
                </div>

                <h3>Detected factors</h3>

                <div className="factors">
                  {result.factors.map((factor, index) => (
                    <div className="factor" key={index}>
                      <span>●</span>
                      {factor}
                    </div>
                  ))}
                </div>
              </>
            )}

          </div>

        </section>

      </main>

      <footer>
        <span>LANDSLIDE INTELLIGENCE PLATFORM</span>
        <span>EARLY WARNING • RISK ASSESSMENT • RESILIENCE</span>
      </footer>

    </div>
  );
}

export default App;
