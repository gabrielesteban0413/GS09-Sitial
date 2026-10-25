import { Link } from "react-router-dom";
import "@/styles/legal.css";

export function Terminos() {
    return (
        <div>
            <section className="legal-hero">
                <div className="container">
                    <span className="eyebrow">Legal</span>
                    <h1>Términos y condiciones</h1>
                    <p className="legal-lead">Última actualización: 12 de octubre de 2026</p>
                </div>
            </section>

            <section className="legal-content">
                <div className="container">
                    <h2>1. Aceptación de los términos</h2>
                    <p>Al acceder y utilizar la plataforma Sitial (en adelante, "el Servicio"), aceptas estar sujeto a estos Términos y Condiciones. Si no estás de acuerdo con alguna parte, no debes usar el Servicio.</p>

                    <h2>2. Descripción del servicio</h2>
                    <p>Sitial es una plataforma de inteligencia de ubicación que proporciona análisis geoespaciales, competitivos y demográficos para ayudar a negocios a elegir la mejor ubicación para sus operaciones. El Servicio incluye análisis automatizado, reportes descargables y acceso vía API.</p>

                    <h2>3. Registro de cuenta</h2>
                    <p>Para utilizar el Servicio debes crear una cuenta. Te comprometes a proporcionar información veraz, completa y actualizada, y a mantener la confidencialidad de tus credenciales de acceso. Eres responsable de todas las actividades que ocurran bajo tu cuenta.</p>

                    <h2>4. Uso aceptable</h2>
                    <p>Te comprometes a no:</p>
                    <ul>
                        <li>Usar el Servicio para fines ilegales o no autorizados.</li>
                        <li>Reproducir, duplicar, copiar, vender o revender el Servicio sin autorización expresa.</li>
                        <li>Realizar ingeniería inversa o intentar extraer el código fuente.</li>
                        <li>Sobrecargar intencionalmente la infraestructura del Servicio.</li>
                    </ul>

                    <h2>5. Precios y pagos</h2>
                    <p>Los planes de pago se facturan mensualmente de forma anticipada. Los precios están expresados en dólares estadounidenses y no incluyen impuestos aplicables. No ofrecemos reembolsos por períodos parciales, salvo cuando lo exija la ley.</p>

                    <h2>6. Propiedad intelectual</h2>
                    <p>Todos los derechos de propiedad intelectual sobre el Servicio, su código, diseño, marcas y contenido son de Sitial o sus licenciantes. No se te concede ninguna licencia salvo el derecho limitado de uso conforme a estos términos.</p>

                    <h2>7. Datos y privacidad</h2>
                    <p>El tratamiento de tus datos personales se rige por nuestra <Link to="/privacidad">Política de Privacidad</Link>. Al usar el Servicio, aceptas dicho tratamiento.</p>

                    <h2>8. Limitación de responsabilidad</h2>
                    <p>Sitial proporciona el Servicio "tal cual" y no garantiza resultados específicos. Las decisiones de negocio que tomes basándote en los análisis son de tu exclusiva responsabilidad. En ningún caso seremos responsables por daños indirectos, incidentales o consecuentes.</p>

                    <h2>9. Modificaciones</h2>
                    <p>Nos reservamos el derecho de modificar estos términos en cualquier momento. Te notificaremos cambios significativos por email o mediante aviso en la plataforma. El uso continuado del Servicio tras la modificación constituye aceptación.</p>

                    <h2>10. Terminación</h2>
                    <p>Podemos suspender o cancelar tu acceso al Servicio si violas estos términos. Tú puedes cancelar tu cuenta en cualquier momento desde la configuración de tu perfil.</p>

                    <h2>11. Ley aplicable</h2>
                    <p>Estos términos se rigen por las leyes de la República de Colombia. Cualquier disputa se resolverá en los tribunales de Bogotá, Colombia.</p>

                    <h2>12. Contacto</h2>
                    <p>Para preguntas sobre estos términos, escríbenos a <a href="mailto:legal@sitial.app">legal@sitial.app</a>.</p>
                </div>
            </section>
        </div>
    );
}