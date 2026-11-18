import "@/styles/geo-atmosphere.css";

type GeoAtmosphereVariant = "public" | "login" | "register" | "app";

interface GeoAtmosphereProps {
  variant: GeoAtmosphereVariant;
}

export function GeoAtmosphere({ variant }: GeoAtmosphereProps) {
  return (
    <div className={`geo-atmosphere geo-atmosphere-${variant}`} aria-hidden="true">
      <div className="geo-atmosphere-grid" />
      <div className="geo-atmosphere-orbit geo-atmosphere-orbit-one" />
      <div className="geo-atmosphere-orbit geo-atmosphere-orbit-two" />
      <svg className="geo-atmosphere-route" viewBox="0 0 1200 700" preserveAspectRatio="none">
        <defs>
          <linearGradient id="geo-atmosphere-gradient" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#52bcc6" stopOpacity="0" />
            <stop offset="52%" stopColor="#52bcc6" stopOpacity=".72" />
            <stop offset="100%" stopColor="#a76d9b" stopOpacity=".12" />
          </linearGradient>
        </defs>
        <path d="M-30 560 C180 520 205 325 400 360 S640 490 755 300 950 190 1230 95" />
        <path className="geo-atmosphere-route-secondary" d="M-60 190 C170 245 235 90 420 140 S650 245 830 110 1050 90 1260 25" />
        <path className="geo-atmosphere-route-tertiary" d="M-30 670 C150 590 300 645 455 520 S730 445 895 540 1080 590 1240 455" />
        <circle cx="205" cy="425" r="4" />
        <circle cx="400" cy="360" r="4" />
        <circle cx="755" cy="300" r="4" />
        <circle cx="1010" cy="165" r="4" />
      </svg>
      <div className="geo-atmosphere-particles">
        {Array.from({ length: 10 }, (_, index) => (
          <span className={`geo-atmosphere-particle particle-${index + 1}`} key={index} />
        ))}
      </div>
      <div className="geo-atmosphere-crosshair geo-atmosphere-crosshair-one"><i /><b /></div>
      <div className="geo-atmosphere-crosshair geo-atmosphere-crosshair-two"><i /><b /></div>
      <div className="geo-atmosphere-coordinates">
        <span>GEO / MAP GRID</span>
        <strong>04°39′ N · 74°05′ O</strong>
        <span>SITIAL · SPATIAL NETWORK</span>
      </div>
      <div className="geo-atmosphere-index">CARTOGRAFÍA // 01 — 04</div>
    </div>
  );
}
