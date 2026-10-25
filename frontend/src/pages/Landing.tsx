import {
    ArrowDown,
    ArrowRight,
    Check,
    Layers3,
    MapPin,
    MapPinned,
    Search,
    Store,
} from "lucide-react";
import { Link } from "react-router-dom";
import "@/styles/public.css";
import "@/styles/landing.css";

const FEATURES = [
    {
        Icon: Search,
        title: "Busca por dirección",
        description: "Encuentra un lugar conocido y centra el mapa exactamente donde quieres explorar.",
    },
    {
        Icon: Store,
        title: "Mira quién está cerca",
        description: "Consulta negocios de la categoría que te interesa y revisa su distancia y valoración.",
    },
    {
        Icon: Layers3,
        title: "Guarda tus alternativas",
        description: "Agrupa ubicaciones por proyecto, agrega notas y mantenlas visibles en tus propias capas.",
    },
];

const STEPS = [
    { number: "01", title: "Elige una zona", description: "Busca una dirección o marca un punto en el mapa." },
    { number: "02", title: "Explora el entorno", description: "Consulta establecimientos cercanos para tu categoría." },
    { number: "03", title: "Organiza tus opciones", description: "Guarda los lugares y vuelve a ellos cuando quieras." },
];

const BUSINESS_TYPES = ["Cafeterías", "Restaurantes", "Panaderías", "Farmacias", "Gimnasios", "Supermercados"];

