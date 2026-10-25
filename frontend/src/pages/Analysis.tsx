import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowLeft, BarChart3, Clock3, Download, MapPin, Store, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import type { AnalysisResult, BusinessType, ThreatLevel, Verdict } from "@/types";
import "@/styles/analysis.css";

const BUSINESS_LABEL: Record<BusinessType, string> = {
  cafe: "Cafetería",
  restaurant: "Restaurante",
  bakery: "Panadería",
  pharmacy: "Farmacia",
  gym: "Gimnasio",
  supermarket: "Supermercado",
};

const VERDICT: Record<Verdict, string> = {
  optimal: "Óptimo",
  review: "Revisar",
  discard: "Descartar",
};

const THREAT: Record<ThreatLevel, { label: string; className: string }> = {
  high: { label: "ALTA", className: "r" },
  medium: { label: "MEDIA", className: "a" },
  low: { label: "BAJA", className: "g" },
};

const METRIC_COLORS = ["#3a9aa3", "#e5685a", "#7fb88e", "#d99a2b"];

function ScoreRing({ score, color }: { score: number; color: string }) {
  const circumference = 2 * Math.PI * 34;
  return (
    <div className="ah-score-ring">
      <svg viewBox="0 0 80 80" aria-hidden="true">
        <circle cx="40" cy="40" r="34" fill="none" stroke="var(--border)" strokeWidth="6" />
        <circle
          cx="40"
          cy="40"
          r="34"
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (score / 100) * circumference}
          strokeLinecap="round"
        />
      </svg>
      <div className="ah-score-val"><span>{score}</span><small>/100</small></div>
    </div>
  );
}

function formatNumber(value: number) {
  return value.toLocaleString("es-CO");
}

