import "@/styles/legal.css";

export function Cookies() {
    return (
        <div>
            <section className="legal-hero">
                <div className="container">
                    <span className="eyebrow">Legal</span>
                    <h1>Política de cookies</h1>
                    <p className="legal-lead">Última actualización: 12 de octubre de 2026</p>
                </div>
            </section>

            <section className="legal-content">
                <div className="container">
                    <h2>1. ¿Qué son las cookies?</h2>
                    <p>Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas un sitio web. Permiten recordar tus preferencias y mejorar tu experiencia.</p>

                    <h2>2. Tipos de cookies que usamos</h2>
                    <ul>
                        <li><strong>Esenciales:</strong> necesarias para el funcionamiento del sitio (sesión, autenticación). No se pueden desactivar.</li>
                        <li><strong>De rendimiento:</strong> nos ayudan a entender cómo usas la plataforma (Google Analytics).</li>
                        <li><strong>Funcionales:</strong> recuerdan tus preferencias (idioma, tema, ubicación).</li>
                        <li><strong>De marketing:</strong> usadas para mostrarte contenido relevante. Puedes desactivarlas.</li>
                    </ul>

                    <h2>3. Cookies que utilizamos actualmente</h2>
                    <p>Almacenamos en tu navegador:</p>
                    <ul>
                        <li><code>sitial.user</code>: información de tu sesión activa. Duración: hasta logout.</li>
                        <li><code>_ga</code>: identificador anónimo de Google Analytics. Duración: 2 años.</li>
                    </ul>

                    <h2>4. Cómo controlar las cookies</h2>
                    <p>Puedes configurar tu navegador para bloquear o eliminar cookies:</p>
                    <ul>
                        <li>Chrome: Configuración → Privacidad y seguridad → Cookies.</li>
                        <li>Firefox: Preferencias → Privacidad y seguridad.</li>
                        <li>Safari: Preferencias → Privacidad.</li>
                        <li>Edge: Configuración → Cookies y permisos del sitio.</li>
                    </ul>
                    <p>Bloquear cookies esenciales puede afectar el funcionamiento de la plataforma.</p>

                    <h2>5. Cambios</h2>
                    <p>Podemos actualizar esta política. Los cambios se publicarán en esta misma página con la fecha de actualización.</p>

                    <h2>6. Contacto</h2>
                    <p>Si tienes dudas, escríbenos a <a href="mailto:privacidad@sitial.app">privacidad@sitial.app</a>.</p>
                </div>
            </section>
        </div>
    );
}