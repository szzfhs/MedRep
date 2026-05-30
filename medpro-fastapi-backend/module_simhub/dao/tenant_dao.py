"""SimHub 租户管理 DAO"""
from datetime import datetime

from sqlalchemy import delete, desc, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from common.vo import PageModel
from module_simhub.entity.do.simhub_do import (
    VfCourse,
    VfExperiment,
    VfNews,
    VfResource,
)
from module_simhub.entity.do.tenant_do import VfTenant, VfTenantContentGrant
from module_simhub.entity.vo.tenant_vo import TenantPageQueryModel


class TenantDao:
    # ======================== 租户基础 CRUD ========================

    @classmethod
    async def get_tenant_list(cls, db: AsyncSession, query: TenantPageQueryModel) -> PageModel:
        conditions = []
        if query.tenant_code:
            conditions.append(VfTenant.tenant_code.like(f'%{query.tenant_code}%'))
        if query.tenant_name:
            conditions.append(VfTenant.tenant_name.like(f'%{query.tenant_name}%'))
        if query.status is not None:
            conditions.append(VfTenant.status == query.status)

        stmt = select(VfTenant)
        if conditions:
            stmt = stmt.where(*conditions)

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = (await db.execute(count_stmt)).scalar() or 0

        offset = (query.page_num - 1) * query.page_size
        rows_result = await db.execute(
            stmt.order_by(desc(VfTenant.create_time)).offset(offset).limit(query.page_size)
        )
        rows = rows_result.scalars().all()

        import math
        has_next = math.ceil(total / query.page_size) > query.page_num if query.page_size > 0 else False
        return PageModel(rows=rows, pageNum=query.page_num, pageSize=query.page_size, total=total, hasNext=has_next)

    @classmethod
    async def get_tenant_by_id(cls, db: AsyncSession, tenant_id: int) -> VfTenant | None:
        result = await db.execute(select(VfTenant).where(VfTenant.tenant_id == tenant_id))
        return result.scalars().first()

    @classmethod
    async def get_tenant_by_code(cls, db: AsyncSession, tenant_code: str) -> VfTenant | None:
        result = await db.execute(select(VfTenant).where(VfTenant.tenant_code == tenant_code))
        return result.scalars().first()

    @classmethod
    async def get_tenant_by_subdomain(cls, db: AsyncSession, subdomain: str) -> VfTenant | None:
        result = await db.execute(
            select(VfTenant).where(VfTenant.subdomain == subdomain, VfTenant.status == '0')
        )
        return result.scalars().first()

    @classmethod
    async def get_all_active_tenants(cls, db: AsyncSession) -> list[VfTenant]:
        result = await db.execute(
            select(VfTenant).where(VfTenant.status == '0').order_by(VfTenant.tenant_name)
        )
        return result.scalars().all()

    @classmethod
    async def add_tenant(cls, db: AsyncSession, create_by: str, data: dict) -> VfTenant:
        tenant = VfTenant(**data, create_by=create_by, create_time=datetime.now())
        db.add(tenant)
        await db.flush()
        return tenant

    @classmethod
    async def edit_tenant(cls, db: AsyncSession, update_by: str, tenant_id: int, data: dict) -> None:
        data['update_by'] = update_by
        data['update_time'] = datetime.now()
        await db.execute(update(VfTenant).where(VfTenant.tenant_id == tenant_id).values(**data))
        await db.flush()

    @classmethod
    async def delete_tenants(cls, db: AsyncSession, tenant_ids: list[int]) -> None:
        """物理删除租户（需确保无关联数据）"""
        await db.execute(delete(VfTenant).where(VfTenant.tenant_id.in_(tenant_ids)))
        await db.flush()

    # ======================== 租户统计 ========================

    @classmethod
    async def get_tenant_stats(cls, db: AsyncSession, tenant_id: int) -> dict:
        """汇总统计：用户数/课程数/实验数/资源数/新闻数/授权数"""
        # 用户数（sys_user 中绑定该 tenant_id 的用户）
        from module_admin.entity.do.user_do import SysUser
        user_count = (await db.execute(
            select(func.count()).where(SysUser.tenant_id == tenant_id, SysUser.del_flag == '0')
        )).scalar() or 0

        # 课程数（含平台授权 + 学校自建）
        platform_course_grants = (await db.execute(
            select(func.count()).where(
                VfTenantContentGrant.tenant_id == tenant_id,
                VfTenantContentGrant.content_type == 'course',
                VfTenantContentGrant.status == '0',
            )
        )).scalar() or 0
        tenant_courses = (await db.execute(
            select(func.count()).where(VfCourse.tenant_id == tenant_id, VfCourse.del_flag == '0')
        )).scalar() or 0

        # 实验数
        platform_exp_grants = (await db.execute(
            select(func.count()).where(
                VfTenantContentGrant.tenant_id == tenant_id,
                VfTenantContentGrant.content_type == 'experiment',
                VfTenantContentGrant.status == '0',
            )
        )).scalar() or 0
        tenant_experiments = (await db.execute(
            select(func.count()).where(VfExperiment.tenant_id == tenant_id, VfExperiment.del_flag == '0')
        )).scalar() or 0

        # 资源数
        tenant_resources = (await db.execute(
            select(func.count()).where(VfResource.tenant_id == tenant_id, VfResource.del_flag == '0')
        )).scalar() or 0

        # 新闻数
        tenant_news = (await db.execute(
            select(func.count()).where(VfNews.tenant_id == tenant_id, VfNews.del_flag == '0')
        )).scalar() or 0

        # 总授权数
        total_grants = (await db.execute(
            select(func.count()).where(
                VfTenantContentGrant.tenant_id == tenant_id,
                VfTenantContentGrant.status == '0',
            )
        )).scalar() or 0

        return {
            'tenant_id': tenant_id,
            'user_count': user_count,
            'course_count': platform_course_grants + tenant_courses,
            'experiment_count': platform_exp_grants + tenant_experiments,
            'resource_count': tenant_resources,
            'news_count': tenant_news,
            'grant_count': total_grants,
        }

    # ======================== 内容授权 CRUD ========================

    @classmethod
    async def get_grants_by_tenant(
        cls,
        db: AsyncSession,
        tenant_id: int,
        content_type: str | None = None,
    ) -> list[VfTenantContentGrant]:
        conditions = [VfTenantContentGrant.tenant_id == tenant_id, VfTenantContentGrant.status == '0']
        if content_type:
            conditions.append(VfTenantContentGrant.content_type == content_type)
        result = await db.execute(
            select(VfTenantContentGrant).where(*conditions).order_by(desc(VfTenantContentGrant.grant_time))
        )
        return result.scalars().all()

    @classmethod
    async def get_grant(
        cls, db: AsyncSession, tenant_id: int, content_type: str, content_id: int
    ) -> VfTenantContentGrant | None:
        result = await db.execute(
            select(VfTenantContentGrant).where(
                VfTenantContentGrant.tenant_id == tenant_id,
                VfTenantContentGrant.content_type == content_type,
                VfTenantContentGrant.content_id == content_id,
            )
        )
        return result.scalars().first()

    @classmethod
    async def add_grant(
        cls,
        db: AsyncSession,
        tenant_id: int,
        content_type: str,
        content_id: int,
        granted_by: str,
    ) -> VfTenantContentGrant:
        grant = VfTenantContentGrant(
            tenant_id=tenant_id,
            content_type=content_type,
            content_id=content_id,
            granted_by=granted_by,
            grant_time=datetime.now(),
            status='0',
        )
        db.add(grant)
        await db.flush()
        return grant

    @classmethod
    async def revoke_grant(
        cls, db: AsyncSession, tenant_id: int, content_type: str, content_id: int
    ) -> int:
        """撤销授权，返回影响行数"""
        result = await db.execute(
            update(VfTenantContentGrant)
            .where(
                VfTenantContentGrant.tenant_id == tenant_id,
                VfTenantContentGrant.content_type == content_type,
                VfTenantContentGrant.content_id == content_id,
                VfTenantContentGrant.status == '0',
            )
            .values(status='1')
        )
        await db.flush()
        return result.rowcount
