import { Link } from "react-router-dom";
import "@/styles/public.css";

export function PublicHeader() {
    return (
        <header className="site-header">
            <div className="header-inner">
                <Link to="/" className="site-brand">
                    <span className="brand-mark">S</span>
                    <span>Sitial</span>
                </Link>
                <nav className="site-nav">
                    <a href="/#caracteristicas">Características</a>
                    <a href="/#precios">Precios</a>
                    <Link to="/nosotros">Nosotros</Link>
                    <Link to="/contacto">Contacto</Link>
                </nav>
                <div className="site-actions">
                    <Link to="/login" className="btn btn-ghost">Iniciar sesión</Link>
                    <Link to="/register" className="btn btn-primary">Registrar</Link>
                </div>
            </div>
        </header>
    );
}