from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.dependencies import get_geocoding_service
from app.schemas.location import GeocodeRequest, GeocodeResponse
from app.services.geocoding import GeocodingService

router = APIRouter(prefix="/geocoding", tags=["geocoding"])


@router.post("/forward", response_model=GeocodeResponse)
async def forward_geocode(
    payload: GeocodeRequest,
    service: Annotated[GeocodingService, Depends(get_geocoding_service)],
) -> GeocodeResponse:
    return await service.geocode(payload.address)


@router.get("/reverse", response_model=GeocodeResponse)
async def reverse_geocode(
    lat: float, lng: float,
    service: Annotated[GeocodingService, Depends(get_geocoding_service)],
) -> GeocodeResponse:
    return await service.reverse(lat, lng)
