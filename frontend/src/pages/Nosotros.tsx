import "@/styles/public.css";

export function Nosotros() {
    return (
        <div style={{ background: "var(--surface)", padding: "60px 0 100px", minHeight: "100vh" }}>
            <div className="container" style={{ maxWidth: 800 }}>
                <h1 style={{ fontSize: 46, fontWeight: 800, marginBottom: 14 }}>Sobre Sitial</h1>
                <p style={{ fontSize: 17, color: "var(--text-2)", marginBottom: 44, paddingBottom: 30, borderBottom: "1px solid var(--border)" }}>Sitial nació en 2026 con una misión clara: democratizar el acceso a la inteligencia de ubicación para las PyMEs de Latinoamérica.</p>
                <h2 style={{ fontSize: 22, marginTop: 40, marginBottom: 14 }}>Nuestra historia</h2>
                <p style={{ fontSize: 15.5, color: "var(--text-2)", lineHeight: 1.75, marginBottom: 14 }}>El 67% de los locales independientes en Latinoamérica cierran en los primeros 3 años. La causa principal no es la falta de clientes ni la mala calidad del producto: es una mala elección de ubicación.</p>
                <p style={{ fontSize: 15.5, color: "var(--text-2)", lineHeight: 1.75 }}>Sitial cierra esa brecha. Combinamos datos geoespaciales, análisis competitivo y demografía en una plataforma accesible, en español y pensada específicamente para el mercado hispanoamericano.</p>
            </div>
        </div>
    );
}