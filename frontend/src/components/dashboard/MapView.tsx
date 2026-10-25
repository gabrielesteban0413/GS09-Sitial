import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  Circle,
  GoogleMap,
  InfoWindow,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";
import { ArrowRight, Flame, MapPin, Search, Store, X } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import type { AnalysisResult, BusinessType, Coordinates, ThreatLevel } from "@/types";

export interface Layers {
  heat: boolean;
  iso: boolean;
  comp: boolean;
}

interface Props {
  center: Coordinates;
  radiusMeters: number;
  result: AnalysisResult | null;
  loading: boolean;
  error: string;
  hasSelection: boolean;
  businessType: BusinessType;
  layers: Layers;
  onToggleLayer: (key: keyof Layers) => void;
  onBusinessTypeChange: (type: BusinessType) => void;
  onCenterChange: (center: Coordinates) => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

const containerStyle = { width: "100%", height: "100%" };
const initialZoom = 14;
const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim() ?? "";

const BUSINESS_OPTIONS: { group: string; values: { value: BusinessType; label: string }[] }[] = [
  {
    group: "Alimentos y bebidas",
    values: [
      { value: "cafe", label: "Cafetería" },
      { value: "restaurant", label: "Restaurante" },
      { value: "bakery", label: "Panadería" },
    ],
  },
  {
    group: "Salud y bienestar",
    values: [
      { value: "pharmacy", label: "Farmacia" },
      { value: "gym", label: "Gimnasio" },
    ],
  },
  { group: "Comercio", values: [{ value: "supermarket", label: "Supermercado" }] },
];

const THREAT_COLOR: Record<ThreatLevel, string> = {
  high: "#e5685a",
  medium: "#d99a2b",
  low: "#10b981",
};

const mapBaseStyles: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#f4f7f8" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#5a6d73" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#d5dfe2" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#d8e8e0" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#bcd9cb" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#eef3f4" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#e2e9eb" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#d4e3e8" }] },
];

function formatNumber(value: number) {
  return value.toLocaleString("es-CO");
}

