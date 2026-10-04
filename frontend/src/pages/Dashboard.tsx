import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { api, ApiError } from "@/lib/api";
import type {
  AnalysisResult, BusinessType, Coordinates, ScoreWeights,
} from "@/types";

const BUSINESS_TYPES: { value: BusinessType; label: string }[] = [
  { value: "cafe", label: "Cafetería" },
  { value: "restaurant", label: "Restaurante" },
  { value: "bakery", label: "Panadería" },
  { value: "pharmacy", label: "Farmacia" },
  { value: "gym", label: "Gimnasio" },
  { value: "supermarket", label: "Supermercado" },
];

const DEFAULT_COORDS: Coordinates = { lat: 4.6768, lng: -74.0483 };
const DEFAULT_WEIGHTS: ScoreWeights = {
  foot_traffic: 35, competition: 25, demographics: 25, accessibility: 15,
};

export function Dashboard() {
  const { user, logout } = useAuth();
  const [businessType, setBusinessType] = useState<BusinessType>("cafe");
  const [label, setLabel] = useState("Zona Rosa · Chapinero");
  const [coords] = useState<Coordinates>(DEFAULT_COORDS);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAnalyze() {
    setError("");
    setLoading(true);
    try {
      const r = await api.analysis.create({
        coordinates: coords,
        business_type: businessType,
        radius_meters: 800,
        weights: DEFAULT_WEIGHTS,
        label,
      });
      setResult(r);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error al analizar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{minHeight:"100vh",background:"#f4f7f8"}}>
      <header style={{
        background:"#fff",borderBottom:"1px solid #e2e9eb",
        padding:"14px 24px",display:"flex",alignItems:"center",gap:"16px"}}>
        <div style={{
          width:"34px",height:"34px",borderRadius:"9px",
          background:"linear-gradient(135deg,#3a9aa3,#2d7880)",
          display:"grid",placeItems:"center",color:"#fff",fontWeight:700}}>
          S
        </div>
        <div style={{flex:1}}>
          <div style={{fontSize:"14px",fontWeight:600}}>Sitial</div>
          <div style={{fontSize:"11px",color:"#8a9a9f"}}>
            {user?.full_name} · {user?.email}
          </div>
        </div>
        <button onClick={logout} style={{
          background:"transparent",border:"1px solid #d5dfe2",
          padding:"8px 16px",borderRadius:"8px",fontSize:"12px",
          color:"#5a6d73",fontWeight:500}}>
          Salir
        </button>
      </header>

      <main style={{padding:"24px",maxWidth:"1100px",margin:"0 auto"}}>
        <h1 style={{fontSize:"22px",fontWeight:700,marginBottom:"20px",
          letterSpacing:"-0.02em"}}>
          Análisis de ubicación
        </h1>

        <div style={{
          background:"#fff",border:"1px solid #e2e9eb",
          borderRadius:"12px",padding:"24px",marginBottom:"20px"}}>
          <div style={{display:"grid",
            gridTemplateColumns:"1fr 1fr auto",gap:"16px",alignItems:"end"}}>
            <div>
              <label style={{display:"block",fontSize:"11.5px",
                fontWeight:600,color:"#5a6d73",marginBottom:"6px"}}>
                Etiqueta del sitio
              </label>
              <input value={label} onChange={(e) => setLabel(e.target.value)}
                style={{width:"100%",height:"40px",padding:"0 14px",
                  borderRadius:"8px",border:"1px solid #d5dfe2",
                  fontSize:"13.5px",outline:"none",background:"#f4f7f8"}} />
            </div>
            <div>
              <label style={{display:"block",fontSize:"11.5px",
                fontWeight:600,color:"#5a6d73",marginBottom:"6px"}}>
                Tipo de negocio
              </label>
              <select value={businessType}
                onChange={(e) => setBusinessType(e.target.value as BusinessType)}
                style={{width:"100%",height:"40px",padding:"0 14px",
                  borderRadius:"8px",border:"1px solid #d5dfe2",
                  fontSize:"13.5px",outline:"none",background:"#f4f7f8"}}>
                {BUSINESS_TYPES.map((b) => (
                  <option key={b.value} value={b.value}>{b.label}</option>
                ))}
              </select>
            </div>
            <button onClick={handleAnalyze} disabled={loading} style={{
              background:"#3a9aa3",color:"#fff",border:"none",
              padding:"0 24px",height:"40px",borderRadius:"8px",
              fontSize:"13px",fontWeight:600,
              cursor:loading ? "not-allowed" : "pointer",
              opacity:loading ? 0.5 : 1}}>
              {loading ? "Analizando..." : "Analizar"}
            </button>
          </div>

          {error && (
            <div style={{background:"rgba(229,104,90,0.12)",color:"#e5685a",
              padding:"10px 14px",borderRadius:"8px",fontSize:"12.5px",
              marginTop:"14px"}}>
              {error}
            </div>
          )}
        </div>

        {result && (
          <>
            <div style={{
              background:"#fff",border:"1px solid #e2e9eb",
              borderRadius:"12px",padding:"24px",marginBottom:"20px",
              display:"grid",gridTemplateColumns:"auto 1fr",gap:"24px",
              alignItems:"center"}}>
              <div style={{
                width:"100px",height:"100px",borderRadius:"50%",
                border:"6px solid #3a9aa3",
                display:"grid",placeItems:"center",
                fontSize:"28px",fontWeight:700,
                fontFamily:"var(--mono)",color:"#0a1f24"}}>
                {result.overall_score}
              </div>
              <div>
                <div style={{fontSize:"12px",fontWeight:700,
                  letterSpacing:"0.08em",textTransform:"uppercase",
                  color:"#2d7880",marginBottom:"6px"}}>
                  {result.verdict === "optimal" ? "Óptimo" :
                   result.verdict === "review" ? "Revisar" : "Descartar"}
                </div>
                <div style={{fontSize:"16px",fontWeight:600,
                  color:"#0a1f24",marginBottom:"4px"}}>
                  {result.label ?? "Análisis"}
                </div>
                <div style={{fontSize:"12px",color:"#8a9a9f"}}>
                  {result.address?.formatted ?? "Sin dirección"}
                </div>
              </div>
            </div>

            <div style={{display:"grid",
              gridTemplateColumns:"1fr 1fr",gap:"20px"}}>
              <div style={{background:"#fff",border:"1px solid #e2e9eb",
                borderRadius:"12px",padding:"24px"}}>
                <h3 style={{fontSize:"13px",fontWeight:700,
                  marginBottom:"16px",letterSpacing:"0.04em",
                  textTransform:"uppercase",color:"#5a6d73"}}>
                  Métricas
                </h3>
                {result.metrics.map((m) => (
                  <div key={m.name} style={{marginBottom:"14px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",
                      fontSize:"12px",marginBottom:"6px"}}>
                      <span style={{color:"#5a6d73"}}>{m.name}</span>
                      <span style={{fontFamily:"var(--mono)",
                        fontWeight:600}}>{m.value}</span>
                    </div>
                    <div style={{height:"5px",background:"#eef4f5",
                      borderRadius:"3px",overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${m.value}%`,
                        background:"#3a9aa3",borderRadius:"3px"}} />
                    </div>
                  </div>
                ))}
              </div>

              <div style={{background:"#fff",border:"1px solid #e2e9eb",
                borderRadius:"12px",padding:"24px"}}>
                <h3 style={{fontSize:"13px",fontWeight:700,
                  marginBottom:"16px",letterSpacing:"0.04em",
                  textTransform:"uppercase",color:"#5a6d73"}}>
                  Competidores ({result.competitors.length})
                </h3>
                <div style={{maxHeight:"280px",overflow:"auto"}}>
                  {result.competitors.map((c) => (
                    <div key={c.place_id} style={{
                      display:"grid",
                      gridTemplateColumns:"32px 1fr auto",
                      gap:"10px",alignItems:"center",
                      padding:"9px 0",
                      borderBottom:"1px solid #e2e9eb",
                      fontSize:"12px"}}>
                      <span style={{
                        width:"26px",height:"26px",
                        display:"grid",placeItems:"center",
                        borderRadius:"6px",fontSize:"10px",
                        fontWeight:600,
                        fontFamily:"var(--mono)",
                        background:c.threat_level === "high"
                          ? "rgba(229,104,90,0.12)" : "#f4f7f8",
                        color:c.threat_level === "high"
                          ? "#e5685a" : "#5a6d73"}}>
                        {c.threat_level === "high" ? "A" :
                         c.threat_level === "medium" ? "M" : "B"}
                      </span>
                      <span style={{color:"#5a6d73",
                        overflow:"hidden",textOverflow:"ellipsis",
                        whiteSpace:"nowrap"}}>
                        {c.name}
                      </span>
                      <span style={{fontFamily:"var(--mono)",
                        fontSize:"11px",color:"#8a9a9f"}}>
                        {c.distance_meters}m
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
