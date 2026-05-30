"""SimHub 实验系统 DAO"""
import math
from datetime import datetime

from sqlalchemy import desc, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from common.vo import PageModel
from module_simhub.entity.do.simhub_do import VfExperiment, VfSimSystem, VfSimSystemImage
from module_simhub.entity.vo.sim_system_vo import SimSystemPageQueryModel


class SimSystemDao:
    @classmethod
    async def get_sim_system_list(cls, db: AsyncSession, query: SimSystemPageQueryModel) -> PageModel:
        conditions = [VfSimSystem.del_flag == '0']
        if query.system_name:
            conditions.append(VfSimSystem.system_name.like(f'%{query.system_name}%'))
        if query.sys_category:
            conditions.append(VfSimSystem.sys_category == query.sys_category)
        if query.hw_support:
            conditions.append(VfSimSystem.hw_support.like(f'%{query.hw_support}%'))
        if query.status is not None:
            conditions.append(VfSimSystem.status == query.status)
        if query.tenant_id is not None:
            if query.tenant_id == 0:
                conditions.append(VfSimSystem.tenant_id.is_(None))
            else:
                conditions.append(VfSimSystem.tenant_id == query.tenant_id)

        count_result = await db.execute(select(func.count()).where(*conditions))
        total = count_result.scalar() or 0

        offset = (query.page_num - 1) * query.page_size
        rows_result = await db.execute(
            select(VfSimSystem)
            .where(*conditions)
            .order_by(desc(VfSimSystem.create_time))
            .offset(offset)
            .limit(query.page_size)
        )
        rows = rows_result.scalars().all()
        has_next = math.ceil(total / query.page_size) > query.page_num if query.page_size > 0 else False
        return PageModel(rows=rows, pageNum=query.page_num, pageSize=query.page_size, total=total, hasNext=has_next)

    @classmethod
    async def get_sim_system_by_id(cls, db: AsyncSession, sim_system_id: int) -> VfSimSystem | None:
        result = await db.execute(
            select(VfSimSystem).where(
                VfSimSystem.sim_system_id == sim_system_id, VfSimSystem.del_flag == '0'
            )
        )
        return result.scalars().first()

    @classmethod
    async def add_sim_system(cls, db: AsyncSession, create_by: str, data: dict) -> VfSimSystem:
        sim = VfSimSystem(**data, create_by=create_by, create_time=datetime.now())
        db.add(sim)
        await db.flush()
        return sim

    @classmethod
    async def edit_sim_system(cls, db: AsyncSession, update_by: str, sim_system_id: int, data: dict) -> None:
        data['update_by'] = update_by
        data['update_time'] = datetime.now()
        await db.execute(
            update(VfSimSystem).where(VfSimSystem.sim_system_id == sim_system_id).values(**data)
        )
        await db.flush()

    @classmethod
    async def delete_sim_system(cls, db: AsyncSession, sim_system_ids: list[int]) -> None:
        await db.execute(
            update(VfSimSystem)
            .where(VfSimSystem.sim_system_id.in_(sim_system_ids))
            .values(del_flag='2')
        )
        await db.flush()

    @classmethod
    async def increment_view(cls, db: AsyncSession, sim_system_id: int) -> None:
        await db.execute(
            update(VfSimSystem)
            .where(VfSimSystem.sim_system_id == sim_system_id)
            .values(view_count=VfSimSystem.view_count + 1)
        )
        await db.flush()

    @classmethod
    async def get_all_active(cls, db: AsyncSession) -> list[VfSimSystem]:
        """获取所有启用的实验系统（用于下拉选择）"""
        result = await db.execute(
            select(VfSimSystem)
            .where(VfSimSystem.del_flag == '0', VfSimSystem.status == '1')
            .order_by(VfSimSystem.system_name)
        )
        return list(result.scalars().all())

    @classmethod
    async def get_exp_counts(cls, db: AsyncSession, sim_system_ids: list[int]) -> dict[int, int]:
        """批量获取各实验系统下的关联实验数"""
        if not sim_system_ids:
            return {}
        result = await db.execute(
            select(VfExperiment.sim_system_id, func.count().label('cnt'))
            .where(
                VfExperiment.sim_system_id.in_(sim_system_ids),
                VfExperiment.del_flag == '0',
            )
            .group_by(VfExperiment.sim_system_id)
        )
        return {row.sim_system_id: row.cnt for row in result.all()}


class SimSystemImageDao:
    @classmethod
    async def get_images_by_system(cls, db: AsyncSession, sim_system_id: int) -> list[VfSimSystemImage]:
        result = await db.execute(
            select(VfSimSystemImage)
            .where(VfSimSystemImage.sim_system_id == sim_system_id, VfSimSystemImage.status == '0')
            .order_by(VfSimSystemImage.sort_order)
        )
        return list(result.scalars().all())

    @classmethod
    async def add_images(cls, db: AsyncSession, sim_system_id: int, image_urls: list[str]) -> None:
        for i, url in enumerate(image_urls):
            img = VfSimSystemImage(
                sim_system_id=sim_system_id,
                image_url=url,
                sort_order=i,
                create_time=datetime.now(),
            )
            db.add(img)
        await db.flush()

    @classmethod
    async def delete_images_by_system(cls, db: AsyncSession, sim_system_id: int) -> None:
        """删除某实验系统下所有图片（用于全量更新）"""
        images = await cls.get_images_by_system(db, sim_system_id)
        for img in images:
            await db.delete(img)
        await db.flush()
