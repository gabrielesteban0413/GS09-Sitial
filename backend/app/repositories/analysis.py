from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import Analysis


class AnalysisRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create(self, analysis: Analysis) -> Analysis:
        self.session.add(analysis)
        await self.session.flush()
        await self.session.refresh(analysis)
        return analysis

    async def get_by_id(self, analysis_id: UUID, user_id: UUID) -> Analysis | None:
        stmt = select(Analysis).where(
            Analysis.id == analysis_id, Analysis.user_id == user_id,
        )
        return (await self.session.execute(stmt)).scalar_one_or_none()

    async def list_by_user(self, user_id: UUID, offset: int, limit: int):
        stmt = (
            select(Analysis).where(Analysis.user_id == user_id)
            .order_by(Analysis.created_at.desc()).offset(offset).limit(limit)
        )
        items = list((await self.session.execute(stmt)).scalars().all())
        cnt = select(func.count()).select_from(Analysis).where(Analysis.user_id == user_id)
        total = (await self.session.execute(cnt)).scalar_one()
        return items, total

    async def delete(self, analysis: Analysis) -> None:
        await self.session.delete(analysis)
        await self.session.flush()
