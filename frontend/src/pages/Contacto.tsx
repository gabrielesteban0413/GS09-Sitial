import "@/styles/legal.css";

export function Contacto() {
    return (
        <div>
            <section className="legal-hero">
                <div className="container">
                    <span className="eyebrow">Contacto</span>
                    <h1>Hablemos</h1>
                    <p className="legal-lead">¿Tienes preguntas sobre Sitial? ¿Quieres una demo personalizada? Escríbenos y te responderemos en menos de 24 horas hábiles.</p>
                </div>
            </section>

            <section className="legal-content">
                <div className="container">
                    <div className="contact-grid">
                        <div className="contact-card">
                            <h3>Email general</h3>
                            <p><a href="mailto:contacto@sitial.app">contacto@sitial.app</a></p>
                            <p className="muted">Para consultas generales, prensa y partnerships.</p>
                        </div>
                        <div className="contact-card">
                            <h3>Ventas</h3>
                            <p><a href="mailto:ventas@sitial.app">ventas@sitial.app</a></p>
                            <p className="muted">Para empresas, franquicias y planes Enterprise.</p>
                        </div>
                        <div className="contact-card">
                            <h3>Soporte técnico</h3>
                            <p><a href="mailto:soporte@sitial.app">soporte@sitial.app</a></p>
                            <p className="muted">Si ya eres cliente y necesitas ayuda con la plataforma.</p>
                        </div>
                        <div className="contact-card">
                            <h3>Legal</h3>
                            <p><a href="mailto:legal@sitial.app">legal@sitial.app</a></p>
                            <p className="muted">Para asuntos legales, privacidad y cumplimiento.</p>
                        </div>
                    </div>

                    <h2>Oficina</h2>
                    <p>Bogotá, Colombia<br />Calle 100 # 19-54, Oficina 802<br />Lunes a viernes, 9:00 a 18:00 (COT)</p>
                </div>
            </section>
        </div>
    );
}