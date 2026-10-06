from fastapi import APIRouter, Depends

from app.core.config import Settings, get_settings
from app.schemas.common import HealthResponse

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
async def health(settings: Settings = Depends(get_settings)) -> HealthResponse:
    return HealthResponse(status="ok", version=settings.app_version,
                          environment=settings.app_env)


@router.get("/ready", response_model=HealthResponse)
async def ready(settings: Settings = Depends(get_settings)) -> HealthResponse:
    return HealthResponse(status="ready", version=settings.app_version,
                          environment=settings.app_env)
