import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ArrowLeft, Download, FileText } from "lucide-react";
import type { AnalysisResult, ThreatLevel } from "@/types";
import "@/styles/dashboard.css";

export function Analysis() {
    const [data, setData] = useState<AnalysisResult | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const stored = localStorage.getItem("sitial_last_analysis");
        if (stored) setData(JSON.parse(stored));
    }, []);

    if (!data) {
        return (
            <div className="analisis-bg" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh" }}>
                <FileText size={48} color="var(--border-2)" style={{ marginBottom: 16 }} />
                <h2 style={{ fontSize: 22, fontWeight: 800 }}>Sin análisis activo</h2>
                <p style={{ color: "var(--text-3)", marginBottom: 24 }}>Ve al mapa y selecciona una ubicación para analizar.</p>
                <button className="btn btn-primary" onClick={() => navigate("/app")}><ArrowLeft size={16} /> Ir al mapa</button>
            </div>
        );
    }

    const chartData = data.metrics.map(m => ({ name: m.name, value: m.value }));

    return (
        <div className="analisis-bg">
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
                    <button className="btn btn-secondary" onClick={() => navigate("/app")}><ArrowLeft size={16} /> Volver al mapa</button>
                    <button className="btn btn-primary" onClick={() => window.print()}><Download size={16} /> Descargar PDF</button>
                </div>

                <div className="glass-panel" style={{ padding: 32, marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", background: "linear-gradient(135deg, var(--teal-700), var(--teal-900))", color: "white" }}>
                    <div>
                        <div style={{ fontSize: 12, textTransform: "uppercase", opacity: 0.7, letterSpacing: "0.1em" }}>Análisis de Ubicación</div>
                        <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0 }}>{data.label || "Ubicación Seleccionada"}</h1>
                    </div>
                    <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 52, fontWeight: 800, lineHeight: 1 }}>{data.overallScore}</div>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>{data.verdict === "optimal" ? "Óptimo" : data.verdict === "review" ? "Revisar" : "Descartar"}</div>
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
                    <div className="glass-panel" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>Métricas de Decisión</h3>
                        <div style={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="var(--teal-500)" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="glass-panel" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>Resumen</h3>
                        <div style={{ padding: 16, background: "var(--teal-50)", borderRadius: 8, marginBottom: 12 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)" }}>RIESGO</div>
                            <div style={{ fontSize: 20, fontWeight: 800, color: "var(--teal-700)" }}>{data.overallScore >= 75 ? "Bajo" : data.overallScore >= 55 ? "Medio" : "Alto"}</div>
                        </div>
                        <div style={{ padding: 16, background: "#fef3c7", borderRadius: 8 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "#92400e" }}>ROI ESTIMADO</div>
                            <div style={{ fontSize: 20, fontWeight: 800, color: "#92400e" }}>{Math.max(6, Math.round(24 - data.overallScore / 6))} meses</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}