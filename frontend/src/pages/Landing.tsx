import { useState } from "react";
import { Link } from "react-router-dom";
import "@/styles/landing.css";

// Mismos pesos por defecto que usa el backend (analysis.service.ts)
const FACTORS = [
  { key: "foot", name: "Afluencia", weight: 35, color: "var(--teal)",
    text: "Cuántas personas pasan frente al local en las horas pico." },
  { key: "comp", name: "Competencia", weight: 25, color: "var(--coral)",
    text: "Negocios similares cerca y qué tan fuertes son. Menos presión suma puntos." },
  { key: "demo", name: "Demografía", weight: 25, color: "var(--amber)",
    text: "Edad e ingreso del barrio frente al cliente que buscas." },
  { key: "acc", name: "Accesibilidad", weight: 15, color: "var(--teal-light)",
    text: "Estaciones de transporte y facilidad para llegar." },
] as const;

type FactorKey = (typeof FACTORS)[number]["key"];

const SITES: { id: string; label: string; place: string; x: number; y: number;
  values: Record<FactorKey, number> }[] = [
  { id: "A", label: "A", place: "Esquina con avenida", x: 300, y: 150,
    values: { foot: 88, comp: 52, demo: 80, acc: 90 } },
  { id: "B", label: "B", place: "Frente al parque", x: 130, y: 250,
    values: { foot: 70, comp: 78, demo: 66, acc: 60 } },
  { id: "C", label: "C", place: "Calle residencial", x: 380, y: 300,
    values: { foot: 41, comp: 90, demo: 72, acc: 45 } },
];

const COMPETITORS = [[262,128],[330,182],[318,120],[352,160],[96,230],[168,282],[110,296],[408,262],[352,330],[250,210]];

function score(v: Record<FactorKey, number>) {
  const total = FACTORS.reduce((s, f) => s + f.weight, 0);
  return Math.round(FACTORS.reduce((s, f) => s + v[f.key] * f.weight, 0) / total);
}

function Demo() {
  const [selected, setSelected] = useState("A");
  const site = SITES.find((s) => s.id === selected)!;
  const total = score(site.values);

  return (
    <div className="lp-demo">
      <svg className="lp-map" viewBox="0 0 480 380" role="group"
        aria-label="Plano de ejemplo con tres ubicaciones candidatas">
        {[0,1,2,3].flatMap((r) => [0,1,2,3,4].map((c) => (
          <rect key={`${r}-${c}`} className="lp-block" rx={5}
            x={14 + c * 94} y={14 + r * 92} width={82} height={80} />
        )))}
        <rect className="lp-park" rx={5} x={108} y={198} width={82} height={80} />
        <line className="lp-avenue" x1={-10} y1={330} x2={490} y2={40} />
        {COMPETITORS.map(([x, y]) => <circle key={`${x}-${y}`} className="lp-comp" cx={x} cy={y} r={4} />)}
        <circle className="lp-radius" cx={site.x} cy={site.y} r={64} />
        {SITES.map((s) => (
          <g key={s.id} className="lp-pin" role="button" tabIndex={0}
            aria-pressed={s.id === selected} aria-label={`Ubicación ${s.label}: ${s.place}`}
            transform={`translate(${s.x} ${s.y})`}
            onClick={() => setSelected(s.id)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelected(s.id); } }}>
            <circle r={15} /><text>{s.label}</text>
          </g>
        ))}
      </svg>
      <div className="lp-panel" aria-live="polite">
        <div className="lp-panel-head">
          <h2>{site.label} · {site.place}</h2>
          <div className="lp-score">{total}<small>/100</small></div>
        </div>
        <ul className="lp-factors">
          {FACTORS.map((f) => (
            <li key={f.key}>
              <span>{f.name}</span>
              <span className="track"><span className="fill" style={{ width: `${site.values[f.key]}%` }} /></span>
              <b>{site.values[f.key]}</b>
            </li>
          ))}
        </ul>
        <p className="lp-note">Ejemplo ilustrativo. Los puntos rojos son competidores; el círculo es el radio analizado.</p>
      </div>
    </div>
  );
}

export function Landing() {
  return (
    <div className="lp">
      <div className="lp-wrap">
        <header className="lp-nav">
          <Link to="/" className="lp-logo"><i aria-hidden="true" />Sitial</Link>
          <nav className="lp-nav-links" aria-label="Principal">
            <Link to="/login">Iniciar sesión</Link>
          </nav>
        </header>

        <section className="lp-hero">
          <div className="lp-hero-copy">
            <h1>Abre tu local donde la gente sí va a entrar</h1>
            <p>Sitial compara ubicaciones con datos reales de afluencia, competencia,
              demografía y acceso, y las resume en un puntaje de 0 a 100.</p>
            <div className="lp-cta">
              <Link to="/register" className="lp-btn lp-btn-primary">Crear cuenta gratis</Link>
              <Link to="/login" className="lp-btn lp-btn-ghost">Iniciar sesión</Link>
            </div>
          </div>
          <Demo />
        </section>
      </div>

      <section className="lp-how" aria-labelledby="como">
        <div className="lp-wrap">
          <h2 id="como">Un puntaje, cuatro factores</h2>
          <p>Cada factor se mide de 0 a 100 y se combina según su peso. Los pesos
            que ves son los predeterminados; puedes ajustarlos a tu tipo de negocio.</p>
          <div className="lp-weights" aria-hidden="true">
            {FACTORS.map((f) => <span key={f.key} style={{ flex: f.weight, background: f.color }} />)}
          </div>
          <ul className="lp-weight-list">
            {FACTORS.map((f) => (
              <li key={f.key}>
                <strong><i className="lp-dot" style={{ background: f.color }} />{f.name}<em>{f.weight}%</em></strong>
                <p>{f.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="lp-end">
        <div className="lp-wrap">
          <h2>Compara tus opciones antes de firmar el arriendo</h2>
          <Link to="/register" className="lp-btn lp-btn-primary">Crear cuenta gratis</Link>
        </div>
      </section>
    </div>
  );
}
