import { useCallback, useRef, useState } from "react";
import { BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { MapView, type Layers } from "@/components/dashboard/MapView";
import { useAuth } from "@/hooks/useAuth";
import { api, ApiError } from "@/lib/api";
import type { AnalysisResult, BusinessType, Coordinates } from "@/types";

const DEFAULT_COORDS: Coordinates = { lat: 4.6768, lng: -74.0483 };
const RADIUS = 800;
const BUSINESS_LABEL: Record<BusinessType, string> = {
  cafe: "Cafetería",
  restaurant: "Restaurante",
  bakery: "Panadería",
  pharmacy: "Farmacia",
  gym: "Gimnasio",
  supermarket: "Supermercado",
};

export function Dashboard() {
  const { user } = useAuth();
  const [center, setCenter] = useState<Coordinates>(DEFAULT_COORDS);
  const [businessType, setBusinessType] = useState<BusinessType>("cafe");
  const [label, setLabel] = useState("Selecciona una ubicación");
  const [hasSelection, setHasSelection] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [layers, setLayers] = useState<Layers>({ heat: true, iso: true, comp: true });
  const analysisRequest = useRef(0);

  const toggleLayer = useCallback((key: keyof Layers) => {
    setLayers((current) => ({ ...current, [key]: !current[key] }));
  }, []);

  const runAnalysis = useCallback(async (coordinates: Coordinates, type: BusinessType, siteLabel: string) => {
    const requestId = ++analysisRequest.current;
    setError("");
    setLoading(true);
    try {
      const analysis = await api.analysis.create({
        coordinates,
        businessType: type,
        radiusMeters: RADIUS,
        weights: { footTraffic: 35, competition: 25, demographics: 25, accessibility: 15 },
        label: siteLabel,
      });
      if (requestId !== analysisRequest.current) return;
      localStorage.setItem("sitial_last_analysis_v2", JSON.stringify(analysis));
      setResult(analysis);
      setSelectedId(null);
    } catch (cause) {
      if (requestId !== analysisRequest.current) return;
      setError(cause instanceof ApiError
        ? cause.message
        : "No se pudo completar el análisis. Intenta de nuevo.");
      setResult(null);
    } finally {
      if (requestId === analysisRequest.current) setLoading(false);
    }
  }, []);

  const handleCenterChange = useCallback((next: Coordinates) => {
    const nextLabel = `${next.lat.toFixed(4)}, ${next.lng.toFixed(4)}`;
    setCenter(next);
    setHasSelection(true);
    setLabel(nextLabel);
    setSelectedId(null);
    void runAnalysis(next, businessType, nextLabel);
  }, [businessType, runAnalysis]);

  function handleBusinessTypeChange(type: BusinessType) {
    setBusinessType(type);
    setSelectedId(null);
    if (hasSelection) void runAnalysis(center, type, label);
  }

  async function handleAnalyze() {
    if (!hasSelection) return;
    await runAnalysis(center, businessType, label);
  }

  const contextTitle = result?.label ?? (hasSelection ? label : "Selecciona una ubicación");
  const contextSubtitle = result
    ? `${BUSINESS_LABEL[result.businessType]} · Radio ${result.radiusMeters} m · ${result.competitors.length} competidores`
    : hasSelection
      ? `${BUSINESS_LABEL[businessType]} · Radio ${RADIUS} m · Lista para analizar`
      : `${user?.fullName ?? "Sitial"} · Haz clic en el mapa para comenzar el análisis`;

  return (
    <AppShell
      active="home"
      title={contextTitle}
      subtitle={contextSubtitle}
      scoreLabel="Idoneidad comercial"
      score={result
        ? result.overallScore === null ? "N/D" : <>{result.overallScore}<span> / 100</span></>
        : "--"}
      actions={
        <>
          <button type="button" className="btn-primary" onClick={() => void handleAnalyze()}
            disabled={!hasSelection || loading}>
            <BarChart3 size={16} />{loading ? "Analizando…" : "Analizar"}
          </button>
          {result && <Link className="btn-primary" to="/app/analisis">Ver análisis completo</Link>}
        </>
      }
    >
      <MapView
        center={center}
        radiusMeters={RADIUS}
        result={result}
        loading={loading}
        error={error}
        hasSelection={hasSelection}
        businessType={businessType}
        layers={layers}
        onToggleLayer={toggleLayer}
        onBusinessTypeChange={handleBusinessTypeChange}
        onCenterChange={handleCenterChange}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
    </AppShell>
  );
}
