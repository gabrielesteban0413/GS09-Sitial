import { Link, useLocation } from "react-router-dom";
import { Home, BarChart2, Layers, FileText, LogOut } from "lucide-react";

export function Sidebar() {
    const { pathname } = useLocation();
    const items = [
        { path: "/app", icon: Home, label: "Inicio" },
        { path: "/app/analisis", icon: BarChart2, label: "Análisis" },
        { path: "/app/capas", icon: Layers, label: "Capas" },
        { path: "/app/documentacion", icon: FileText, label: "Docs" }
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-brand">S</div>
            {items.map(it => (
                <Link key={it.path} to={it.path} className={`sidebar-item ${pathname === it.path ? "active" : ""}`}>
                    <it.icon size={20} />
                    <span>{it.label}</span>
                </Link>
            ))}
            <div style={{ flex: 1 }} />
            <Link to="/login" className="sidebar-item" onClick={() => localStorage.clear()}>
                <LogOut size={20} />
                <span>Salir</span>
            </Link>
        </aside>
    );
}