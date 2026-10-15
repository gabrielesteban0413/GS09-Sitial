import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AnalysisResult, Coordinates } from "@/types";
import { Icon } from "./Icon";
import { PX_PER_M, VIEW_H, VIEW_W, fmtLat, fmtLng, niceDistance, project, unprojectX, unprojectY } from "./geo";

export interface Layers { heat: boolean; iso: boolean; comp: boolean; labels: boolean; roads: boolean; parks: boolean }

interface Props {
  center: Coordinates;
  radiusMeters: number;
  result: AnalysisResult | null;
  loading: boolean;
  layers: Layers;
  onToggleLayer: (k: keyof Layers) => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onZoomChange: (z: number) => void;
}

const BLOCK = 92, STREET = 14;
const X0 = -700, X1 = VIEW_W + 700, Y0 = -500, Y1 = VIEW_H + 500;

/** Ciudad esquemática: manzanas, parques y avenidas. Es decorativa; lo real son los puntos. */
const Basemap = memo(function Basemap({ roads, parks }: { roads: boolean; parks: boolean }) {
  const blocks = useMemo(() => {
    const out: { x: number; y: number; w: number; h: number; park: boolean }[] = [];
    for (let r = 0, y = Y0; y < Y1; r++, y += BLOCK) {
      for (let c = 0, x = X0; x < X1; c++, x += BLOCK) {
        const hash = (r * 7 + c * 13 + r * c) % 17;
        out.push({ x: x + STREET / 2, y: y + STREET / 2, w: BLOCK - STREET, h: BLOCK - STREET, park: hash === 0 || hash === 9 });
      }
    }
    return out;
  }, []);
  return (
    <g>
      {blocks.map((b, i) => (
        <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} rx={4}
          fill={parks && b.park ? "var(--map-park)" : "var(--map-block)"}
          stroke="var(--map-road-stroke)" strokeWidth={1}
          opacity={roads || (parks && b.park) ? 1 : 0.35} />
      ))}
      {roads && (
        <>
          <line x1={-600} y1={820} x2={1700} y2={-60} stroke="#fff" strokeWidth={22} strokeLinecap="round" />
          <line x1={-600} y1={820} x2={1700} y2={-60} stroke="var(--map-road-stroke)" strokeWidth={1} />
          <line x1={200} y1={-400} x2={620} y2={1100} stroke="#fff" strokeWidth={16} strokeLinecap="round" />
        </>
      )}
    </g>
  );
});

