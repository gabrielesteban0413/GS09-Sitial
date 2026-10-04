from collections.abc import AsyncIterator
from typing import Annotated
from uuid import UUID

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.clients.google_maps import GoogleMapsClient
from app.core.config import Settings, get_settings
from app.core.exceptions import AuthenticationError
from app.core.security import decode_access_token
from app.db.models import User
from app.db.session import build_engine, build_session_factory, session_scope
from app.repositories.analysis import AnalysisRepository
from app.services.competitor import CompetitorService
from app.services.demographic import DemographicService
from app.services.geocoding import GeocodingService
from app.services.scoring import ScoringService

bearer_scheme = HTTPBearer(auto_error=False)
_settings = get_settings()
_engine = build_engine(_settings)
_session_factory: async_sessionmaker[AsyncSession] = build_session_factory(_engine)


async def get_db_session() -> AsyncIterator[AsyncSession]:
    async with session_scope(_session_factory) as session:
        yield session


async def get_google_maps_client(
    settings: Annotated[Settings, Depends(get_settings)],
) -> AsyncIterator[GoogleMapsClient]:
    async with GoogleMapsClient(settings) as client:
        yield client


def get_geocoding_service(
    client: Annotated[GoogleMapsClient, Depends(get_google_maps_client)],
) -> GeocodingService:
    return GeocodingService(client)


def get_competitor_service(
    client: Annotated[GoogleMapsClient, Depends(get_google_maps_client)],
) -> CompetitorService:
    return CompetitorService(client)


def get_demographic_service() -> DemographicService:
    return DemographicService()


def get_scoring_service() -> ScoringService:
    return ScoringService()


def get_analysis_repository(
    session: Annotated[AsyncSession, Depends(get_db_session)],
) -> AnalysisRepository:
    return AnalysisRepository(session)


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
    settings: Annotated[Settings, Depends(get_settings)],
    session: Annotated[AsyncSession, Depends(get_db_session)],
) -> User:
    if credentials is None:
        raise AuthenticationError("Authorization header missing")
    payload = decode_access_token(credentials.credentials, settings)
    subject = payload.get("sub")
    if not subject:
        raise AuthenticationError("Invalid token payload")
    user = (await session.execute(
        select(User).where(User.id == UUID(subject))
    )).scalar_one_or_none()
    if user is None or not user.is_active:
        raise AuthenticationError("User not found or inactive")
    return user
