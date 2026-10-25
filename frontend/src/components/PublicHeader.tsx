import { Link } from "react-router-dom";
import "@/styles/public.css";

export function PublicHeader() {
    return (
        <header className="site-header">
            <div className="header-inner">
                <Link to="/" className="site-brand">
                    <span className="brand-mark">
                        <img src="/assets/images/logos/logo.png" alt="" />
                    </span>
                    <span>Sitial</span>
                </Link>
                <nav className="site-nav" aria-label="Navegación principal">
                    <a href="/#funciones">Funciones</a>
                    <a href="/#como-funciona">Cómo funciona</a>
                    <a href="/#datos">Datos</a>
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