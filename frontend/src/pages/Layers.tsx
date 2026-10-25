import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Circle, GoogleMap, InfoWindow, Marker, useJsApiLoader } from "@react-google-maps/api";
import { Eye, EyeOff, FolderPlus, Layers3, MapPin, Plus, Search, Trash2, X } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { api } from "@/lib/api";
import type { Coordinates, LayerCategory, LocationLayer, LocationPin } from "@/types";
import "@/styles/layers.css";

const DEFAULT_CENTER: Coordinates = { lat: 4.6768, lng: -74.0483 };
const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim() ?? "";
const MAP_STYLE = { width: "100%", height: "100%" };
const LAYER_COLORS = [
  "#3a9aa3", "#e5685a", "#d99a2b", "#7d3865", "#10b981", "#3b82f6",
  "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4", "#84cc16", "#f43f5e",
];
const CATEGORIES: { value: LayerCategory; label: string; emoji: string }[] = [
  { value: "restaurante", label: "Restaurante", emoji: "🍽️" },
  { value: "cafeteria", label: "Cafetería", emoji: "☕" },
  { value: "panaderia", label: "Panadería", emoji: "🥐" },
  { value: "bar", label: "Bar", emoji: "🍺" },
  { value: "gimnasio", label: "Gimnasio", emoji: "💪" },
  { value: "farmacia", label: "Farmacia", emoji: "💊" },
  { value: "supermercado", label: "Supermercado", emoji: "🛒" },
  { value: "tienda", label: "Tienda", emoji: "🏪" },
  { value: "oficina", label: "Oficina", emoji: "🏢" },
  { value: "otro", label: "Otro", emoji: "📍" },
];

interface LayerForm {
  name: string;
  description: string;
  color: string;
}

interface LocationForm {
  name: string;
  address: string;
  category: LayerCategory;
  notes: string;
}

const EMPTY_LAYER: LayerForm = { name: "", description: "", color: LAYER_COLORS[0] };
const EMPTY_LOCATION: LocationForm = { name: "", address: "", category: "otro", notes: "" };