export function MapView({
  center,
  radiusMeters,
  result,
  loading,
  error,
  hasSelection,
  businessType,
  layers,
  onToggleLayer,
  onBusinessTypeChange,
  onCenterChange,
  selectedId,
  onSelect,
}: Props) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const initialCenter = useRef(center);
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [quickPanelOpen, setQuickPanelOpen] = useState(false);
  const { isLoaded, loadError } = useJsApiLoader({
    id: "sitial-google-maps",
    googleMapsApiKey,
  });

  const mapOptions = useMemo<google.maps.MapOptions>(() => ({
    clickableIcons: false,
    disableDefaultUI: true,
    fullscreenControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    zoomControl: true,
    gestureHandling: "greedy",
    styles: mapBaseStyles,
  }), []);

  useEffect(() => {
    setQuickPanelOpen(Boolean(result));
  }, [result]);

  const handleMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    const position = event.latLng?.toJSON();
    if (!position) return;
    onCenterChange(position);
  }, [onCenterChange]);

  async function searchAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = search.trim();
    if (!query || !isLoaded) return;
    setSearching(true);
    setSearchError("");
    try {
      const { coordinates: position } = await api.places.geocode(query);
      mapRef.current?.panTo(position);
      mapRef.current?.setZoom(16);
      onCenterChange(position);
    } catch (cause) {
      setSearchError(cause instanceof Error
        ? cause.message
        : "No se pudo buscar la dirección.");
    } finally {
      setSearching(false);
    }
  }

  useEffect(() => {
    if (loadError) setSearchError("No se pudo cargar Google Maps. Revisa la clave y los permisos de Maps JavaScript API.");
  }, [loadError]);

  if (!googleMapsApiKey) {
    return <div className="mapframe"><div className="map-message" role="alert">Falta VITE_GOOGLE_MAPS_API_KEY en frontend/.env.</div></div>;
  }

  return (
    <div className="mapframe">
      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={containerStyle}
          mapContainerClassName="map-canvas"
          center={initialCenter.current}
          zoom={initialZoom}
          options={mapOptions}
          onLoad={(map) => { mapRef.current = map; }}
          onUnmount={() => { mapRef.current = null; }}
          onClick={handleMapClick}
        >
          {hasSelection && layers.iso && (
            <Circle
              center={center}
              radius={radiusMeters}
              options={{
                clickable: false,
                fillColor: "#3a9aa3",
                fillOpacity: 0.08,
                strokeColor: "#3a9aa3",
                strokeOpacity: 0.8,
                strokeWeight: 2,
              }}
            />
          )}
          {hasSelection && (
            <Marker
              position={center}
              title="Ubicación del análisis"
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: "#3a9aa3",
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 3,
              }}
            />
          )}
          {result && layers.comp && result.competitors.map((competitor) => {
            const selected = selectedId === competitor.placeId;
            return (
              <Marker
                key={competitor.placeId}
                position={competitor.coordinates}
                title={competitor.name}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: selected ? 9 : 7,
                  fillColor: THREAT_COLOR[competitor.threatLevel],
                  fillOpacity: 1,
                  strokeColor: "#ffffff",
                  strokeWeight: 2,
                }}
                onClick={() => onSelect(selected ? null : competitor.placeId)}
              />
            );
          })}
          {result && layers.heat && result.competitors.map((competitor) => (
            <Circle
              key={`traffic-${competitor.placeId}`}
              center={competitor.coordinates}
              radius={heatRadius(competitor.placeId)}
              options={{
                clickable: false,
                fillColor: THREAT_COLOR[competitor.threatLevel],
                fillOpacity: 0.15,
                strokeOpacity: 0,
              }}
            />
          ))}
          {result && selectedId && (() => {
            const competitor = result.competitors.find((item) => item.placeId === selectedId);
            if (!competitor) return null;
            return (
              <InfoWindow
                position={competitor.coordinates}
                onCloseClick={() => onSelect(null)}
              >
                <div className="map-info">
                  <strong>{competitor.name}</strong>
                  <span>{competitor.distanceMeters} m · {competitor.rating ?? "Sin rating"} ★</span>
                </div>
              </InfoWindow>
            );
          })()}
        </GoogleMap>
      ) : (
        <div className="map-message" role="status">Cargando Google Maps…</div>
      )}

      <div className="map-toolbar" role="group" aria-label="Capas y categoría del mapa">
        <div className="toolbar-group">
          <label className="toolbar-label" htmlFor="categoriaSelect"><Store size={14} /> Categoría</label>
          <select
            id="categoriaSelect"
            className="toolbar-select"
            value={businessType}
            onChange={(event) => onBusinessTypeChange(event.target.value as BusinessType)}
          >
            {BUSINESS_OPTIONS.map(({ group, values }) => (
              <optgroup key={group} label={group}>
                {values.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </optgroup>
            ))}
          </select>
        </div>
        <div className="sep" />
        <button type="button" className={layers.heat ? "on" : ""} aria-pressed={layers.heat}
          title="Mostrar tráfico en el mapa" onClick={() => onToggleLayer("heat")}>
          <Flame size={14} /> Afluencia
        </button>
        <div className="sep" />
        <button type="button" className={layers.iso ? "on" : ""} aria-pressed={layers.iso}
          title="Mostrar radio de análisis" onClick={() => onToggleLayer("iso")}>
          <MapPin size={14} /> Isócrona
        </button>
        <div className="sep" />
        <button type="button" className={layers.comp ? "on" : ""} aria-pressed={layers.comp}
          title="Mostrar competidores" onClick={() => onToggleLayer("comp")}>
          <Store size={14} /> Competencia
        </button>
      </div>

      <form className="map-search" onSubmit={searchAddress}>
        <Search size={16} aria-hidden="true" />
        <input value={search} onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar dirección en Bogotá..." autoComplete="off" aria-label="Buscar dirección" />
        <button type="submit" aria-label="Buscar dirección" disabled={!isLoaded || searching || !search.trim()}>
          <ArrowRight size={17} />
        </button>
      </form>

      {!hasSelection && (
        <div className="map-hint">
          <MapPin size={18} /> Haz clic en el mapa para marcar la ubicación
        </div>
      )}

      {(searchError || error) && (
        <div className="map-error" role="alert">{searchError || error}</div>
      )}

      {loading && <div className="map-loading" role="status">Analizando la zona…</div>}

      {result && quickPanelOpen && (
        <section className="quick-panel show" aria-label="Resultado del análisis">
          <div className="qp-head">
            <MapPin size={16} />
            <span>Resultado</span>
            <button type="button" className="qp-close" aria-label="Cerrar resultado" onClick={() => setQuickPanelOpen(false)}>
              <X size={16} />
            </button>
          </div>
          <div className="qp-body">
            <div className="qp-row"><span className="k">Ubicación</span><span className="v">{result.address?.formatted ?? `${center.lat.toFixed(4)}, ${center.lng.toFixed(4)}`}</span></div>
            <div className="qp-row"><span className="k">Tipo</span><span className="v">{BUSINESS_OPTIONS.flatMap((group) => group.values).find((option) => option.value === result.businessType)?.label}</span></div>
            <div className="qp-row"><span className="k">Competidores</span><span className="v">{result.competitors.length}</span></div>
            <div className="qp-row"><span className="k">Idoneidad</span><span className="v score">{result.overallScore === null ? "N/D" : `${result.overallScore}/100`}</span></div>
            <Link className="qp-btn" to="/app/analisis">
              <ArrowRight size={15} /> Ver análisis detallado
            </Link>
          </div>
        </section>
      )}

      <div className="map-legend" aria-label="Nivel de amenaza">
        <div className="leg-item"><span className="dot teal" />Punto de análisis</div>
        <div className="leg-item"><span className="dot coral" />Amenaza alta</div>
        <div className="leg-item"><span className="dot amber" />Amenaza media</div>
        <div className="leg-item"><span className="dot green" />Amenaza baja</div>
      </div>
    </div>
  );
}

function heatRadius(id: string) {
  const hash = Array.from(id).reduce((value, character) => (
    (value * 31 + character.charCodeAt(0)) >>> 0
  ), 0);
  return 80 + hash % 61;
}