export function Analysis() {
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("sitial_last_analysis_v2");
    if (!stored) return;
    try {
      setData(JSON.parse(stored) as AnalysisResult);
    } catch {
      setLoadError("El análisis guardado no se pudo leer. Vuelve al mapa y genera uno nuevo.");
    }
  }, []);

  const competitors = data?.competitors ?? [];
  const ratedCompetitors = competitors.filter((competitor) => competitor.rating !== null);
  const averageRating = ratedCompetitors.length
    ? ratedCompetitors.reduce((sum, competitor) => sum + (competitor.rating ?? 0), 0) / ratedCompetitors.length
    : null;
  const highestRating = ratedCompetitors.length
    ? Math.max(...ratedCompetitors.map((competitor) => competitor.rating ?? 0))
    : null;
  const totalReviews = competitors.reduce((sum, competitor) => sum + competitor.reviewCount, 0);
  const highThreats = competitors.filter((competitor) => competitor.threatLevel === "high").length;
  const scoreColor = !data || data.overallScore === null || data.overallScore >= 75
    ? "var(--teal-500)"
    : data.overallScore >= 55 ? "var(--warn)" : "var(--coral-500)";
  const metricChartData = useMemo(
    () => data?.metrics
      .filter((metric) => metric.value !== null)
      .map((metric, index) => ({ ...metric, color: METRIC_COLORS[index % METRIC_COLORS.length] })) ?? [],
    [data],
  );
  const trafficData = useMemo(() => {
    if (!data || data.footTrafficPeak === null || data.footTrafficAverage === null) return [];
    return [
      { name: "Pico", personas: data.footTrafficPeak },
      { name: "Promedio", personas: data.footTrafficAverage },
    ];
  }, [data]);
  const contextTitle = data?.label ?? "Análisis de ubicación";
  const contextSubtitle = data
    ? `${BUSINESS_LABEL[data.businessType]} · Radio ${data.radiusMeters} m`
    : "Selecciona una ubicación en el dashboard";

  return (
    <AppShell
      active="analysis"
      title={contextTitle}
      subtitle={contextSubtitle}
      scoreLabel="Idoneidad comercial"
      score={data
        ? data.overallScore === null ? "N/D" : <>{data.overallScore}<span> / 100</span></>
        : "--"}
      actions={
        <>
          <Link className="btn-secondary" to="/app"><ArrowLeft size={16} /> Volver al mapa</Link>
          <button type="button" className="btn-primary" onClick={() => window.print()} disabled={!data}>
            <Download size={16} /> Generar informe
          </button>
        </>
      }
    >
      <div className="analisis-container">
        {loadError && <div className="analysis-error" role="alert">{loadError}</div>}
        {!data ? (
          <div className="estado-vacio">
            <div className="vacio-card">
              <MapPin size={56} aria-hidden="true" />
              <h2>Sin análisis activo</h2>
              <p>Ve al dashboard, haz clic en el mapa para seleccionar una ubicación y genera el análisis para ver el informe completo.</p>
              <Link className="btn-primary" to="/app"><MapPin size={16} /> Ir al mapa</Link>
            </div>
          </div>
        ) : (
          <div className="analisis-content">
            <section className="analisis-header">
              <div className="ah-info">
                <h2>Informe de ubicación</h2>
                <div className="ah-meta">
                  <span><MapPin size={14} /> <b>{data.address?.formatted ?? `${data.coordinates.lat.toFixed(4)}, ${data.coordinates.lng.toFixed(4)}`}</b></span>
                  <span><Store size={14} /> <b>{BUSINESS_LABEL[data.businessType]}</b></span>
                  <span><MapPin size={14} /> Radio <b>{data.radiusMeters} m</b></span>
                  <span><Clock3 size={14} /> <b>{new Date(data.createdAt).toLocaleString("es-CO")}</b></span>
                </div>
              </div>
              <div className="ah-score">
                {data.overallScore === null
                  ? <div className="ah-score-unavailable">N/D</div>
                  : <ScoreRing score={data.overallScore} color={scoreColor} />}
                <div className="ah-score-meta">
                  <div className="ah-verdict" style={{ color: scoreColor }}>
                    {data.verdict ? VERDICT[data.verdict] : "Datos insuficientes"}
                  </div>
                  <div className="ah-verdict-desc">
                    Se muestra la competencia encontrada. No hay datos reales de afluencia, demografía ni accesibilidad para emitir un veredicto de viabilidad.
                  </div>
                </div>
              </div>
            </section>

            <div className="analisis-grid">
              <div className="ag-left">
                <section className="card">
                  <div className="card-head"><h3><BarChart3 size={18} /> Indicador disponible</h3></div>
                  <div className="card-body"><div className="chart-wrapper-lg">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={metricChartData} margin={{ top: 10, right: 14, left: 0, bottom: 4 }}>
                        <CartesianGrid stroke="var(--border)" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--text-2)" }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "var(--text-3)" }} />
                        <Tooltip formatter={(value) => [`${value}/100`, "Menor presión competitiva"]} />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={60}>
                          {metricChartData.map((metric) => <Cell key={metric.name} fill={metric.color} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div></div>
                  <p className="analysis-chart-note">El índice resume únicamente la competencia consultada; no representa una puntuación total de viabilidad.</p>
                </section>

                <section className="card">
                  <div className="card-head"><h3><BarChart3 size={18} /> Afluencia</h3></div>
                  <div className="card-body">{trafficData.length === 0 ? (
                    <div className="analysis-data-unavailable">No hay una fuente de datos de afluencia conectada. No se muestra una estimación inventada.</div>
                  ) : <div className="chart-wrapper-lg">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={trafficData} margin={{ top: 10, right: 14, left: 0, bottom: 4 }}>
                        <CartesianGrid stroke="var(--border)" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--text-2)" }} />
                        <YAxis tick={{ fontSize: 10, fill: "var(--text-3)" }} />
                        <Tooltip formatter={(value) => [formatNumber(Number(value)), "Personas por hora"]} />
                        <Bar dataKey="personas" fill="var(--teal-500)" radius={[6, 6, 0, 0]} maxBarSize={72} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                    }
                  </div>
                </section>

                <section className="card">
                  <div className="card-head">
                    <h3><Store size={18} /> Competidores detectados ({competitors.length})</h3>
                  </div>
                  <div className="card-body no-pad">
                    <div className="analysis-table-scroll">
                      <table className="data-table">
                        <thead>
                          <tr><th>#</th><th>Nombre</th><th>Categoría</th><th>Distancia</th><th>Rating</th><th>Reseñas</th><th>Amenaza</th></tr>
                        </thead>
                        <tbody>
                          {competitors.length === 0 ? (
                            <tr><td colSpan={7} className="analysis-table-empty">No se encontraron competidores en este radio.</td></tr>
                          ) : [...competitors].sort((a, b) => a.distanceMeters - b.distanceMeters).map((competitor, index) => (
                            <tr key={competitor.placeId}>
                              <td>{index + 1}</td>
                              <td><b>{competitor.name}</b></td>
                              <td>{competitor.category}</td>
                              <td>{formatNumber(competitor.distanceMeters)} m</td>
                              <td>{competitor.rating === null ? "—" : `★ ${competitor.rating.toFixed(1)}`}</td>
                              <td>{formatNumber(competitor.reviewCount)}</td>
                              <td><span className={`tag ${THREAT[competitor.threatLevel].className}`}>{THREAT[competitor.threatLevel].label}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>
              </div>

              <div className="ag-right">
                <section className="card">
                  <div className="card-head"><h3><BarChart3 size={18} /> Resumen ejecutivo</h3></div>
                  <div className="card-body">
                    <div className="mini-grid">
                      <div className="mini-card"><div className="mc-lbl">Idoneidad comercial</div><div className="mc-val">{data.overallScore === null ? "N/D" : `${data.overallScore}/100`}</div></div>
                      <div className="mini-card"><div className="mc-lbl">Resultado</div><div className={`mc-val${data.verdict === "optimal" ? "" : data.verdict === "review" ? " warn" : " danger"}`}>{data.verdict ? VERDICT[data.verdict] : "Sin datos"}</div></div>
                      <div className="mini-card"><div className="mc-lbl">Competidores</div><div className="mc-val">{competitors.length}</div></div>
                      <div className="mini-card"><div className="mc-lbl">Afluencia promedio</div><div className="mc-val">{data.footTrafficAverage === null ? "N/D" : formatNumber(data.footTrafficAverage)}</div></div>
                    </div>
                  </div>
                </section>

                <section className="card">
                  <div className="card-head"><h3><Trophy size={18} /> Competencia</h3></div>
                  <div className="card-body">
                    <div className="stat-row"><span className="k">Total competidores</span><span className="v">{competitors.length}</span></div>
                    <div className="stat-row"><span className="k">Rating promedio</span><span className="v">{averageRating === null ? "—" : `★ ${averageRating.toFixed(2)}`}</span></div>
                    <div className="stat-row"><span className="k">Mejor rating</span><span className="v">{highestRating === null ? "—" : `★ ${highestRating.toFixed(1)}`}</span></div>
                    <div className="stat-row"><span className="k">Reseñas totales</span><span className="v">{formatNumber(totalReviews)}</span></div>
                    <div className="stat-row"><span className="k">Amenazas altas</span><span className="v danger">{highThreats}</span></div>
                  </div>
                </section>

                <section className="card">
                  <div className="card-head"><h3><MapPin size={18} /> Recomendación</h3></div>
                  <div className="card-body">
                    <ul className="inf-list">
                      <li>{data.verdict === "optimal"
                        ? "La zona presenta una puntuación favorable para este tipo de negocio."
                        : data.verdict === "review"
                          ? "Revisa las métricas individuales y evalúa cómo diferenciarte de la competencia."
                          : data.verdict === "discard"
                            ? "La puntuación es baja; compara otras ubicaciones antes de tomar una decisión."
                            : "No se puede determinar la viabilidad con los datos disponibles. Se requieren fuentes reales de afluencia, demografía y accesibilidad."}</li>
                      <li>{competitors.length === 0
                        ? "No se encontraron competidores dentro del radio seleccionado."
                        : `${highThreats} de ${competitors.length} competidores presentan una amenaza alta.`}</li>
                      {data.footTrafficAverage !== null && <li>La afluencia estimada es de {formatNumber(data.footTrafficAverage)} personas por hora en promedio.</li>}
                    </ul>
                  </div>
                </section>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