export function Layers() {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [layers, setLayers] = useState<LocationLayer[]>([]);
  const [locations, setLocations] = useState<LocationPin[]>([]);
  const [activeLayer, setActiveLayer] = useState<LocationLayer | null>(null);
  const [visibility, setVisibility] = useState<Record<string, boolean>>({});
  const [center, setCenter] = useState<Coordinates>(DEFAULT_CENTER);
  const [selectedPin, setSelectedPin] = useState<string | null>(null);
  const [layerForm, setLayerForm] = useState(EMPTY_LAYER);
  const [locationForm, setLocationForm] = useState(EMPTY_LOCATION);
  const [layerModalOpen, setLayerModalOpen] = useState(false);
  const [pendingPosition, setPendingPosition] = useState<Coordinates | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const { isLoaded, loadError } = useJsApiLoader({
    id: "sitial-google-maps",
    googleMapsApiKey: MAPS_KEY,
  });

  const visibleLocations = useMemo(
    () => (activeLayer && visibility[activeLayer.id] !== false ? locations : []),
    [activeLayer, locations, visibility],
  );
  const totalLocations = layers.reduce((total, layer) => total + layer._count.locations, 0);

  const loadLayers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.layers.list();
      setLayers(result);
      setVisibility((previous) => Object.fromEntries(
        result.map((layer) => [layer.id, previous[layer.id] ?? true]),
      ));
      setActiveLayer((previous) => previous ? result.find((layer) => layer.id === previous.id) ?? null : null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudieron cargar las capas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLayers();
  }, [loadLayers]);

  const selectLayer = useCallback(async (layer: LocationLayer) => {
    setError("");
    setNotice("");
    setSelectedPin(null);
    setActiveLayer(layer);
    try {
      const result = await api.layers.locations(layer.id);
      setLocations(result);
      setLayers((current) => current.map((item) => item.id === layer.id
        ? { ...item, _count: { locations: result.length } }
        : item));
      if (result.length > 0) {
        const first = { lat: result[0].latitude, lng: result[0].longitude };
        setCenter(first);
        mapRef.current?.panTo(first);
        mapRef.current?.setZoom(14);
      }
    } catch (cause) {
      setLocations([]);
      setError(cause instanceof Error ? cause.message : "No se pudieron cargar las ubicaciones.");
    }
  }, []);

  async function createLayer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const created = await api.layers.create({
        name: layerForm.name.trim(),
        description: layerForm.description.trim(),
        color: layerForm.color,
      });
      setLayers((current) => [created, ...current]);
      setVisibility((current) => ({ ...current, [created.id]: true }));
      setLayerForm(EMPTY_LAYER);
      setLayerModalOpen(false);
      await selectLayer(created);
      setNotice(`Se creó la capa “${created.name}”.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo crear la capa.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteLayer(layer: LocationLayer) {
    if (!window.confirm(`¿Eliminar la capa “${layer.name}” y todas sus ubicaciones?`)) return;
    setError("");
    try {
      await api.layers.remove(layer.id);
      setLayers((current) => current.filter((item) => item.id !== layer.id));
      setVisibility((current) => {
        const next = { ...current };
        delete next[layer.id];
        return next;
      });
      if (activeLayer?.id === layer.id) {
        setActiveLayer(null);
        setLocations([]);
        setSelectedPin(null);
      }
      setNotice(`Se eliminó la capa “${layer.name}”.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo eliminar la capa.");
    }
  }

  function openLocationForm(position: Coordinates, address = "") {
    if (!activeLayer) {
      setError("Primero crea y selecciona una capa.");
      return;
    }
    setError("");
    setNotice("");
    setPendingPosition(position);
    setLocationForm({ ...EMPTY_LOCATION, address });
  }

  async function createLocation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeLayer || !pendingPosition) return;
    setSaving(true);
    setError("");
    try {
      const created = await api.layers.addLocation(activeLayer.id, {
        ...locationForm,
        name: locationForm.name.trim(),
        address: locationForm.address.trim(),
        notes: locationForm.notes.trim(),
        latitude: pendingPosition.lat,
        longitude: pendingPosition.lng,
      });
      setLocations((current) => [...current, created]);
      setLayers((current) => current.map((layer) => layer.id === activeLayer.id
        ? { ...layer, _count: { locations: layer._count.locations + 1 } }
        : layer));
      setPendingPosition(null);
      setNotice(`Se agregó “${created.name}” a ${activeLayer.name}.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo guardar la ubicación.");
    } finally {
      setSaving(false);
    }
  }

  async function moveLocation(location: LocationPin, position: Coordinates) {
    setError("");
    const previous = { latitude: location.latitude, longitude: location.longitude };
    setLocations((current) => current.map((item) => item.id === location.id
      ? { ...item, latitude: position.lat, longitude: position.lng }
      : item));
    try {
      await api.layers.updateLocation(location.id, {
        name: location.name,
        address: location.address ?? "",
        category: location.category,
        notes: location.notes ?? "",
        latitude: position.lat,
        longitude: position.lng,
      });
      setNotice(`Se actualizó la ubicación “${location.name}”.`);
    } catch (cause) {
      setLocations((current) => current.map((item) => item.id === location.id
        ? { ...item, ...previous }
        : item));
      setError(cause instanceof Error ? cause.message : "No se pudo actualizar la ubicación.");
    }
  }

  async function deleteLocation(location: LocationPin) {
    if (!window.confirm(`¿Eliminar la ubicación “${location.name}”?`)) return;
    setError("");
    try {
      await api.layers.removeLocation(location.id);
      setLocations((current) => current.filter((item) => item.id !== location.id));
      setLayers((current) => current.map((layer) => layer.id === location.layerId
        ? { ...layer, _count: { locations: Math.max(0, layer._count.locations - 1) } }
        : layer));
      setSelectedPin(null);
      setNotice(`Se eliminó “${location.name}”.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo eliminar la ubicación.");
    }
  }

  async function searchAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!search.trim() || !isLoaded) return;
    setSearching(true);
    setError("");
    try {
      const { coordinates: position, formattedAddress } = await api.places.geocode(search.trim());
      setCenter(position);
      mapRef.current?.panTo(position);
      mapRef.current?.setZoom(17);
      openLocationForm(position, formattedAddress || search.trim());
    } catch (cause) {
      setError(cause instanceof Error
        ? cause.message
        : "No se pudo buscar la dirección.");
    } finally {
      setSearching(false);
    }
  }

  function closeLayerModal() {
    setLayerModalOpen(false);
    setLayerForm(EMPTY_LAYER);
  }

  const mapError = error || (loadError ? "No se pudo cargar Google Maps. Revisa la clave y los permisos de Maps JavaScript API." : "");

  return (
    <AppShell
      active="layers"
      title="Mis capas y ubicaciones"
      subtitle="Guarda y organiza tus locales por proyecto"
      scoreLabel="Total ubicaciones"
      score={totalLocations}
      actions={
        <>
          <button type="button" className="btn-secondary" onClick={() => setLayerModalOpen(true)}>
            <FolderPlus size={16} /> Nueva capa
          </button>
          <button type="button" className="btn-primary" disabled={!activeLayer}
            onClick={() => openLocationForm(mapRef.current?.getCenter()?.toJSON() ?? center)}>
            <Plus size={16} /> Agregar ubicación
          </button>
        </>
      }
    >
      <div className="capas-container">
        <aside className="capas-sidebar">
          <div className="cs-head">
            <h3><Layers3 size={18} /> Mis capas</h3>
            <span className="count">{layers.length}</span>
          </div>
          <div className="cs-list">
            {loading && <div className="cs-empty">Cargando capas…</div>}
            {!loading && layers.length === 0 && (
              <div className="cs-empty">Aún no tienes capas.<br />Crea la primera para empezar.</div>
            )}
            {layers.map((layer) => (
              <div key={layer.id} className={`capa-item${activeLayer?.id === layer.id ? " active" : ""}`}
                style={{ borderLeftColor: activeLayer?.id === layer.id ? layer.color : undefined }}>
                <div className="ci-header">
                  <button type="button" className="capa-main" onClick={() => void selectLayer(layer)}>
                    <span className="ci-title">
                      <span className="ci-dot" style={{ background: layer.color }} />
                      {layer.name}
                    </span>
                    <span className="ci-meta">{layer.description || "Sin descripción"} · {layer._count.locations} ubicaciones</span>
                  </button>
                  <div className="ci-actions">
                    <button type="button" className={`ci-icon-btn${visibility[layer.id] === false ? " off" : ""}`}
                      title={visibility[layer.id] === false ? "Mostrar capa" : "Ocultar capa"}
                      aria-label={visibility[layer.id] === false ? "Mostrar capa" : "Ocultar capa"}
                      onClick={() => setVisibility((current) => ({ ...current, [layer.id]: current[layer.id] === false }))}>
                      {visibility[layer.id] === false ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                    <button type="button" className="ci-icon-btn delete" title="Eliminar capa"
                      aria-label="Eliminar capa" onClick={() => void deleteLayer(layer)}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {activeLayer && (
            <div className="cs-stats">
              <div className="cs-stats-title"><MapPin size={14} /> Estadísticas</div>
              <div className="cs-stats-grid">
                <div className="stat-tile">
                  <span className="st-icon">📍</span><span className="st-name">Total</span>
                  <span className="st-count">{locations.length}</span>
                </div>
                {CATEGORIES.filter((category) => locations.some((location) => location.category === category.value)).map((category) => (
                  <div className="stat-tile" key={category.value}>
                    <span className="st-icon">{category.emoji}</span>
                    <span className="st-name">{category.label}</span>
                    <span className="st-count">{locations.filter((location) => location.category === category.value).length}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        <main className="capas-map">
          {!MAPS_KEY ? (
            <div className="map-message" role="alert">Falta VITE_GOOGLE_MAPS_API_KEY en frontend/.env.</div>
          ) : loadError ? (
            <div className="map-message" role="alert">{mapError}</div>
          ) : !isLoaded ? (
            <div className="map-message" role="status">Cargando Google Maps…</div>
          ) : (
            <GoogleMap
              mapContainerStyle={MAP_STYLE}
              mapContainerClassName="capas-map-canvas"
              center={center}
              zoom={13}
              options={{
                clickableIcons: false,
                fullscreenControl: true,
                mapTypeControl: false,
                streetViewControl: false,
                zoomControl: true,
                gestureHandling: "greedy",
                styles: [
                  { elementType: "geometry", stylers: [{ color: "#f4f7f8" }] },
                  { elementType: "labels.text.fill", stylers: [{ color: "#5a6d73" }] },
                  { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
                  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#e8f0ec" }] },
                  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
                  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#e2e9eb" }] },
                  { featureType: "water", elementType: "geometry", stylers: [{ color: "#d4e3e8" }] },
                ],
              }}
              onLoad={(map) => { mapRef.current = map; }}
              onUnmount={() => { mapRef.current = null; }}
              onClick={(event) => {
                const position = event.latLng?.toJSON();
                if (!position) return;
                setCenter(position);
                openLocationForm(position);
              }}
            >
              {activeLayer && (
                <Circle center={center} radius={800} options={{
                  clickable: false,
                  fillColor: activeLayer.color,
                  fillOpacity: 0.07,
                  strokeColor: activeLayer.color,
                  strokeOpacity: 0.65,
                  strokeWeight: 1.5,
                  visible: visibility[activeLayer.id] !== false,
                }} />
              )}
              {visibleLocations.map((location) => {
                const category = CATEGORIES.find((item) => item.value === location.category) ?? CATEGORIES[CATEGORIES.length - 1];
                return (
                  <Marker
                    key={location.id}
                    position={{ lat: location.latitude, lng: location.longitude }}
                    title={location.name}
                    draggable
                    icon={{
                      path: google.maps.SymbolPath.CIRCLE,
                      scale: selectedPin === location.id ? 10 : 8,
                      fillColor: activeLayer?.color ?? "#3a9aa3",
                      fillOpacity: 1,
                      strokeColor: "#ffffff",
                      strokeWeight: 2,
                    }}
                    onClick={() => setSelectedPin(location.id)}
                    onDragEnd={(event) => {
                      const position = event.latLng?.toJSON();
                      if (position) void moveLocation(location, position);
                    }}
                  >
                    {selectedPin === location.id && (
                      <InfoWindow onCloseClick={() => setSelectedPin(null)}>
                        <div className="layer-info-window">
                          <strong>{category.emoji} {location.name}</strong>
                          <span>{category.label}</span>
                          {location.address && <span>{location.address}</span>}
                          {location.notes && <p>{location.notes}</p>}
                          <small>Arrastra el marcador para moverlo</small>
                          <button type="button" onClick={() => void deleteLocation(location)}>Eliminar ubicación</button>
                        </div>
                      </InfoWindow>
                    )}
                  </Marker>
                );
              })}
            </GoogleMap>
          )}

          <form className="map-search-capas" onSubmit={searchAddress}>
            <Search size={16} />
            <input value={search} onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar dirección en Bogotá..." autoComplete="off" aria-label="Buscar dirección" />
            <button type="submit" aria-label="Buscar dirección" disabled={!isLoaded || searching || !search.trim()}>
              <Search size={16} />
            </button>
          </form>

          <div className="capas-hint" role="status">
            <MapPin size={18} />
            {!activeLayer
              ? "Crea o selecciona una capa para empezar"
              : visibleLocations.length === 0
                ? "Haz clic en el mapa o busca una dirección para marcar"
                : "Arrastra los pines para mover las ubicaciones"}
          </div>

          <div className="capa-info">
            <div className="ci-label">Capa activa</div>
            <div className="ci-name">{activeLayer?.name ?? "Ninguna"}</div>
            <div className="ci-count"><span>{locations.length}</span> ubicaciones</div>
          </div>

          <div className="map-legend-capas">
            <div className="leg-item"><MapPin size={14} /> Clic en el mapa</div>
            <div className="leg-item"><span className="move-icon">↔</span> Arrastra pines para mover</div>
            <div className="leg-item"><EyeOff size={14} /> Toggle visibilidad</div>
          </div>

          {(mapError || notice) && (
            <div className={`layers-toast${mapError ? " error" : ""}`} role={mapError ? "alert" : "status"}>
              {mapError || notice}
            </div>
          )}
        </main>
      </div>

      {layerModalOpen && (
        <div className="modal show" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeLayerModal();
        }}>
          <div className="modal-content">
            <div className="modal-head">
              <h3><FolderPlus size={20} /> Nueva capa</h3>
              <button type="button" className="modal-close" aria-label="Cerrar" onClick={closeLayerModal}>
                <X size={17} />
              </button>
            </div>
            <form onSubmit={createLayer}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label" htmlFor="layer-name">Nombre del proyecto</label>
                  <input id="layer-name" className="form-input" value={layerForm.name} maxLength={80}
                    required placeholder="Ej: Proyecto Bogotá 2026"
                    onChange={(event) => setLayerForm((value) => ({ ...value, name: event.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="layer-description">Descripción (opcional)</label>
                  <textarea id="layer-description" className="form-textarea" rows={3} maxLength={500}
                    value={layerForm.description} placeholder="Ej: Locales objetivo en la Zona Rosa"
                    onChange={(event) => setLayerForm((value) => ({ ...value, description: event.target.value }))} />
                </div>
                <div className="form-group">
                  <span className="form-label">Color de la capa</span>
                  <div className="color-picker" role="group" aria-label="Color de la capa">
                    {LAYER_COLORS.map((color) => (
                      <button key={color} type="button" className={`color-btn${layerForm.color === color ? " selected" : ""}`}
                        aria-label={`Color ${color}`} aria-pressed={layerForm.color === color}
                        style={{ background: color }}
                        onClick={() => setLayerForm((value) => ({ ...value, color }))} />
                    ))}
                  </div>
                </div>
                {error && <div className="form-error" role="alert">{error}</div>}
                <div className="modal-actions">
                  <button type="button" className="btn btn-ghost" onClick={closeLayerModal}>Cancelar</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    <Plus size={16} />{saving ? "Guardando…" : "Crear capa"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {pendingPosition && activeLayer && (
        <div className="modal show" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setPendingPosition(null);
        }}>
          <div className="modal-content">
            <div className="modal-head">
              <h3><MapPin size={20} /> Nueva ubicación</h3>
              <button type="button" className="modal-close" aria-label="Cerrar" onClick={() => setPendingPosition(null)}>
                <X size={17} />
              </button>
            </div>
            <form onSubmit={createLocation}>
              <div className="modal-body">
                <p className="location-layer-name">Se guardará en {activeLayer.name}</p>
                <div className="form-group">
                  <label className="form-label" htmlFor="location-name">Nombre</label>
                  <input id="location-name" autoFocus required maxLength={120} className="form-input"
                    value={locationForm.name} placeholder="Nombre del sitio"
                    onChange={(event) => setLocationForm((value) => ({ ...value, name: event.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="location-address">Dirección</label>
                  <input id="location-address" maxLength={300} className="form-input"
                    value={locationForm.address} placeholder="Dirección (opcional)"
                    onChange={(event) => setLocationForm((value) => ({ ...value, address: event.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="location-category">Categoría</label>
                  <select id="location-category" className="form-select" value={locationForm.category}
                    onChange={(event) => setLocationForm((value) => ({ ...value, category: event.target.value as LayerCategory }))}>
                    {CATEGORIES.map((category) => <option key={category.value} value={category.value}>{category.emoji} {category.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="location-notes">Notas</label>
                  <textarea id="location-notes" className="form-textarea" rows={3} maxLength={1000}
                    value={locationForm.notes} placeholder="Notas (opcional)"
                    onChange={(event) => setLocationForm((value) => ({ ...value, notes: event.target.value }))} />
                </div>
                <div className="modal-coordinates">
                  Coordenadas: {pendingPosition.lat.toFixed(6)}, {pendingPosition.lng.toFixed(6)}
                </div>
                {error && <div className="form-error" role="alert">{error}</div>}
                <div className="modal-actions">
                  <button type="button" className="btn btn-ghost" onClick={() => setPendingPosition(null)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? "Guardando…" : "Guardar ubicación"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
