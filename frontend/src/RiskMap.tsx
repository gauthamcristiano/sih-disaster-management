import {
  MapPin,
  Navigation,
  Layers3,
  Crosshair,
} from "lucide-react";

type RiskLevel = "LOW" | "MODERATE" | "HIGH" | "CRITICAL";

type Location = {
  name: string;
  state: string;
  lat: number;
  lon: number;
};

type RiskMapProps = {
  locations: Location[];
  selected: string;
  riskLevel: RiskLevel;
  onSelect: (name: string) => void;
};

const positions: Record<string, { left: string; top: string }> = {
  Aizawl: { left: "34%", top: "57%" },
  Gangtok: { left: "57%", top: "22%" },
  Shillong: { left: "64%", top: "43%" },
  Itanagar: { left: "78%", top: "32%" },
};

function levelForLocation(
  name: string,
  selected: string,
  selectedLevel: RiskLevel,
): RiskLevel {
  if (name === selected) return selectedLevel;

  const defaults: Record<string, RiskLevel> = {
    Aizawl: "CRITICAL",
    Gangtok: "HIGH",
    Shillong: "MODERATE",
    Itanagar: "LOW",
  };

  return defaults[name] || "LOW";
}

export default function RiskMap({
  locations,
  selected,
  riskLevel,
  onSelect,
}: RiskMapProps) {
  return (
    <div className="advanced-map">
      <div className="map-toolbar">
        <div className="map-tool active">
          <Layers3 size={15} />
          RISK LAYER
        </div>

        <div className="map-tool">
          <Navigation size={15} />
          TERRAIN
        </div>

        <div className="map-tool">
          <Crosshair size={15} />
          LIVE VIEW
        </div>
      </div>

      <div className="map-grid" />

      <div className="map-ridge ridge-a" />
      <div className="map-ridge ridge-b" />
      <div className="map-ridge ridge-c" />

      <div className="map-region-label">
        NORTH EASTERN
        <br />
        INDIA
      </div>

      {locations.map((location) => {
        const position = positions[location.name] || {
          left: "50%",
          top: "50%",
        };

        const level = levelForLocation(
          location.name,
          selected,
          riskLevel,
        );

        return (
          <button
            key={location.name}
            className={`advanced-marker ${level.toLowerCase()} ${
              selected === location.name ? "selected" : ""
            }`}
            style={position}
            onClick={() => onSelect(location.name)}
            title={`${location.name}, ${location.state}`}
          >
            <span className="marker-pulse" />
            <span className="marker-core">
              <MapPin size={13} />
            </span>

            <span className="marker-name">
              {location.name}
            </span>
          </button>
        );
      })}

      <div className="map-scale">
        <span />
        <span />
        <span />
        <small>REGIONAL SCALE</small>
      </div>

      <div className="map-coordinate">
        20°N — 30°N
        <br />
        88°E — 98°E
      </div>

      <div className="map-status">
        <i />
        SPATIAL RISK FIELD ACTIVE
      </div>
    </div>
  );
}
