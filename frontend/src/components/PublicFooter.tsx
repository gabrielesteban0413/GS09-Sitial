import { Link } from "react-router-dom";
import "@/styles/public.css";

export function PublicFooter() {
    return (
        <footer className="site-footer">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <Link to="/" className="site-brand">
                            <span className="brand-mark">
                                <img src="/assets/images/logos/logo.png" alt="" />
                            </span>
                            <span>Sitial</span>
                        </Link>
                        <p>Explora ubicaciones, consulta negocios cercanos y organiza tus alternativas en el mapa.</p>
                    </div>
                    <div className="footer-col">
                        <h4>Producto</h4>
                        <a href="/#funciones">Funciones</a>
                        <a href="/#como-funciona">Cómo funciona</a>
                        <a href="/#datos">Datos</a>
                        <Link to="/app">Dashboard</Link>
                    </div>
                    <div className="footer-col">
                        <h4>Compañía</h4>
                        <Link to="/nosotros">Sobre nosotros</Link>
                        <Link to="/contacto">Contacto</Link>
                    </div>
                    <div className="footer-col">
                        <h4>Legal</h4>
                        <Link to="/terminos">Términos y condiciones</Link>
                        <Link to="/privacidad">Política de privacidad</Link>
                        <Link to="/cookies">Política de cookies</Link>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2026 Sitial. Todos los derechos reservados.</p>
                    <p>Hecho en Bogotá, Colombia</p>
                </div>
            </div>
        </footer>
    );
}