export function Landing() {
    return (
        <main className="landing">
            <section className="hero landing-hero">
                <div className="landing-geo-scene" aria-hidden="true">
                    <div className="landing-geo-halo landing-geo-halo-one" />
                    <div className="landing-geo-halo landing-geo-halo-two" />
                    <div className="landing-geo-plane" />
                    <svg className="landing-geo-route" viewBox="0 0 1000 420" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="geo-route-gradient" x1="0" y1="1" x2="1" y2="0">
                                <stop offset="0%" stopColor="#3a9aa3" stopOpacity="0" />
                                <stop offset="50%" stopColor="#2d7880" stopOpacity=".8" />
                                <stop offset="100%" stopColor="#7d3865" stopOpacity=".15" />
                            </linearGradient>
                        </defs>
                        <path d="M80 345 C240 305 220 180 390 220 S590 325 680 185 830 120 950 65" />
                        <circle cx="80" cy="345" r="5" />
                        <circle cx="390" cy="220" r="5" />
                        <circle cx="680" cy="185" r="5" />
                        <circle cx="950" cy="65" r="5" />
                    </svg>
                    <div className="landing-geo-point landing-geo-point-one">
                        <span className="landing-geo-pin"><MapPin size={15} /></span>
                        <span className="landing-geo-label">Zona comercial <b>01</b></span>
                    </div>
                    <div className="landing-geo-point landing-geo-point-two">
                        <span className="landing-geo-pin"><Store size={14} /></span>
                        <span className="landing-geo-label">Negocios cercanos</span>
                    </div>
                    <div className="landing-geo-point landing-geo-point-three">
                        <span className="landing-geo-pin"><MapPinned size={15} /></span>
                        <span className="landing-geo-label">Ubicación guardada</span>
                    </div>
                    <span className="landing-geo-coordinate landing-geo-coordinate-one">4°39' N · 74°05' O</span>
                    <span className="landing-geo-coordinate landing-geo-coordinate-two">BOGOTÁ / CO</span>
                </div>
                <div className="container landing-hero-content">
                    <span className="landing-hero-badge">
                        <MapPin size={14} />
                        Location Intelligence Platform
                    </span>
                    <h1>Elige la mejor ubicación para tu próximo <em>local</em></h1>
                    <p className="lead">
                        Explora el entorno comercial, consulta negocios cercanos y organiza las zonas que estás evaluando en un solo mapa.
                    </p>
                    <div className="hero-actions">
                        <Link to="/register" className="btn btn-primary btn-lg landing-hero-primary">
                            Empezar gratis <ArrowRight size={17} />
                        </Link>
                        <Link to="/login" className="btn btn-outline btn-lg landing-hero-secondary">
                            Iniciar sesión
                        </Link>
                    </div>
                    <div className="landing-capability-strip" aria-label="Funciones de Sitial">
                        <span><MapPin size={15} /> Mapa interactivo</span>
                        <span><Store size={15} /> Negocios cercanos</span>
                        <span><Layers3 size={15} /> Capas y ubicaciones</span>
                    </div>
                </div>
                <a className="landing-scroll" href="#funciones">
                    Conoce la plataforma <ArrowDown size={14} />
                </a>
            </section>

            <section className="landing-intro" id="funciones">
                <div className="landing-container landing-intro-grid">
                    <div className="landing-intro-image">
                        <img
                            src="/assets/images/auth/auth-hero.jpg"
                            alt="Ilustración de ubicaciones conectadas sobre un mapa"
                            loading="lazy"
                        />
                        <span className="landing-image-label"><MapPinned size={14} /> Exploración de zonas</span>
                        <span className="landing-image-caption">
                            <span className="landing-caption-dot" />
                            El contexto empieza en el mapa
                        </span>
                    </div>
                    <div className="landing-intro-copy">
                        <span className="landing-kicker">Una vista más completa</span>
                        <h2>Conoce la zona antes de decidir dónde estar.</h2>
                        <p>
                            Una dirección es solo el comienzo. Sitial reúne en el mapa los establecimientos cercanos y las ubicaciones que quieres seguir.
                        </p>
                        <ul className="landing-check-list">
                            <li><Check size={16} /> Busca direcciones y explora el mapa.</li>
                            <li><Check size={16} /> Revisa competencia por categoría y distancia.</li>
                            <li><Check size={16} /> Conserva tus lugares y notas en capas.</li>
                        </ul>
                        <Link to="/register" className="landing-inline-link">
                            Explorar Sitial <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </section>

            <section className="landing-features">
                <div className="landing-container">
                    <div className="landing-section-heading">
                        <span className="landing-kicker">Herramientas para explorar</span>
                        <h2>Todo lo importante, en el mismo lugar.</h2>
                        <p>Investiga una ubicación y mantén tus alternativas claras y organizadas.</p>
                    </div>
                    <div className="landing-feature-grid">
                        {FEATURES.map(({ Icon, title, description }, index) => (
                            <article className="landing-feature-card" key={title}>
                                <div className="landing-feature-top">
                                    <span className="landing-feature-icon"><Icon size={21} /></span>
                                    <span className="landing-feature-number">0{index + 1}</span>
                                </div>
                                <h3>{title}</h3>
                                <p>{description}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="landing-categories">
                <div className="landing-container landing-categories-inner">
                    <div>
                        <span className="landing-kicker">Pensado para comercios locales</span>
                        <h2>Empieza con el tipo de negocio que tienes en mente.</h2>
                    </div>
                    <div className="landing-category-list" aria-label="Categorías disponibles">
                        {BUSINESS_TYPES.map((type) => <span key={type}>{type}</span>)}
                    </div>
                </div>
            </section>

            <section className="landing-workflow" id="como-funciona">
                <div className="landing-container">
                    <div className="landing-section-heading">
                        <span className="landing-kicker">Cómo funciona</span>
                        <h2>Tres pasos. Una zona mejor explorada.</h2>
                    </div>
                    <div className="landing-steps">
                        {STEPS.map((step) => (
                            <article className="landing-step" key={step.number}>
                                <span className="landing-step-number">{step.number}</span>
                                <div className="landing-step-rule" aria-hidden="true" />
                                <h3>{step.title}</h3>
                                <p>{step.description}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="landing-data" id="datos">
                <div className="landing-container landing-data-inner">
                    <span className="landing-data-mark"><MapPin size={20} /></span>
                    <div>
                        <span className="landing-kicker">Información clara, decisiones informadas</span>
                        <h2>Siempre sabrás qué datos estás viendo.</h2>
                        <p>
                            La información de competencia depende de los datos disponibles en Google Places. Actualmente Sitial no calcula afluencia peatonal ni demografía.
                        </p>
                    </div>
                    <Link to="/contacto" className="landing-inline-link">
                        Contactar a Sitial <ArrowRight size={16} />
                    </Link>
                </div>
            </section>

            <section className="landing-cta">
                <div className="landing-container landing-cta-inner">
                    <div>
                        <span className="landing-kicker">Tu próxima ubicación empieza aquí</span>
                        <h2>Explora una zona con Sitial.</h2>
                        <p>Abre el mapa, revisa el entorno y guarda tus mejores opciones.</p>
                    </div>
                    <Link to="/register" className="landing-button-cta">
                        Crear mi cuenta <ArrowRight size={17} />
                    </Link>
                </div>
            </section>
        </main>
    );
}
