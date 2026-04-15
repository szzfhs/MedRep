"""SimHub 虚拟实验 DAO"""
import math
from datetime import datetime

from sqlalchemy import desc, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from common.vo import PageModel
from module_simhub.entity.do.simhub_do import (
    VfExperiment,
    VfExperimentCategory,
    VfExperimentParticipation,
)
from module_simhub.entity.vo.experiment_vo import ExperimentPageQueryModel


class ExperimentCategoryDao:
    @classmethod
    async def get_all_categories(cls, db: AsyncSession) -> list[VfExperimentCategory]:
        result = await db.execute(
            select(VfExperimentCategory)
            .where(VfExperimentCategory.status == '0')
            .order_by(VfExperimentCategory.sort_order)
        )
        return list(result.scalars().all())

    @classmethod
    async def get_category_by_id(cls, db: AsyncSession, category_id: int) -> VfExperimentCategory | None:
        result = await db.execute(
            select(VfExperimentCategory).where(VfExperimentCategory.category_id == category_id)
        )
        return result.scalars().first()

    @classmethod
    async def add_category(cls, db: AsyncSession, data: dict) -> VfExperimentCategory:
        cat = VfExperimentCategory(**data)
        db.add(cat)
        await db.flush()
        return cat

    @classmethod
    async def edit_category(cls, db: AsyncSession, category_id: int, data: dict) -> None:
        await db.execute(
            update(VfExperimentCategory).where(VfExperimentCategory.category_id == category_id).values(**data)
        )
        await db.flush()

    @classmethod
    async def delete_category(cls, db: AsyncSession, category_id: int) -> None:
        cat = await cls.get_category_by_id(db, category_id)
        if cat:
            await db.delete(cat)
            await db.flush()


class ExperimentDao:
    @classmethod
    async def get_experiment_list(cls, db: AsyncSession, query: ExperimentPageQueryModel) -> PageModel:
        conditions = [VfExperiment.del_flag == '0']
        if query.exp_name:
            conditions.append(VfExperiment.exp_name.like(f'%{query.exp_name}%'))
        if query.category_id:
            conditions.append(VfExperiment.category_id == query.category_id)
        if query.exp_type:
            conditions.append(VfExperiment.exp_type == query.exp_type)
        if query.status is not None:
            conditions.append(VfExperiment.status == query.status)

        count_result = await db.execute(select(func.count()).where(*conditions))
        total = count_result.scalar() or 0

        offset = (query.page_num - 1) * query.page_size
        rows_result = await db.execute(
            select(VfExperiment)
            .where(*conditions)
            .order_by(VfExperiment.sort_order, desc(VfExperiment.create_time))
            .offset(offset)
            .limit(query.page_size)
        )
        rows = rows_result.scalars().all()
        has_next = math.ceil(total / query.page_size) > query.page_num if query.page_size > 0 else False
        return PageModel(rows=rows, pageNum=query.page_num, pageSize=query.page_size, total=total, hasNext=has_next)

    @classmethod
    async def get_experiment_by_id(cls, db: AsyncSession, exp_id: int) -> VfExperiment | None:
        result = await db.execute(
            select(VfExperiment).where(VfExperiment.exp_id == exp_id, VfExperiment.del_flag == '0')
        )
        return result.scalars().first()

    @classmethod
    async def add_experiment(cls, db: AsyncSession, create_by: str, data: dict) -> VfExperiment:
        exp = VfExperiment(**data, create_by=create_by, create_time=datetime.now())
        db.add(exp)
        await db.flush()
        return exp

    @classmethod
    async def edit_experiment(cls, db: AsyncSession, update_by: str, exp_id: int, data: dict) -> None:
        data['update_by'] = update_by
        data['update_time'] = datetime.now()
        await db.execute(update(VfExperiment).where(VfExperiment.exp_id == exp_id).values(**data))
        await db.flush()

    @classmethod
    async def delete_experiment(cls, db: AsyncSession, exp_ids: list[int]) -> None:
        await db.execute(
            update(VfExperiment).where(VfExperiment.exp_id.in_(exp_ids)).values(del_flag='2')
        )
        await db.flush()

    @classmethod
    async def increment_view(cls, db: AsyncSession, exp_id: int) -> None:
        await db.execute(
            update(VfExperiment)
            .where(VfExperiment.exp_id == exp_id)
            .values(view_count=VfExperiment.view_count + 1)
        )
        await db.flush()

    @classmethod
    async def increment_participate(cls, db: AsyncSession, exp_id: int) -> None:
        await db.execute(
            update(VfExperiment)
            .where(VfExperiment.exp_id == exp_id)
            .values(participate_count=VfExperiment.participate_count + 1)
        )
        await db.flush()


class ParticipationDao:
    @classmethod
    async def add_participation(cls, db: AsyncSession, user_id: int, exp_id: int) -> VfExperimentParticipation:
        p = VfExperimentParticipation(user_id=user_id, exp_id=exp_id, start_time=datetime.now(), status='started')
        db.add(p)
        await db.flush()
        return p

    @classmethod
    async def complete_participation(cls, db: AsyncSession, participation_id: int, duration: int) -> None:
        await db.execute(
            update(VfExperimentParticipation)
            .where(VfExperimentParticipation.participation_id == participation_id)
            .values(status='completed', end_time=datetime.now(), duration_seconds=duration)
        )
        await db.flush()

    @classmethod
    async def get_user_exp_count(cls, db: AsyncSession, user_id: int) -> int:
        result = await db.execute(
            select(func.count()).where(VfExperimentParticipation.user_id == user_id)
        )
        return result.scalar() or 0