export function MapView({ center, radiusMeters, result, loading, layers, onToggleLayer, selectedId, onSelect, onZoomChange }: Props) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [vb, setVb] = useState({ x: 0, y: 0, w: VIEW_W, h: VIEW_H });
  const [px, setPx] = useState({ w: 1000, h: 700 });
  const drag = useRef<{ sx: number; sy: number; vx: number; vy: number } | null>(null);

  const zoom = VIEW_W / vb.w;
  useEffect(() => { onZoomChange(15 + Math.log2(zoom)); }, [zoom, onZoomChange]);

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setPx({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const zoomAt = useCallback((factor: number, fx = 0.5, fy = 0.5) => {
    setVb((v) => {
      const nz = Math.max(0.7, Math.min((VIEW_W / v.w) * factor, 8));
      const w = VIEW_W / nz, h = VIEW_H / nz;
      return { x: v.x + v.w * fx - w * fx, y: v.y + v.h * fy - h * fy, w, h };
    });
  }, []);

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if ((e.target as HTMLElement).closest("[data-ui]")) return;
      e.preventDefault();
      const r = el.getBoundingClientRect();
      zoomAt(e.deltaY < 0 ? 1.15 : 1 / 1.15, (e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  function onPointerDown(e: React.PointerEvent) {
    if ((e.target as HTMLElement).closest("[data-ui]") || (e.target as Element).closest("[data-pin]")) return;
    drag.current = { sx: e.clientX, sy: e.clientY, vx: vb.x, vy: vb.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    const d = drag.current;
    if (!d) return;
    const r = frameRef.current!.getBoundingClientRect();
    setVb((v) => ({ ...v, x: d.vx - ((e.clientX - d.sx) / r.width) * v.w, y: d.vy - ((e.clientY - d.sy) / r.height) * v.h }));
  }
  function onPointerUp() { drag.current = null; }

  const c = { x: VIEW_W / 2, y: VIEW_H / 2 };
  const radiusPx = radiusMeters * PX_PER_M;
  const foot = result?.metrics.find((m) => m.name.toLowerCase().startsWith("afluencia"))?.value ?? 0;
  const pts = useMemo(
    () => (result?.competitors ?? []).map((k) => ({ k, ...project(center, k.coordinates) })),
    [result, center],
  );

  // Escala: metros que caben en ~110 px de pantalla
  const pxPerUnit = px.w / vb.w;
  const barMeters = niceDistance(110 / (pxPerUnit * PX_PER_M));
  const barPx = barMeters * PX_PER_M * pxPerUnit;
  const fmtDist = (m: number) => (m >= 1000 ? `${m / 1000} km` : `${m} m`);

  const ticksX = [0, 1, 2, 3, 4].map((i) => fmtLng(unprojectX(center, vb.x + (vb.w * (i + 0.5)) / 5)));
  const ticksY = [0, 1, 2, 3, 4].map((i) => fmtLat(unprojectY(center, vb.y + (vb.h * (i + 0.5)) / 5)));

  const threatColor = (t: string) => (t === "high" ? "var(--coral)" : t === "medium" ? "var(--amber)" : "var(--teal)");
  const TOOLS: { key: keyof Layers; label: string; icon: string }[] = [
    { key: "heat", label: "Afluencia", icon: "flame" },
    { key: "iso", label: "Radio", icon: "analysis" },
    { key: "comp", label: "Competencia", icon: "store" },
    { key: "labels", label: "Nombres", icon: "tag" },
  ];

  return (
    <div className="gp-map" ref={frameRef} onPointerDown={onPointerDown} onPointerMove={onPointerMove}
      onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
      <svg className="gp-map-svg" viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`} role="img"
        aria-label={result ? `Mapa esquemático con ${result.competitors.length} competidores` : "Mapa esquemático sin análisis"}>
        <defs>
          <radialGradient id="gp-heat">
            <stop offset="0" stopColor="var(--coral)" stopOpacity=".55" />
            <stop offset=".35" stopColor="var(--amber)" stopOpacity=".38" />
            <stop offset=".7" stopColor="var(--teal-light)" stopOpacity=".2" />
            <stop offset="1" stopColor="var(--teal-light)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <Basemap roads={layers.roads} parks={layers.parks} />
        {result && layers.heat && (
          <g style={{ opacity: 0.35 + (foot / 100) * 0.65 }}>
            <circle cx={c.x} cy={c.y} r={radiusPx * 1.25} fill="url(#gp-heat)" />
            <circle cx={c.x + radiusPx * 0.45} cy={c.y - radiusPx * 0.3} r={radiusPx * 0.55} fill="url(#gp-heat)" />
            <circle cx={c.x - radiusPx * 0.5} cy={c.y + radiusPx * 0.35} r={radiusPx * 0.45} fill="url(#gp-heat)" />
          </g>
        )}
        {layers.iso && (
          <circle cx={c.x} cy={c.y} r={radiusPx} fill="rgba(58,154,163,.08)" stroke="var(--teal)"
            strokeWidth={1.5 / Math.sqrt(zoom)} strokeDasharray="6 6" />
        )}
        {result && layers.comp && pts.map(({ k, x, y }) => {
          const sel = k.placeId === selectedId;
          return (
            <g key={k.placeId} data-pin transform={`translate(${x} ${y})`} style={{ cursor: "pointer" }}
              role="button" tabIndex={0} aria-label={`${k.name}, a ${k.distanceMeters} metros`} aria-pressed={sel}
              onClick={() => onSelect(sel ? null : k.placeId)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(sel ? null : k.placeId); } }}>
              {sel && <circle r={13} fill="none" stroke={threatColor(k.threatLevel)} strokeWidth={2} />}
              <circle r={sel ? 7 : 5.5} fill={threatColor(k.threatLevel)} stroke="#fff" strokeWidth={2} />
              {layers.labels && (
                <text x={10} y={4} fontSize={11} fontWeight={sel ? 600 : 500} fill="var(--map-label-strong)"
                  stroke="#fff" strokeWidth={3} paintOrder="stroke">
                  {k.name.length > 22 ? `${k.name.slice(0, 21)}…` : k.name}
                </text>
              )}
            </g>
          );
        })}
        <g transform={`translate(${c.x} ${c.y})`}>
          <circle r={15} fill="rgba(58,154,163,.2)" />
          <circle r={7} fill="var(--teal-dark)" stroke="#fff" strokeWidth={2.5} />
        </g>
      </svg>

      <div className="gp-graticule" aria-hidden="true" />
      <div className="gp-ticks gp-ticks-t" aria-hidden="true">{ticksX.map((t, i) => <span key={i}>{t}</span>)}</div>
      <div className="gp-ticks gp-ticks-l" aria-hidden="true">{ticksY.map((t, i) => <span key={i}>{t}</span>)}</div>

      <div className="gp-toolbar" data-ui role="group" aria-label="Capas del mapa">
        {TOOLS.map((t) => (
          <button key={t.key} type="button" className={layers[t.key] ? "on" : ""}
            aria-pressed={layers[t.key]} onClick={() => onToggleLayer(t.key)}>
            <Icon name={t.icon} size={15} />{t.label}
          </button>
        ))}
      </div>

      <div className="gp-zoom" data-ui>
        <button type="button" aria-label="Acercar" onClick={() => zoomAt(1.4)}><Icon name="plus" size={15} /></button>
        <button type="button" aria-label="Alejar" onClick={() => zoomAt(1 / 1.4)}><Icon name="minus" size={15} /></button>
        <button type="button" aria-label="Ver todo" onClick={() => setVb({ x: 0, y: 0, w: VIEW_W, h: VIEW_H })}><Icon name="fit" size={15} /></button>
      </div>

      <div className="gp-scale" data-ui aria-hidden="true">
        <div className="bar" style={{ width: barPx }}><i /><i /><i /><i /></div>
        <div className="lbl"><span>0</span><span>{fmtDist(barMeters)}</span></div>
      </div>

      {!result && (
        <div className="gp-empty" role="status">
          <strong>{loading ? "Analizando la zona…" : "Aún no hay análisis"}</strong>
          <span>{loading ? "Buscando competidores cercanos." : "Elige el tipo de negocio y pulsa Analizar para ver puntaje y competidores."}</span>
        </div>
      )}
    </div>
  );
}
