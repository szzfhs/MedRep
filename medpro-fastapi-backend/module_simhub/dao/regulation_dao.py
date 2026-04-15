"""SimHub 规章制度 DAO"""
from datetime import datetime

from sqlalchemy import desc, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from common.vo import PageModel
from module_simhub.entity.do.simhub_do import VfRegulation
from module_simhub.entity.vo.regulation_vo import RegulationPageQueryModel
import math


class RegulationDao:
    @classmethod
    async def get_regulation_list(cls, db: AsyncSession, query: RegulationPageQueryModel) -> PageModel:
        conditions = [VfRegulation.del_flag == '0']
        if query.title:
            conditions.append(VfRegulation.title.like(f'%{query.title}%'))
        if query.category:
            conditions.append(VfRegulation.category == query.category)
        if query.status:
            conditions.append(VfRegulation.status == query.status)

        count_result = await db.execute(select(func.count()).where(*conditions))
        total = count_result.scalar() or 0

        offset = (query.page_num - 1) * query.page_size
        rows_result = await db.execute(
            select(VfRegulation)
            .where(*conditions)
            .order_by(VfRegulation.sort_order, desc(VfRegulation.create_time))
            .offset(offset)
            .limit(query.page_size)
        )
        rows = rows_result.scalars().all()
        has_next = math.ceil(total / query.page_size) > query.page_num if query.page_size > 0 else False
        return PageModel(rows=rows, pageNum=query.page_num, pageSize=query.page_size, total=total, hasNext=has_next)

    @classmethod
    async def get_regulation_by_id(cls, db: AsyncSession, reg_id: int) -> VfRegulation | None:
        result = await db.execute(
            select(VfRegulation).where(VfRegulation.reg_id == reg_id, VfRegulation.del_flag == '0')
        )
        return result.scalars().first()

    @classmethod
    async def add_regulation(cls, db: AsyncSession, create_by: str, data: dict) -> VfRegulation:
        reg = VfRegulation(**data, create_by=create_by, create_time=datetime.now())
        db.add(reg)
        await db.flush()
        return reg

    @classmethod
    async def edit_regulation(cls, db: AsyncSession, update_by: str, reg_id: int, data: dict) -> None:
        data['update_by'] = update_by
        data['update_time'] = datetime.now()
        await db.execute(update(VfRegulation).where(VfRegulation.reg_id == reg_id).values(**data))
        await db.flush()

    @classmethod
    async def delete_regulation(cls, db: AsyncSession, reg_ids: list[int]) -> None:
        await db.execute(
            update(VfRegulation).where(VfRegulation.reg_id.in_(reg_ids)).values(del_flag='2')
        )
        await db.flush()
