import type { ReactNode } from "react";
import { BarChart2, Home, Layers, LogOut, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import "@/styles/dashboard.css";

type AppSection = "home" | "analysis" | "layers" | "documentation";

interface AppShellProps {
  active: AppSection;
  title: string;
  subtitle: string;
  scoreLabel?: string;
  score?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}

const NAV_ITEMS: { section: AppSection; path: string; label: string; Icon: typeof Home }[] = [
  { section: "home", path: "/app", label: "Inicio", Icon: Home },
  { section: "analysis", path: "/app/analisis", label: "Análisis", Icon: BarChart2 },
  { section: "layers", path: "/app/capas", label: "Capas", Icon: Layers },
];

export function AppShell({
  active,
  title,
  subtitle,
  scoreLabel,
  score,
  actions,
  children,
}: AppShellProps) {
  const { logout } = useAuth();

  return (
    <div className="app">
      <aside className="nav" aria-label="Principal">
        <Link to="/app" className="nav-brand" aria-label="Sitial, inicio">
          <MapPin size={23} fill="currentColor" />
        </Link>
        {NAV_ITEMS.map(({ section, path, label, Icon }) => (
          <Link
            key={section}
            to={path}
            className={`nav-item${active === section ? " active" : ""}`}
            aria-current={active === section ? "page" : undefined}
          >
            <Icon size={20} />
            <span>{label}</span>
          </Link>
        ))}
        <div className="nav-spacer" />
        <button
          type="button"
          className="nav-item"
          onClick={() => {
            if (window.confirm("¿Cerrar sesión?")) void logout();
          }}
        >
          <LogOut size={20} />
          <span>Salir</span>
        </button>
      </aside>

      <header className="header">
        <div className="header-context">
          <div className="name">{title}</div>
          <div className="meta">{subtitle}</div>
        </div>
        <div className="header-spacer" />
        {score !== undefined && (
          <div className="header-balance" aria-live="polite">
            <div className="lbl">{scoreLabel}</div>
            <div className="val">{score}</div>
          </div>
        )}
        {actions && <div className="header-actions">{actions}</div>}
      </header>

      <main className="app-content">{children}</main>
    </div>
  );
}
