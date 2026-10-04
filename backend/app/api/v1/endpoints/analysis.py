from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status

from app.api.dependencies import (
    get_analysis_repository, get_competitor_service, get_current_user,
    get_demographic_service, get_geocoding_service, get_scoring_service,
)
from app.core.exceptions import NotFoundError
from app.db.models import Analysis, User
from app.repositories.analysis import AnalysisRepository
from app.schemas.analysis import (
    AnalysisRequest, AnalysisResult, AnalysisSummary, BusinessType, Verdict,
)
from app.schemas.common import PaginatedResponse
from app.schemas.competitor import CompetitorSearchRequest
from app.services.competitor import CompetitorService
from app.services.demographic import DemographicService
from app.services.geocoding import GeocodingService
from app.services.scoring import ScoringService

router = APIRouter(prefix="/analysis", tags=["analysis"])


def _estimate_foot_traffic(pop_density: int, competitors: int, radius: int) -> int:
    import math
    area_km2 = math.pi * (radius / 1000) ** 2
    base = pop_density * area_km2 * 0.15
    boost = 1 + min(0.5, competitors * 0.05)
    return max(500, round(base * boost))


def _estimate_transit_stations(coords) -> int:
    seed = abs(hash((round(coords.lat, 3), round(coords.lng, 3)))) % 10
    return max(2, seed)


@router.post("", response_model=AnalysisResult, status_code=status.HTTP_201_CREATED)
async def create_analysis(
    payload: AnalysisRequest,
    user: Annotated[User, Depends(get_current_user)],
    repository: Annotated[AnalysisRepository, Depends(get_analysis_repository)],
    competitor_service: Annotated[CompetitorService, Depends(get_competitor_service)],
    demographic_service: Annotated[DemographicService, Depends(get_demographic_service)],
    scoring_service: Annotated[ScoringService, Depends(get_scoring_service)],
    geocoding_service: Annotated[GeocodingService, Depends(get_geocoding_service)],
) -> AnalysisResult:
    comp_req = CompetitorSearchRequest(
        coordinates=payload.coordinates,
        radius_meters=payload.radius_meters,
        business_type=payload.business_type.value,
    )
    comp_response = await competitor_service.search(comp_req)
    competitors = comp_response.competitors

    demographics = demographic_service.profile(payload.coordinates)
    foot_peak = _estimate_foot_traffic(
        demographics.population_density, len(competitors), payload.radius_meters,
    )
    foot_avg = round(foot_peak * 0.78)
    transit = _estimate_transit_stations(payload.coordinates)

    overall, verdict, metrics = scoring_service.calculate(
        business_type=payload.business_type,
        weights=payload.weights,
        competitors=competitors,
        demographics=demographics,
        transit_stations=transit,
        foot_traffic_peak=foot_peak,
    )

    address_data = None
    address_obj = None
    try:
        addr_resp = await geocoding_service.reverse(
            payload.coordinates.lat, payload.coordinates.lng,
        )
        address_data = addr_resp.address.model_dump()
        address_obj = addr_resp.address
    except Exception:
        address_data = None

    model = Analysis(
        user_id=user.id, label=payload.label,
        latitude=payload.coordinates.lat, longitude=payload.coordinates.lng,
        business_type=payload.business_type.value, radius_meters=payload.radius_meters,
        overall_score=overall, verdict=verdict.value,
        weights=payload.weights.model_dump(),
        metrics=[m.model_dump() for m in metrics],
        competitors=[c.model_dump(mode="json") for c in competitors],
        address=address_data,
    )
    persisted = await repository.create(model)

    return AnalysisResult(
        id=persisted.id, label=persisted.label,
        coordinates=payload.coordinates, address=address_obj,
        business_type=payload.business_type, radius_meters=payload.radius_meters,
        weights=payload.weights, overall_score=overall, verdict=verdict,
        metrics=metrics, competitors=competitors,
        foot_traffic_peak=foot_peak, foot_traffic_average=foot_avg,
        created_at=persisted.created_at,
    )


@router.get("", response_model=PaginatedResponse[AnalysisSummary])
async def list_analyses(
    user: Annotated[User, Depends(get_current_user)],
    repository: Annotated[AnalysisRepository, Depends(get_analysis_repository)],
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
) -> PaginatedResponse[AnalysisSummary]:
    offset = (page - 1) * page_size
    items, total = await repository.list_by_user(user.id, offset, page_size)
    summaries = [
        AnalysisSummary(
            id=i.id, label=i.label,
            coordinates={"lat": i.latitude, "lng": i.longitude},
            business_type=BusinessType(i.business_type),
            overall_score=i.overall_score, verdict=Verdict(i.verdict),
            created_at=i.created_at,
        )
        for i in items
    ]
    return PaginatedResponse(items=summaries, total=total,
                             page=page, page_size=page_size)


@router.delete("/{analysis_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_analysis(
    analysis_id: UUID,
    user: Annotated[User, Depends(get_current_user)],
    repository: Annotated[AnalysisRepository, Depends(get_analysis_repository)],
) -> None:
    analysis = await repository.get_by_id(analysis_id, user.id)
    if analysis is None:
        raise NotFoundError("Analysis not found")
    await repository.delete(analysis)
