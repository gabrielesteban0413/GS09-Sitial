import { FileText } from "lucide-react";

export function Documentation() {
    return (
        <div style={{ padding: 40, maxWidth: 900, margin: "40px auto", height: "calc(100vh - 80px)", overflowY: "auto", background: "var(--surface)", borderRadius: 16, boxShadow: "var(--shadow)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <FileText size={28} color="var(--teal-500)" />
                <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>Documentación del Proyecto</h1>
            </div>
            <p style={{ color: "var(--text-3)", marginBottom: 40, paddingBottom: 24, borderBottom: "2px solid var(--border)" }}>Sitial - Location Intelligence Platform</p>

            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--teal-600)", marginTop: 32, marginBottom: 12 }}>1. Introducción</h2>
            <p style={{ fontSize: 14, lineHeight: 1.8, color: "var(--text-2)", marginBottom: 16, textAlign: "justify" }}>
                Sitial es una plataforma SaaS de inteligencia de ubicación diseñada para ayudar a emprendedores, franquicias y pequeñas y medianas empresas de Latinoamérica a tomar decisiones informadas sobre dónde abrir su próximo local comercial. El sistema combina datos geoespaciales obtenidos mediante la API de Google Places, análisis competitivo automatizado y un motor de scoring ponderado.
            </p>

            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--teal-600)", marginTop: 32, marginBottom: 12 }}>2. Arquitectura del Sistema</h2>
            <ul style={{ paddingLeft: 20, fontSize: 14, lineHeight: 1.8, color: "var(--text-2)" }}>
                <li><strong>Backend:</strong> NestJS 10 + Prisma ORM + PostgreSQL.</li>
                <li><strong>Frontend:</strong> React 18 + Vite + TypeScript.</li>
                <li><strong>Integraciones:</strong> Google Places API.</li>
            </ul>
        </div>
    );
}