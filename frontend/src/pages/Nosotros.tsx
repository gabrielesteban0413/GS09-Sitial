import { ArrowRight, Compass, Layers3, MapPinned, ScanSearch } from "lucide-react";
import { Link } from "react-router-dom";
import "@/styles/public.css";

const PRINCIPLES = [
    {
        Icon: MapPinned,
        index: "01",
        title: "El lugar importa",
        description: "Ayudamos a explorar una zona y entender qué establecimientos aparecen a su alrededor.",
    },
    {
        Icon: ScanSearch,
        index: "02",
        title: "Contexto antes que promesas",
        description: "Mostramos las fuentes disponibles con claridad y evitamos presentar estimaciones como hechos.",
    },
    {
        Icon: Layers3,
        index: "03",
        title: "Decisiones organizadas",
        description: "Guarda ubicaciones en capas, agrega notas y vuelve a comparar tus alternativas.",
    },
];

export function Nosotros() {
    return (
        <main className="geo-public-page geo-about-page">
            <div className="container about-container">
                <section className="about-hero">
                    <div className="about-hero-copy">
                        <span className="about-eyebrow"><Compass size={14} /> SOBRE SITIAL / 04°39′ N · 74°05′ O</span>
                        <h1>Las buenas decisiones empiezan por entender el lugar.</h1>
                        <p>Sitial es una herramienta para explorar ubicaciones comerciales, consultar establecimientos cercanos y mantener tus alternativas organizadas en un solo mapa.</p>
                        <Link to="/register" className="about-cta">Explorar Sitial <ArrowRight size={16} /></Link>
                    </div>
                    <div className="about-map-art" aria-hidden="true">
                        <div className="about-map-plane" />
                        <div className="about-map-ring about-map-ring-one" />
                        <div className="about-map-ring about-map-ring-two" />
                        <svg viewBox="0 0 500 340" preserveAspectRatio="none">
                            <path d="M40 270 C130 250 110 125 215 155 S330 245 360 125 440 90 475 50" />
                            <circle cx="40" cy="270" r="6" /><circle cx="215" cy="155" r="6" />
                            <circle cx="360" cy="125" r="6" /><circle cx="475" cy="50" r="6" />
                        </svg>
                        <span className="about-map-pin about-map-pin-a"><MapPinned size={17} /></span>
                        <span className="about-map-pin about-map-pin-b"><MapPinned size={17} /></span>
                        <span className="about-map-tag">EXPLORACIÓN URBANA / 01</span>
                        <span className="about-map-coords">4°39′ N<br />74°05′ O</span>
                    </div>
                </section>
                <section className="about-purpose">
                    <span className="contact-kicker">NUESTRO PROPÓSITO / 01</span>
                    <h2>Una vista más clara del entorno comercial.</h2>
                    <p>Elegir dónde abrir o crecer implica muchas preguntas. Reunimos herramientas geográficas y datos de lugares para que puedas investigar cada alternativa con contexto, sin sustituir el criterio ni la validación en terreno.</p>
                </section>
                <section className="about-principles" aria-label="Principios de Sitial">
                    {PRINCIPLES.map(({ Icon, index, title, description }) => (
                        <article className="about-principle" key={index}>
                            <div className="about-principle-top">
                                <span className="about-principle-icon"><Icon size={19} /></span>
                                <span>{index} / PRINCIPIO</span>
                            </div>
                            <h3>{title}</h3>
                            <p>{description}</p>
                        </article>
                    ))}
                </section>
                <section className="about-note">
                    <span className="about-note-pulse" />
                    <p>La información de competencia depende de la disponibilidad de Google Places. Sitial no calcula actualmente afluencia peatonal ni demografía.</p>
                    <Link to="/contacto">Hablemos <ArrowRight size={15} /></Link>
                </section>
            </div>
        </main>
    );
}