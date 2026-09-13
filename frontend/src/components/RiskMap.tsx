type RiskMapProps = {
  location: string;
  riskScore: number;
  riskLevel: string;
};

type Zone = {
  name: string;
  x: number;
  y: number;
  risk: number;
};

const zones: Zone[] = [
  {
    name: "Aizawl",
    x: 67,
    y: 59,
    risk: 78,
  },
  {
    name: "Gangtok",
    x: 31,
    y: 30,
    risk: 72,
  },
  {
    name: "Shillong",
    x: 52,
    y: 44,
    risk: 68,
  },
  {
    name: "Itanagar",
    x: 70,
    y: 25,
    risk: 61,
  },
];

function getRiskClass(risk: number) {
  if (risk >= 75) return "critical";
  if (risk >= 50) return "high";
  if (risk >= 25) return "moderate";
  return "low";
}

function RiskMap({
  location,
  riskScore,
  riskLevel,
}: RiskMapProps) {
  return (
    <div className="risk-map">
      <div className="map-grid" />

      <div className="map-title">
        <span>GEOSPATIAL RISK VIEW</span>
        <strong>NORTH EAST INDIA</strong>
      </div>

      <div className="map-coordinates top-left">
        28°N
      </div>

      <div className="map-coordinates bottom-right">
        88°E
      </div>

      <svg
        className="terrain-map"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path
          className="terrain-line line-one"
          d="M4 67 C18 48, 23 63, 34 43 S55 35, 67 20 S87 28, 98 11"
        />

        <path
          className="terrain-line line-two"
          d="M3 76 C17 58, 27 74, 39 54 S57 44, 69 31 S87 37, 98 19"
        />

        <path
          className="terrain-line line-three"
          d="M5 87 C20 69, 30 84, 42 65 S60 54, 74 42 S88 49, 99 31"
        />

        <path
          className="terrain-line line-four"
          d="M14 94 C27 78, 39 90, 51 72 S68 64, 79 53 S91 58, 99 47"
        />
      </svg>

      {zones.map((zone) => {
        const active =
          zone.name.toLowerCase() ===
          location.toLowerCase();

        const displayRisk = active
          ? riskScore
          : zone.risk;

        return (
          <div
            key={zone.name}
            className={`map-marker ${getRiskClass(
              displayRisk
            )} ${active ? "active" : ""}`}
            style={{
              left: `${zone.x}%`,
              top: `${zone.y}%`,
            }}
          >
            <div className="marker-pulse" />

            <div className="marker-core">
              <span />
            </div>

            <div className="marker-label">
              <strong>{zone.name}</strong>

              <span>
                {active ? riskLevel : `${displayRisk}/100`}
              </span>
            </div>
          </div>
        );
      })}

      <div className="map-scale">
        <span>LOW</span>
        <i className="scale-low" />
        <span>MODERATE</span>
        <i className="scale-medium" />
        <span>HIGH</span>
        <i className="scale-high" />
        <span>CRITICAL</span>
      </div>

      <div className="map-live">
        <span className="live-dot" />
        LIVE MONITORING
      </div>
    </div>
  );
}

export default RiskMap;
