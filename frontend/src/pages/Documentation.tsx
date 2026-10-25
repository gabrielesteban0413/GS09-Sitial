import { FileText } from "lucide-react";
import { AppShell } from "@/components/AppShell";

export function Documentation() {
    return (
        <AppShell active="documentation" title="Documentación del proyecto" subtitle="Sitial · Location Intelligence Platform">
          <div className="documentation-page">
            <article className="documentation-card">
            <div className="documentation-title">
                <FileText size={28} />
                <h1>Documentación del Proyecto</h1>
            </div>
            <p className="documentation-lead">Sitial - Location Intelligence Platform</p>

            <h2>1. Introducción</h2>
            <p>
                Sitial es una plataforma SaaS de inteligencia de ubicación diseñada para ayudar a emprendedores, franquicias y pequeñas y medianas empresas de Latinoamérica a tomar decisiones informadas sobre dónde abrir su próximo local comercial. El sistema combina datos geoespaciales obtenidos mediante la API de Google Places, análisis competitivo automatizado y un motor de scoring ponderado.
            </p>

            <h2>2. Arquitectura del Sistema</h2>
            <ul>
                <li><strong>Backend:</strong> NestJS 10 + Prisma ORM + PostgreSQL.</li>
                <li><strong>Frontend:</strong> React 18 + Vite + TypeScript.</li>
                <li><strong>Integraciones:</strong> Google Places API.</li>
            </ul>
            </article>
          </div>
        </AppShell>
    );
}