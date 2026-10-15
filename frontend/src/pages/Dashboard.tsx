import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { api, ApiError } from "@/lib/api";
import type { AnalysisResult, BusinessType, Coordinates, ScoreWeights, ThreatLevel, Verdict } from "@/types";
import { Icon } from "@/components/dashboard/Icon";
import { MapView, type Layers } from "@/components/dashboard/MapView";
import { fmtLat, fmtLng } from "@/components/dashboard/geo";
import "@/styles/dashboard.css";

const BUSINESS_TYPES: { value: BusinessType; label: string }[] = [
  { value: "cafe", label: "Cafetería" },
  { value: "restaurant", label: "Restaurante" },
  { value: "bakery", label: "Panadería" },
  { value: "pharmacy", label: "Farmacia" },
  { value: "gym", label: "Gimnasio" },
  { value: "supermarket", label: "Supermercado" },
];

const DEFAULT_COORDS: Coordinates = { lat: 4.6768, lng: -74.0483 };
const RADIUS = 800;
const DEFAULT_WEIGHTS: ScoreWeights = { footTraffic: 35, competition: 25, demographics: 25, accessibility: 15 };

const VERDICT: Record<Verdict, string> = { optimal: "Óptimo", review: "Revisar", discard: "Descartar" };
const VERDICT_DESC: Record<Verdict, string> = {
  optimal: "La zona cumple bien con los cuatro factores.",
  review: "Hay factores débiles. Revisa las métricas antes de decidir.",
  discard: "La zona no alcanza el puntaje mínimo para este negocio.",
};
const THREAT: Record<ThreatLevel, { tag: string; label: string; cls: string }> = {
  high: { tag: "r", label: "ALTA", cls: "r" },
  medium: { tag: "a", label: "MEDIA", cls: "a" },
  low: { tag: "g", label: "BAJA", cls: "" },
};

function metricClass(name: string) {
  const n = name.toLowerCase();
  if (n.startsWith("compet")) return "r";
  if (n.startsWith("demog")) return "g";
  if (n.startsWith("acces")) return "a";
  return "c";
}

const fmtNum = (n: number) => n.toLocaleString("es-CO");

function ScoreRing({ value }: { value: number }) {
  const r = 30, circ = 2 * Math.PI * r;
  return (
    <div className="gp-ring">
      <svg viewBox="0 0 72 72" aria-hidden="true">
        <circle cx="36" cy="36" r={r} fill="none" stroke="var(--bg-hover)" strokeWidth="6" />
        <circle cx="36" cy="36" r={r} fill="none" stroke="var(--teal)" strokeWidth="6" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - value / 100)} />
      </svg>
      <div className="val">{value}<span>/100</span></div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <section className={`gp-rp ${open ? "" : "collapsed"}`}>
      <button type="button" className="gp-rp-head" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span>{title}</span><span className="chev" aria-hidden="true">▾</span>
      </button>
      {open && <div className="gp-rp-body">{children}</div>}
    </section>
  );
}

