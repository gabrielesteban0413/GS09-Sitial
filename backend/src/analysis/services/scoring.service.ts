import { Injectable } from "@nestjs/common";

@Injectable()
export class ScoringService {
  calculate(competitors: { threatLevel: string }[]) {
    const competition = competitors.length === 0
      ? 100
      : Math.max(0, Math.min(100, Math.round(100 - competitors.reduce((sum, c) => {
          const w = c.threatLevel === "high" ? 1 : c.threatLevel === "medium" ? 0.55 : 0.2;
          return sum + w;
        }, 0) * 8)));

    const metrics = [
      { name: "Afluencia", value: null, description: "Sin una fuente de datos de afluencia; no se estima." },
      { name: "Presión competitiva", value: competition, description: `Índice de menor presión basado en ${competitors.length} competidores encontrados en el radio` },
      { name: "Demografía", value: null, description: "Sin una fuente de datos demográficos; no se estima." },
      { name: "Accesibilidad", value: null, description: "Sin datos verificados de transporte y accesibilidad." },
    ];

    return { metrics };
  }
}
