from enum import Enum

from pydantic import BaseModel, Field

from app.schemas.location import Coordinates


class ThreatLevel(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class Competitor(BaseModel):
    place_id: str
    name: str
    category: str
    coordinates: Coordinates
    distance_meters: int
    rating: float | None
    review_count: int
    threat_level: ThreatLevel
    price_level: int | None = None
    business_status: str | None = None


class CompetitorSearchRequest(BaseModel):
    coordinates: Coordinates
    radius_meters: int = Field(800, ge=100, le=5000)
    business_type: str = Field(..., min_length=2)


class CompetitorSearchResponse(BaseModel):
    center: Coordinates
    radius_meters: int
    total: int
    competitors: list[Competitor]
