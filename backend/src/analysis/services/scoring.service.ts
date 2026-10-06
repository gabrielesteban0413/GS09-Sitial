import { Injectable } from "@nestjs/common";

const TARGETS: Record<string, { age: [number, number]; income: [number, number] }> = {
  cafe: { age: [25, 44], income: [1500, 4000] },
  restaurant: { age: [25, 55], income: [1200, 3500] },
  bakery: { age: [25, 60], income: [800, 2500] },
  pharmacy: { age: [35, 70], income: [1000, 3000] },
  gym: { age: [22, 40], income: [1800, 4500] },
  supermarket: { age: [28, 60], income: [1200, 3200] },
};

@Injectable()
export class ScoringService {
  calculate(params: {
    businessType: string;
    weights: { footTraffic: number; competition: number; demographics: number; accessibility: number };
    competitors: any[];
    populationDensity: number;
    medianAge: number;
    medianIncome: number;
    transitStations: number;
    footTrafficPeak: number;
  }) {
    const { businessType, weights, competitors, medianAge, medianIncome, transitStations, footTrafficPeak } = params;

    const foot = Math.round(40 + Math.min(1, footTrafficPeak / 8000) * 55);

    const comp = competitors.length === 0
      ? 100
      : Math.max(0, Math.min(100, Math.round(100 - competitors.reduce((sum, c) => {
          const w = c.threatLevel === "high" ? 1 : c.threatLevel === "medium" ? 0.55 : 0.2;
          return sum + w;
        }, 0) * 8)));

    const t = TARGETS[businessType] ?? { age: [25, 55], income: [1000, 3500] };
    const ageFit = medianAge >= t.age[0] && medianAge <= t.age[1] ? 1 : 0.6;
    const incFit = medianIncome >= t.income[0] && medianIncome <= t.income[1] ? 1 : 0.65;
    const demo = Math.max(0, Math.min(100, Math.round(100 * (0.55 * ageFit + 0.45 * incFit))));

    const acc = Math.round(40 + Math.min(1, transitStations / 6) * 55);

    const metrics = [
      { name: "Afluencia", value: foot, description: `Pico de ${footTrafficPeak.toLocaleString()} peatones/hora` },
      { name: "Competencia", value: comp, description: `${competitors.length} competidores en el radio` },
      { name: "Demografía", value: demo, description: `Ajuste con público de ${businessType}` },
      { name: "Accesibilidad", value: acc, description: `${transitStations} estaciones cercanas` },
    ];

    const tw = weights.footTraffic + weights.competition + weights.demographics + weights.accessibility || 1;
    const overall = Math.round(
      (foot * weights.footTraffic + comp * weights.competition + demo * weights.demographics + acc * weights.accessibility) / tw,
    );

    const verdict = overall >= 75 ? "optimal" : overall >= 55 ? "review" : "discard";

    return { overall, verdict, metrics };
  }
}
