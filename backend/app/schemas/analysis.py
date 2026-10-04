from datetime import datetime
from enum import Enum
from uuid import UUID

from pydantic import BaseModel, Field

from app.schemas.competitor import Competitor
from app.schemas.location import Address, Coordinates


class BusinessType(str, Enum):
    CAFE = "cafe"
    RESTAURANT = "restaurant"
    BAKERY = "bakery"
    PHARMACY = "pharmacy"
    GYM = "gym"
    SUPERMARKET = "supermarket"


class Verdict(str, Enum):
    OPTIMAL = "optimal"
    REVIEW = "review"
    DISCARD = "discard"


class ScoreWeights(BaseModel):
    foot_traffic: int = Field(35, ge=0, le=100)
    competition: int = Field(25, ge=0, le=100)
    demographics: int = Field(25, ge=0, le=100)
    accessibility: int = Field(15, ge=0, le=100)


class MetricScore(BaseModel):
    name: str
    value: int = Field(..., ge=0, le=100)
    description: str


class AnalysisRequest(BaseModel):
    coordinates: Coordinates
    business_type: BusinessType
    radius_meters: int = Field(800, ge=100, le=5000)
    weights: ScoreWeights = Field(default_factory=ScoreWeights)
    label: str | None = Field(None, max_length=120)


class AnalysisResult(BaseModel):
    id: UUID
    label: str | None
    coordinates: Coordinates
    address: Address | None
    business_type: BusinessType
    radius_meters: int
    weights: ScoreWeights
    overall_score: int
    verdict: Verdict
    metrics: list[MetricScore]
    competitors: list[Competitor]
    foot_traffic_peak: int
    foot_traffic_average: int
    created_at: datetime


class AnalysisSummary(BaseModel):
    id: UUID
    label: str | None
    coordinates: Coordinates
    business_type: BusinessType
    overall_score: int
    verdict: Verdict
    created_at: datetime