export function Dashboard() {
  const { user, logout } = useAuth();
  const [businessType, setBusinessType] = useState<BusinessType>("cafe");
  const [label, setLabel] = useState("Zona Rosa · Chapinero");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(15);
  const [layers, setLayers] = useState<Layers>({ heat: true, iso: true, comp: true, labels: true, roads: true, parks: true });
  const toggleLayer = useCallback((k: keyof Layers) => setLayers((l) => ({ ...l, [k]: !l[k] })), []);

  async function handleAnalyze() {
    setError(""); setLoading(true);
    try {
      const r = await api.analysis.create({
        coordinates: DEFAULT_COORDS, businessType, radiusMeters: RADIUS, weights: DEFAULT_WEIGHTS, label,
      });
      setResult(r); setSelectedId(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo completar el análisis. Intenta de nuevo.");
    } finally { setLoading(false); }
  }

  const comps = result?.competitors ?? [];
  const sorted = [...comps].sort((a, b) => a.distanceMeters - b.distanceMeters);
  const initials = (user?.fullName ?? "?").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  const peak = result?.footTrafficPeak ?? 0, avg = result?.footTrafficAverage ?? 0;
  const businessLabel = BUSINESS_TYPES.find((b) => b.value === businessType)?.label.toLowerCase();

  return (
    <div className="gp">
      <nav className="gp-nav" aria-label="Principal">
        <Link to="/" className="gp-brand" aria-label="Sitial, ir al inicio"><Icon name="pin" size={22} /></Link>
        <Link to="/" className="gp-nav-item"><Icon name="home" /><span>Inicio</span></Link>
        <span className="gp-nav-item active" aria-current="page"><Icon name="analysis" /><span>Análisis</span></span>
        <div className="gp-spacer" />
        <button type="button" className="gp-nav-item" onClick={logout}><Icon name="logout" /><span>Salir</span></button>
      </nav>

      <header className="gp-header">
        <div className="gp-ctx">
          <label htmlFor="gp-label" className="sr">Nombre del sitio</label>
          <input id="gp-label" className="gp-label-input" value={label} onChange={(e) => setLabel(e.target.value)} />
          <div className="meta">{user?.fullName} · {user?.email}</div>
        </div>
        <div className="gp-spacer" />
        <div className="gp-field">
          <label htmlFor="gp-type">Tipo de negocio</label>
          <select id="gp-type" value={businessType} onChange={(e) => setBusinessType(e.target.value as BusinessType)}>
            {BUSINESS_TYPES.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
          </select>
        </div>
        <div className="gp-balance" aria-live="polite">
          <span className="lbl">Puntuación de idoneidad</span>
          <span className="val">{result ? result.overallScore : "—"} <span>/ 100</span></span>
        </div>
        <button type="button" className="gp-btn" onClick={handleAnalyze} disabled={loading}>
          <Icon name="play" size={14} />{loading ? "Analizando…" : "Analizar"}
        </button>
        <button type="button" className="gp-logout" onClick={logout}>Salir</button>
      </header>

      <aside className="gp-left" aria-label="Capas">
        <div className="gp-pane-head"><h2>Capas</h2></div>
        <div className="gp-toc">
          <div className="gp-group">Análisis actual</div>
          <div className="gp-row selected">
            <span className="swatch" style={{ background: "var(--teal)", borderRadius: "50%" }} />
            <span className="nm">Punto de análisis</span><span className="meta">1</span>
          </div>
          <label className="gp-row child">
            <input type="checkbox" checked={layers.iso} onChange={() => toggleLayer("iso")} />
            <span className="swatch" style={{ background: "linear-gradient(90deg,var(--teal-dark),var(--mint))" }} />
            <span className="nm">Radio {RADIUS} m</span><span className="meta">1</span>
          </label>
          <label className="gp-row child">
            <input type="checkbox" checked={layers.heat} onChange={() => toggleLayer("heat")} />
            <span className="swatch" style={{ background: "linear-gradient(90deg,var(--teal),var(--mint),var(--amber-soft),var(--coral))" }} />
            <span className="nm">Afluencia</span>
          </label>
          <label className="gp-row child">
            <input type="checkbox" checked={layers.comp} onChange={() => toggleLayer("comp")} />
            <span className="swatch" style={{ background: "var(--coral)" }} />
            <span className="nm">Competidores</span><span className="meta">{comps.length}</span>
          </label>
          <div className="gp-group">Capas base</div>
          <label className="gp-row">
            <input type="checkbox" checked={layers.roads} onChange={() => toggleLayer("roads")} />
            <span className="swatch" style={{ background: "var(--border-3)" }} /><span className="nm">Red vial</span>
          </label>
          <label className="gp-row">
            <input type="checkbox" checked={layers.parks} onChange={() => toggleLayer("parks")} />
            <span className="swatch" style={{ background: "var(--teal-dark)" }} /><span className="nm">Zonas verdes</span>
          </label>
          <p className="gp-hint">El mapa es esquemático: las manzanas son ilustrativas y los competidores están ubicados según sus coordenadas.</p>
        </div>
      </aside>

      <main className="gp-center">
        <MapView center={DEFAULT_COORDS} radiusMeters={RADIUS} result={result} loading={loading}
          layers={layers} onToggleLayer={toggleLayer} selectedId={selectedId} onSelect={setSelectedId}
          onZoomChange={setZoom} />

        <section className="gp-table" aria-label="Competidores">
          <div className="gp-table-head">
            <span className="title">Competidores · {result?.label ?? label}</span>
            <span className="count"><b>{comps.length}</b> {comps.length === 1 ? "entidad" : "entidades"}</span>
          </div>
          <div className="gp-table-scroll">
            {error && <div className="gp-error" role="alert">{error}</div>}
            {result && comps.length === 0 && <div className="gp-table-empty">No se encontraron competidores en {RADIUS} m. Es una buena señal para este negocio.</div>}
            {!result && !error && <div className="gp-table-empty">Aquí verás los competidores cercanos después de analizar.</div>}
            {comps.length > 0 && (
              <table>
                <thead>
                  <tr><th className="num">#</th><th>Nombre</th><th>Categoría</th><th>Dist.</th><th>Rating</th><th>Reseñas</th><th>Amenaza</th></tr>
                </thead>
                <tbody>
                  {sorted.map((k, i) => (
                    <tr key={k.placeId} className={k.placeId === selectedId ? "selected" : ""}
                      onClick={() => setSelectedId(k.placeId === selectedId ? null : k.placeId)}>
                      <td className="num">{i + 1}</td>
                      <td title={k.name}>{k.name}</td>
                      <td>{k.category}</td>
                      <td className="mono">{k.distanceMeters} m</td>
                      <td className="mono">{k.rating ?? "—"}</td>
                      <td className="mono">{fmtNum(k.reviewCount)}</td>
                      <td><span className={`tag ${THREAT[k.threatLevel].tag}`}>{THREAT[k.threatLevel].label}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>

      <aside className="gp-right" aria-label="Resultados">
        <Section title="Idoneidad">
          {result ? (
            <div className="gp-score">
              <ScoreRing value={result.overallScore} />
              <div>
                <div className="verdict">{VERDICT[result.verdict]}</div>
                <div className="desc">{VERDICT_DESC[result.verdict]}</div>
                {result.address && <div className="desc addr">{result.address.formatted}</div>}
              </div>
            </div>
          ) : <p className="gp-muted">Pulsa Analizar para calcular el puntaje de {businessLabel}.</p>}
        </Section>

        <Section title="Métricas">
          {result ? result.metrics.map((m) => (
            <div key={m.name} className="gp-metric" title={m.description}>
              <span className="k">{m.name}</span>
              <div className="bar"><i className={metricClass(m.name)} style={{ width: `${m.value}%` }} /></div>
              <span className="v">{m.value}</span>
            </div>
          )) : <p className="gp-muted">Afluencia, competencia, demografía y accesibilidad.</p>}
        </Section>

        <Section title="Afluencia peatonal">
          {result ? (
            <>
              <div className="gp-metric"><span className="k">Pico</span>
                <div className="bar"><i className="c" style={{ width: "100%" }} /></div>
                <span className="v">{fmtNum(peak)}</span></div>
              <div className="gp-metric"><span className="k">Promedio</span>
                <div className="bar"><i className="c" style={{ width: `${peak ? Math.round((avg / peak) * 100) : 0}%` }} /></div>
                <span className="v">{fmtNum(avg)}</span></div>
              <p className="gp-muted">Personas por hora estimadas dentro del radio.</p>
            </>
          ) : <p className="gp-muted">Sin datos todavía.</p>}
        </Section>

        <Section title="Más cercanos">
          {sorted.length > 0 ? (
            <div className="gp-comps">
              {sorted.slice(0, 5).map((k, i) => (
                <button type="button" key={k.placeId} className="gp-comp"
                  onClick={() => setSelectedId(k.placeId === selectedId ? null : k.placeId)}>
                  <span className={`badge ${THREAT[k.threatLevel].cls}`}>{String(i + 1).padStart(2, "0")}</span>
                  <span className="nm">{k.name}</span>
                  <span className="dist">{k.distanceMeters} m</span>
                </button>
              ))}
            </div>
          ) : <p className="gp-muted">Sin competidores por mostrar.</p>}
        </Section>
      </aside>

      <footer className="gp-status">
        <div className="seg"><span className={`dot ${loading ? "busy" : ""}`} /><b>{loading ? "Analizando" : error ? "Error" : "Listo"}</b></div>
        <div className="seg"><span className="k">Lat</span><b>{fmtLat(DEFAULT_COORDS.lat)}</b><span className="k">Lng</span><b>{fmtLng(DEFAULT_COORDS.lng)}</b></div>
        <div className="seg"><span className="k">Radio</span><b>{RADIUS} m</b></div>
        <div className="seg"><span className="k">Zoom</span><b>{zoom.toFixed(1)}</b></div>
        <div className="gp-spacer" />
        <div className="seg"><span className="k">Selección</span><b>{selectedId ? 1 : 0} / {comps.length}</b></div>
        <div className="seg"><span className="avatar" aria-hidden="true">{initials}</span><b>{user?.fullName}</b></div>
      </footer>
    </div>
  );
}
