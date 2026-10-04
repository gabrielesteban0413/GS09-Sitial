from app.schemas.analysis import BusinessType, MetricScore, ScoreWeights, Verdict
from app.schemas.competitor import Competitor
from app.services.demographic import DemographicProfile

TARGETS: dict[BusinessType, dict[str, tuple[float, float]]] = {
    BusinessType.CAFE: {"age": (25, 44), "income": (1500, 4000)},
    BusinessType.RESTAURANT: {"age": (25, 55), "income": (1200, 3500)},
    BusinessType.BAKERY: {"age": (25, 60), "income": (800, 2500)},
    BusinessType.PHARMACY: {"age": (35, 70), "income": (1000, 3000)},
    BusinessType.GYM: {"age": (22, 40), "income": (1800, 4500)},
    BusinessType.SUPERMARKET: {"age": (28, 60), "income": (1200, 3200)},
}


class ScoringService:
    def calculate(
        self,
        business_type: BusinessType,
        weights: ScoreWeights,
        competitors: list[Competitor],
        demographics: DemographicProfile,
        transit_stations: int,
        foot_traffic_peak: int,
    ) -> tuple[int, Verdict, list[MetricScore]]:
        foot = self._foot(foot_traffic_peak)
        comp = self._competition(competitors)
        demo = self._demographic(business_type, demographics)
        acc = self._accessibility(transit_stations)

        metrics = [
            MetricScore(name="Afluencia", value=foot,
                        description=f"Pico de {foot_traffic_peak:,} peatones/hora"),
            MetricScore(name="Competencia", value=comp,
                        description=f"{len(competitors)} competidores en el radio"),
            MetricScore(name="Demografía", value=demo,
                        description=f"Ajuste con público de {business_type.value}"),
            MetricScore(name="Accesibilidad", value=acc,
                        description=f"{transit_stations} estaciones cercanas"),
        ]

        tw = (weights.foot_traffic + weights.competition
              + weights.demographics + weights.accessibility) or 1
        overall = round(
            (foot * weights.foot_traffic + comp * weights.competition
             + demo * weights.demographics + acc * weights.accessibility) / tw
        )

        if overall >= 75:
            verdict = Verdict.OPTIMAL
        elif overall >= 55:
            verdict = Verdict.REVIEW
        else:
            verdict = Verdict.DISCARD

        return overall, verdict, metrics

    @staticmethod
    def _foot(peak: int) -> int:
        return round(40 + min(1.0, peak / 8_000) * 55)

    @staticmethod
    def _competition(competitors: list[Competitor]) -> int:
        if not competitors:
            return 100
        wt = sum({"high": 1.0, "medium": 0.55, "low": 0.2}[c.threat_level.value]
                 for c in competitors)
        return max(0, min(100, round(100 - wt * 8)))

    @staticmethod
    def _demographic(business_type: BusinessType, demo: DemographicProfile) -> int:
        t = TARGETS.get(business_type)
        if not t:
            return 50
        amin, amax = t["age"]
        imin, imax = t["income"]
        age_fit = 1.0 if amin <= demo.median_age <= amax else 0.6
        inc_fit = 1.0 if imin <= demo.median_income_usd <= imax else 0.65
        edu_fit = min(1.0, demo.college_educated_pct / 60)
        return max(0, min(100, round(100 * (0.45 * age_fit + 0.35 * inc_fit + 0.20 * edu_fit))))

    @staticmethod
    def _accessibility(stations: int) -> int:
        return round(40 + min(1.0, stations / 6) * 55)
