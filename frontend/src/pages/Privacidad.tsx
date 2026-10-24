import "@/styles/legal.css";

export function Privacidad() {
    return (
        <div>
            <section className="legal-hero">
                <div className="container">
                    <span className="eyebrow">Legal</span>
                    <h1>Política de privacidad</h1>
                    <p className="legal-lead">Última actualización: 12 de octubre de 2026</p>
                </div>
            </section>

            <section className="legal-content">
                <div className="container">
                    <h2>1. Responsable del tratamiento</h2>
                    <p>Sitial es el responsable del tratamiento de los datos personales recogidos a través de la plataforma. Puedes contactarnos en <a href="mailto:privacidad@sitial.app">privacidad@sitial.app</a>.</p>

                    <h2>2. Datos que recopilamos</h2>
                    <ul>
                        <li><strong>Datos de registro:</strong> nombre completo, correo electrónico, contraseña cifrada.</li>
                        <li><strong>Datos de uso:</strong> análisis realizados, ubicaciones consultadas, frecuencia de uso.</li>
                        <li><strong>Datos técnicos:</strong> dirección IP, tipo de navegador, sistema operativo, cookies.</li>
                        <li><strong>Datos de pago:</strong> gestionados por procesadores externos (Stripe); no almacenamos tarjetas.</li>
                    </ul>

                    <h2>3. Finalidades del tratamiento</h2>
                    <p>Usamos tus datos para:</p>
                    <ul>
                        <li>Prestar y mantener el Servicio.</li>
                        <li>Gestionar tu cuenta y autenticación.</li>
                        <li>Enviar notificaciones relacionadas con el Servicio.</li>
                        <li>Mejorar la plataforma a través de análisis agregados y anónimos.</li>
                        <li>Cumplir obligaciones legales aplicables.</li>
                    </ul>

                    <h2>4. Base legal</h2>
                    <p>El tratamiento se basa en la ejecución del contrato (uso del Servicio), tu consentimiento (comunicaciones de marketing) y el interés legítimo (mejora del producto).</p>

                    <h2>5. Compartición de datos</h2>
                    <p>No vendemos tus datos. Los compartimos únicamente con:</p>
                    <ul>
                        <li>Proveedores de infraestructura en la nube (Google Cloud, AWS).</li>
                        <li>Servicios de pago (Stripe).</li>
                        <li>Servicios de analítica (Google Analytics).</li>
                        <li>Autoridades competentes cuando la ley lo exija.</li>
                    </ul>

                    <h2>6. Conservación</h2>
                    <p>Conservamos tus datos mientras tu cuenta esté activa. Tras la cancelación, los eliminamos en un plazo máximo de 90 días, salvo obligaciones legales de conservación.</p>

                    <h2>7. Tus derechos</h2>
                    <p>Puedes ejercer los derechos de acceso, rectificación, cancelación y oposición (ARCO) escribiendo a <a href="mailto:privacidad@sitial.app">privacidad@sitial.app</a>. Responderemos en un plazo máximo de 15 días hábiles.</p>

                    <h2>8. Seguridad</h2>
                    <p>Aplicamos medidas técnicas y organizativas como cifrado TLS, contraseñas con hash bcrypt, control de acceso basado en roles y monitoreo continuo de seguridad.</p>

                    <h2>9. Transferencias internacionales</h2>
                    <p>Algunos proveedores pueden estar ubicados fuera de Colombia. En esos casos, garantizamos un nivel de protección adecuado mediante cláusulas contractuales tipo.</p>

                    <h2>10. Cambios</h2>
                    <p>Podemos actualizar esta política. Te notificaremos cambios materiales por email o mediante aviso en la plataforma.</p>
                </div>
            </section>
        </div>
    );
}