import { useState } from "react";
import { Plus, MapPin, Trash2 } from "lucide-react";
import "@/styles/dashboard.css";

export function Layers() {
    const [layers, setLayers] = useState([{ id: "1", name: "Mi Proyecto", color: "var(--teal-500)", pins: 0 }]);

    return (
        <div style={{ display: "flex", height: "100vh", background: "var(--bg)" }}>
            <div style={{ width: 280, background: "white", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column" }}>
                <div style={{ padding: 20, borderBottom: "1px solid var(--border)" }}>
                    <h2 style={{ fontSize: 16, fontWeight: 800 }}>Mis Capas</h2>
                    <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 4 }}>Organiza tus locales por proyecto</p>
                </div>
                <div style={{ flex: 1, padding: 12 }}>
                    {layers.map(l => (
                        <div key={l.id} style={{ padding: 12, borderRadius: 8, marginBottom: 8, cursor: "pointer", background: "var(--teal-50)", border: "1px solid var(--teal-200)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{ width: 10, height: 10, borderRadius: "50%", background: l.color }}></div>
                                <span style={{ fontWeight: 600, fontSize: 13 }}>{l.name}</span>
                            </div>
                            <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>{l.pins} ubicaciones</div>
                        </div>
                    ))}
                </div>
            </div>
            <div style={{ flex: 1, position: "relative", display: "grid", placeItems: "center", background: "var(--map-bg)" }}>
                <div style={{ textAlign: "center", color: "var(--text-3)" }}>
                    <MapPin size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
                    <h3 style={{ fontSize: 18, fontWeight: 600, color: "var(--text-2)" }}>Haz clic para agregar un pin</h3>
                    <p style={{ fontSize: 13 }}>Los puntos se guardarán en la capa activa</p>
                </div>
            </div>
        </div>
    );
}