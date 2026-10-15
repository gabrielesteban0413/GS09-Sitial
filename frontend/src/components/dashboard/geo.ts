import type { Coordinates } from "@/types";

/** Píxeles de mapa (unidades del viewBox) por metro. 800 m ≈ 240 unidades. */
export const PX_PER_M = 0.3;
export const VIEW_W = 1000;
export const VIEW_H = 700;

const M_PER_DEG_LAT = 110574;
const mPerDegLng = (lat: number) => 111320 * Math.cos((lat * Math.PI) / 180);

/** Convierte una coordenada a posición en el mapa esquemático, con `origin` en el centro. */
export function project(origin: Coordinates, p: Coordinates) {
  return {
    x: VIEW_W / 2 + (p.lng - origin.lng) * mPerDegLng(origin.lat) * PX_PER_M,
    y: VIEW_H / 2 - (p.lat - origin.lat) * M_PER_DEG_LAT * PX_PER_M,
  };
}

export function unprojectX(origin: Coordinates, x: number) {
  return origin.lng + (x - VIEW_W / 2) / PX_PER_M / mPerDegLng(origin.lat);
}
export function unprojectY(origin: Coordinates, y: number) {
  return origin.lat - (y - VIEW_H / 2) / PX_PER_M / M_PER_DEG_LAT;
}

export function fmtLat(v: number) { return `${Math.abs(v).toFixed(4)}°${v >= 0 ? "N" : "S"}`; }
export function fmtLng(v: number) { return `${Math.abs(v).toFixed(4)}°${v >= 0 ? "E" : "O"}`; }

/** Redondea a 1, 2 o 5 × 10^n para la barra de escala. */
export function niceDistance(m: number) {
  if (m <= 0) return 0;
  const pow = Math.pow(10, Math.floor(Math.log10(m)));
  const n = m / pow;
  return (n >= 5 ? 5 : n >= 2 ? 2 : 1) * pow;
}
