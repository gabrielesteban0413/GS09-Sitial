from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.dependencies import get_competitor_service
from app.schemas.competitor import CompetitorSearchRequest, CompetitorSearchResponse
from app.services.competitor import CompetitorService

router = APIRouter(prefix="/competitors", tags=["competitors"])


@router.post("/search", response_model=CompetitorSearchResponse)
async def search_competitors(
    payload: CompetitorSearchRequest,
    service: Annotated[CompetitorService, Depends(get_competitor_service)],
) -> CompetitorSearchResponse:
    return await service.search(payload)
