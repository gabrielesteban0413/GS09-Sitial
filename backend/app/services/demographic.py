import hashlib
from dataclasses import dataclass

from app.schemas.location import Coordinates


@dataclass(frozen=True)
class DemographicProfile:
    population_density: int
    median_age: int
    median_income_usd: int
    household_size: float
    college_educated_pct: int


class DemographicService:
    def profile(self, coordinates: Coordinates) -> DemographicProfile:
        seed = self._seed(coordinates)
        return DemographicProfile(
            population_density=12_000 + int(seed * 18_000),
            median_age=28 + int(seed * 12),
            median_income_usd=800 + int(seed * 2_400),
            household_size=round(2.5 + seed * 1.5, 1),
            college_educated_pct=25 + int(seed * 45),
        )

    @staticmethod
    def _seed(coordinates: Coordinates) -> float:
        raw = f"{coordinates.lat:.6f}:{coordinates.lng:.6f}".encode()
        digest = hashlib.sha256(raw).digest()
        return (int.from_bytes(digest[:8], "big") % 10_000) / 10_000
