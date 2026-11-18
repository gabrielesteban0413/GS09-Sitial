import { Clock3, Headphones, Mail, MapPin, MessageCircle, MoveUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import "@/styles/legal.css";

const CONTACT_CHANNELS = [
    {
        Icon: Mail,
        title: "Consultas generales",
        email: "contacto@sitial.app",
        description: "Preguntas sobre Sitial, prensa y alianzas.",
        tone: "teal",
    },
    {
        Icon: MessageCircle,
        title: "Ventas y planes",
        email: "ventas@sitial.app",
        description: "Opciones para empresas, franquicias y equipos.",
        tone: "plum",
    },
    {
        Icon: Headphones,
        title: "Soporte técnico",
        email: "soporte@sitial.app",
        description: "Ayuda con tu cuenta y el uso de la plataforma.",
        tone: "plum",
    },
    {
        Icon: MapPin,
        title: "Asuntos legales",
        email: "legal@sitial.app",
        description: "Privacidad, cumplimiento y solicitudes legales.",
        tone: "teal",
    },
];

export function Contacto() {
    return (
        <main className="contact-page">
            <section className="legal-hero contact-hero">
                <div className="container contact-hero-inner">
                    <span className="eyebrow">SITIAL / CONTACTO</span>
                    <h1>Conectemos tu próxima idea con el lugar indicado.</h1>
                    <p className="legal-lead">Cuéntanos qué estás explorando. Nuestro equipo puede orientarte sobre la plataforma, las cuentas y las opciones para tu negocio.</p>
                    <div className="contact-coordinate-row" aria-label="Coordenadas decorativas">
                        <span>04°39′ N</span><i /><span>74°05′ O</span><i /><span>BOGOTÁ · COLOMBIA</span>
                    </div>
                </div>
            </section>

            <section className="legal-content contact-content">
                <div className="container">
                    <div className="contact-grid">
                        {CONTACT_CHANNELS.map(({ Icon, title, email, description, tone }, index) => (
                            <article className={`contact-card contact-card-${tone}`} key={email}>
                                <div className="contact-card-top">
                                    <span className="contact-card-icon"><Icon size={19} /></span>
                                    <span className="contact-card-index">0{index + 1} / CANAL</span>
                                </div>
                                <h2>{title}</h2>
                                <p className="contact-card-description">{description}</p>
                                <a className="contact-email" href={`mailto:${email}`}>
                                    {email}<MoveUpRight size={15} />
                                </a>
                            </article>
                        ))}
                    </div>

                    <section className="contact-office">
                        <div className="contact-office-map" aria-hidden="true">
                            <div className="contact-map-grid" />
                            <div className="contact-map-orbit" />
                            <span className="contact-map-pin"><MapPin size={20} /></span>
                            <span className="contact-map-coordinate">CARTOGRAFÍA<br />BOGOTÁ / CO</span>
                            <span className="contact-map-label">BOGOTÁ / CO</span>
                        </div>
                        <div className="contact-office-copy">
                            <span className="contact-kicker">PUNTO DE CONTACTO / 01</span>
                            <h2>Estamos en Bogotá.</h2>
                            <p>Calle 100 # 19-54, Oficina 802<br />Bogotá, Colombia</p>
                            <span className="contact-hours"><Clock3 size={15} /> Lunes a viernes · 9:00 a 18:00 COT</span>
                            <Link to="/nosotros" className="contact-about-link">Conoce más sobre Sitial <MoveUpRight size={15} /></Link>
                        </div>
                    </section>
                </div>
            </section>
        </main>
    );
}