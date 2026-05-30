"""SimHub 租户管理 Service"""
from sqlalchemy.ext.asyncio import AsyncSession

from common.vo import CrudResponseModel, PageModel
from module_simhub.dao.tenant_dao import TenantDao
from module_simhub.entity.vo.tenant_vo import (
    AddTenantModel,
    BatchGrantModel,
    DeleteTenantModel,
    EditTenantModel,
    GrantRecordModel,
    TenantModel,
    TenantPageQueryModel,
    TenantStatsModel,
)


class TenantService:
    # ======================== 租户 CRUD ========================

    @classmethod
    async def get_tenant_list(cls, db: AsyncSession, query: TenantPageQueryModel) -> PageModel:
        page = await TenantDao.get_tenant_list(db, query)
        page.rows = [TenantModel.model_validate(r).model_dump(by_alias=True) for r in page.rows]
        return page

    @classmethod
    async def get_tenant_detail(cls, db: AsyncSession, tenant_id: int) -> dict | None:
        tenant = await TenantDao.get_tenant_by_id(db, tenant_id)
        if tenant is None:
            return None
        return TenantModel.model_validate(tenant).model_dump(by_alias=True)

    @classmethod
    async def get_all_tenants(cls, db: AsyncSession) -> list[dict]:
        """获取所有启用的租户（用于下拉选择器）"""
        tenants = await TenantDao.get_all_active_tenants(db)
        return [TenantModel.model_validate(t).model_dump(by_alias=True) for t in tenants]

    @classmethod
    async def add_tenant(cls, db: AsyncSession, create_by: str, data: AddTenantModel) -> CrudResponseModel:
        # 校验编码唯一性
        existing = await TenantDao.get_tenant_by_code(db, data.tenant_code)
        if existing:
            return CrudResponseModel(is_success=False, message=f'租户编码 "{data.tenant_code}" 已存在')
        tenant_data = data.model_dump(exclude_none=True, by_alias=False)
        await TenantDao.add_tenant(db, create_by, tenant_data)
        await db.commit()
        return CrudResponseModel(is_success=True, message='新增学校租户成功')

    @classmethod
    async def edit_tenant(cls, db: AsyncSession, update_by: str, data: EditTenantModel) -> CrudResponseModel:
        tenant = await TenantDao.get_tenant_by_id(db, data.tenant_id)
        if not tenant:
            return CrudResponseModel(is_success=False, message='租户不存在')
        # 若修改了编码，校验唯一性
        if data.tenant_code != tenant.tenant_code:
            existing = await TenantDao.get_tenant_by_code(db, data.tenant_code)
            if existing:
                return CrudResponseModel(is_success=False, message=f'租户编码 "{data.tenant_code}" 已存在')
        update_data = data.model_dump(exclude={'tenant_id'}, exclude_none=True, by_alias=False)
        await TenantDao.edit_tenant(db, update_by, data.tenant_id, update_data)
        await db.commit()
        return CrudResponseModel(is_success=True, message='编辑学校租户成功')

    @classmethod
    async def delete_tenant(cls, db: AsyncSession, data: DeleteTenantModel) -> CrudResponseModel:
        ids = [int(i) for i in data.tenant_ids.split(',')]
        await TenantDao.delete_tenants(db, ids)
        await db.commit()
        return CrudResponseModel(is_success=True, message='删除成功')

    # ======================== 统计 ========================

    @classmethod
    async def get_tenant_stats(cls, db: AsyncSession, tenant_id: int) -> dict | None:
        tenant = await TenantDao.get_tenant_by_id(db, tenant_id)
        if not tenant:
            return None
        stats = await TenantDao.get_tenant_stats(db, tenant_id)
        stats['tenant_name'] = tenant.tenant_name
        return TenantStatsModel(**stats).model_dump(by_alias=True)

    # ======================== 内容授权 ========================

    @classmethod
    async def get_grants(
        cls, db: AsyncSession, tenant_id: int, content_type: str | None = None
    ) -> list[dict]:
        grants = await TenantDao.get_grants_by_tenant(db, tenant_id, content_type)
        return [GrantRecordModel.model_validate(g).model_dump(by_alias=True) for g in grants]

    @classmethod
    async def grant_content(
        cls, db: AsyncSession, tenant_id: int, granted_by: str, data: BatchGrantModel
    ) -> CrudResponseModel:
        tenant = await TenantDao.get_tenant_by_id(db, tenant_id)
        if not tenant:
            return CrudResponseModel(is_success=False, message='租户不存在')

        success_count = 0
        skip_count = 0
        for item in data.grants:
            existing = await TenantDao.get_grant(db, tenant_id, item.content_type, item.content_id)
            if existing:
                if existing.status == '1':
                    # 已撤销 → 重新激活
                    from sqlalchemy import update
                    from module_simhub.entity.do.tenant_do import VfTenantContentGrant
                    from datetime import datetime
                    await db.execute(
                        update(VfTenantContentGrant)
                        .where(VfTenantContentGrant.grant_id == existing.grant_id)
                        .values(status='0', granted_by=granted_by, grant_time=datetime.now())
                    )
                    await db.flush()
                    success_count += 1
                else:
                    skip_count += 1  # 已授权，跳过
                continue
            await TenantDao.add_grant(db, tenant_id, item.content_type, item.content_id, granted_by)
            success_count += 1

        await db.commit()
        msg = f'授权成功 {success_count} 项'
        if skip_count:
            msg += f'，{skip_count} 项已授权（已跳过）'
        return CrudResponseModel(is_success=True, message=msg)

    @classmethod
    async def revoke_content(
        cls, db: AsyncSession, tenant_id: int, content_type: str, content_id: int
    ) -> CrudResponseModel:
        tenant = await TenantDao.get_tenant_by_id(db, tenant_id)
        if not tenant:
            return CrudResponseModel(is_success=False, message='租户不存在')
        affected = await TenantDao.revoke_grant(db, tenant_id, content_type, content_id)
        await db.commit()
        if affected == 0:
            return CrudResponseModel(is_success=False, message='授权记录不存在或已撤销')
        return CrudResponseModel(is_success=True, message='撤销授权成功')

    # ======================== Portal 租户解析 ========================

    @classmethod
    async def resolve_tenant_by_subdomain(cls, db: AsyncSession, subdomain: str) -> dict | None:
        """通过子域名解析租户信息（Portal 用）"""
        tenant = await TenantDao.get_tenant_by_subdomain(db, subdomain)
        if not tenant:
            return None
        return TenantModel.model_validate(tenant).model_dump(by_alias=True)
