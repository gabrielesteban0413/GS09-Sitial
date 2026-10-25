export function fmtLat(v: number) { return `${Math.abs(v).toFixed(4)}°${v >= 0 ? "N" : "S"}`; }
export function fmtLng(v: number) { return `${Math.abs(v).toFixed(4)}°${v >= 0 ? "E" : "O"}`; }
