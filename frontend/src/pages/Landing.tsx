import { Link } from "react-router-dom";
import "@/styles/public.css";

export function Landing() {
    return (
        <div>
            <section className="hero">
                <div className="container">
                    <span style={{ display: "inline-block", padding: "6px 16px", borderRadius: 100, background: "rgba(255,255,255,0.72)", color: "var(--teal-700)", fontSize: 12, fontWeight: 700, textTransform: "uppercase", marginBottom: 28 }}>Location Intelligence Platform</span>
                    <h1>Elige la mejor ubicación para tu próximo <em>local</em></h1>
                    <p className="lead">Combina afluencia peatonal, competencia local y demografía en un solo score. Analiza cualquier dirección en segundos y decide dónde abrir tu negocio con datos, no con corazonadas.</p>
                    <div className="hero-actions">
                        <Link to="/register" className="btn btn-primary btn-lg">Empezar gratis</Link>
                        <Link to="/login" className="btn btn-outline btn-lg">Iniciar sesión</Link>
                    </div>
                    <div className="hero-stats">
                        <div className="stat"><b>+2.500</b><span>Análisis realizados</span></div>
                        <div className="stat"><b>+180</b><span>Negocios abiertos</span></div>
                        <div className="stat"><b>4.8/5</b><span>Satisfacción</span></div>
                        <div className="stat"><b>+15</b><span>Ciudades LATAM</span></div>
                    </div>
                </div>
            </section>

            <section className="section" id="caracteristicas">
                <div className="container">
                    <div className="section-head">
                        <span className="eyebrow">Características</span>
                        <h2>Todo lo que necesitas para elegir bien</h2>
                    </div>
                    <div className="features-grid">
                        <div className="feature-card"><h3>Mapa interactivo</h3><p>Haz clic en cualquier dirección y obtén un análisis completo en segundos.</p></div>
                        <div className="feature-card"><h3>Análisis competitivo</h3><p>Detectamos automáticamente todos los competidores cercanos con Google Places.</p></div>
                        <div className="feature-card"><h3>Demografía inteligente</h3><p>Analizamos la densidad poblacional, ingresos promedio y perfil del consumidor.</p></div>
                    </div>
                </div>
            </section>

            <section className="section section-alt" id="como-funciona">
                <div className="container">
                    <div className="section-head">
                        <span className="eyebrow">Cómo funciona</span>
                        <h2>3 pasos para decidir con datos</h2>
                    </div>
                    <div className="steps">
                        <div className="step"><div className="step-num">01</div><h3>Marca la ubicación</h3><p>Haz clic en el mapa o busca una dirección.</p></div>
                        <div className="step"><div className="step-num">02</div><h3>Configura el análisis</h3><p>Elige el tipo de negocio y el radio de análisis.</p></div>
                        <div className="step"><div className="step-num">03</div><h3>Obtén tu score</h3><p>Recibe un veredicto inmediato con competidores y recomendación.</p></div>
                    </div>
                </div>
            </section>

            <section className="section" id="precios">
                <div className="container">
                    <div className="section-head">
                        <span className="eyebrow">Precios</span>
                        <h2>Planes para cada etapa de tu negocio</h2>
                    </div>
                    <div className="pricing-grid">
                        <div className="pricing-card">
                            <h3>Free</h3><div className="price">$0<span>/mes</span></div>
                            <ul><li>3 análisis al mes</li><li>1 usuario</li><li>Score básico</li></ul>
                            <Link to="/register" className="btn btn-outline btn-block">Empezar gratis</Link>
                        </div>
                        <div className="pricing-card featured">
                            <span className="badge-popular">Más popular</span>
                            <h3>Starter</h3><div className="price">$49<span>/mes</span></div>
                            <ul><li>25 análisis al mes</li><li>3 usuarios</li><li>Score completo + PDF</li></ul>
                            <Link to="/pago?plan=starter" className="btn btn-primary btn-block">Suscribirme ahora</Link>
                        </div>
                        <div className="pricing-card">
                            <h3>Pro</h3><div className="price">$199<span>/mes</span></div>
                            <ul><li>Análisis ilimitados</li><li>Usuarios ilimitados</li><li>API pública</li></ul>
                            <Link to="/pago?plan=pro" className="btn btn-outline btn-block">Suscribirme ahora</Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}