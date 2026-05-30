"""SimHub 教学资源 DAO"""
import math
from datetime import datetime

from sqlalchemy import desc, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from common.vo import PageModel
from module_simhub.entity.do.simhub_do import VfResource, VfResourceCategory
from module_simhub.entity.vo.resource_vo import ResourcePageQueryModel


class ResourceCategoryDao:
    @classmethod
    async def get_all_categories(cls, db: AsyncSession) -> list[VfResourceCategory]:
        result = await db.execute(
            select(VfResourceCategory)
            .where(VfResourceCategory.status == '0')
            .order_by(VfResourceCategory.sort_order)
        )
        return list(result.scalars().all())

    @classmethod
    async def get_category_by_id(cls, db: AsyncSession, category_id: int) -> VfResourceCategory | None:
        result = await db.execute(
            select(VfResourceCategory).where(VfResourceCategory.category_id == category_id)
        )
        return result.scalars().first()

    @classmethod
    async def add_category(cls, db: AsyncSession, data: dict) -> VfResourceCategory:
        cat = VfResourceCategory(**data)
        db.add(cat)
        await db.flush()
        return cat

    @classmethod
    async def edit_category(cls, db: AsyncSession, category_id: int, data: dict) -> None:
        await db.execute(
            update(VfResourceCategory).where(VfResourceCategory.category_id == category_id).values(**data)
        )
        await db.flush()

    @classmethod
    async def delete_category(cls, db: AsyncSession, category_id: int) -> None:
        cat = await cls.get_category_by_id(db, category_id)
        if cat:
            await db.delete(cat)
            await db.flush()


class ResourceDao:
    @classmethod
    async def get_resource_list(cls, db: AsyncSession, query: ResourcePageQueryModel) -> PageModel:
        conditions = [VfResource.del_flag == '0']
        if query.resource_name:
            conditions.append(VfResource.resource_name.like(f'%{query.resource_name}%'))
        if query.resource_type:
            conditions.append(VfResource.resource_type == query.resource_type)
        if query.category_id:
            conditions.append(VfResource.category_id == query.category_id)
        if query.course_id:
            conditions.append(VfResource.course_id == query.course_id)
        if query.section_id:
            conditions.append(VfResource.section_id == query.section_id)
        if query.status is not None:
            conditions.append(VfResource.status == query.status)
        if query.tenant_id is not None:
            if query.tenant_id == 0:
                conditions.append(VfResource.tenant_id.is_(None))
            else:
                conditions.append(VfResource.tenant_id == query.tenant_id)

        count_result = await db.execute(select(func.count()).where(*conditions))
        total = count_result.scalar() or 0

        offset = (query.page_num - 1) * query.page_size
        rows_result = await db.execute(
            select(VfResource)
            .where(*conditions)
            .order_by(desc(VfResource.create_time))
            .offset(offset)
            .limit(query.page_size)
        )
        rows = rows_result.scalars().all()
        has_next = math.ceil(total / query.page_size) > query.page_num if query.page_size > 0 else False
        return PageModel(rows=rows, pageNum=query.page_num, pageSize=query.page_size, total=total, hasNext=has_next)

    @classmethod
    async def get_resource_by_id(cls, db: AsyncSession, resource_id: int) -> VfResource | None:
        result = await db.execute(
            select(VfResource).where(VfResource.resource_id == resource_id, VfResource.del_flag == '0')
        )
        return result.scalars().first()

    @classmethod
    async def add_resource(cls, db: AsyncSession, create_by: str, data: dict) -> VfResource:
        resource = VfResource(**data, create_by=create_by, create_time=datetime.now())
        db.add(resource)
        await db.flush()
        return resource

    @classmethod
    async def edit_resource(cls, db: AsyncSession, update_by: str, resource_id: int, data: dict) -> None:
        data['update_by'] = update_by
        data['update_time'] = datetime.now()
        await db.execute(update(VfResource).where(VfResource.resource_id == resource_id).values(**data))
        await db.flush()

    @classmethod
    async def delete_resource(cls, db: AsyncSession, resource_ids: list[int]) -> None:
        await db.execute(
            update(VfResource).where(VfResource.resource_id.in_(resource_ids)).values(del_flag='2')
        )
        await db.flush()

    @classmethod
    async def increment_view(cls, db: AsyncSession, resource_id: int) -> None:
        await db.execute(
            update(VfResource)
            .where(VfResource.resource_id == resource_id)
            .values(view_count=VfResource.view_count + 1)
        )
        await db.flush()

    @classmethod
    async def increment_download(cls, db: AsyncSession, resource_id: int) -> None:
        await db.execute(
            update(VfResource)
            .where(VfResource.resource_id == resource_id)
            .values(download_count=VfResource.download_count + 1)
        )
        await db.flush()
