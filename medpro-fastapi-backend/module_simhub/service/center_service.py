"""SimHub 中心信息 Service"""
from sqlalchemy.ext.asyncio import AsyncSession

from common.vo import CrudResponseModel
from module_simhub.dao.center_dao import CenterDao
from module_simhub.entity.do.simhub_do import VfCenterInfo
from module_simhub.entity.vo.center_vo import (
    CenterInfoModel,
    EditCenterInfoModel,
    EditOrgMemberModel,
    EditTeamMemberModel,
    OrgMemberModel,
    TeamMemberModel,
)


class CenterService:

    @classmethod
    async def get_center_info(cls, db: AsyncSession, tenant_id: int | None = None) -> dict | None:
        obj = await CenterDao.get_center_info(db, tenant_id)
        if obj is None:
            return None
        return CenterInfoModel.model_validate(obj).model_dump(by_alias=True)

    @classmethod
    async def update_center_info(cls, db: AsyncSession, update_by: str, data: EditCenterInfoModel, tenant_id: int | None = None) -> CrudResponseModel:
        await CenterDao.upsert_center_info(db, update_by, data, tenant_id)
        await db.commit()
        return CrudResponseModel(is_success=True, message='更新成功')

    # ===== 组织架构成员 =====

    @classmethod
    async def get_org_members(cls, db: AsyncSession, tenant_id: int | None = None) -> list[dict]:
        objs = await CenterDao.get_org_members(db, tenant_id)
        return [OrgMemberModel.model_validate(o).model_dump(by_alias=True) for o in objs]

    @classmethod
    async def create_org_member(cls, db: AsyncSession, data: EditOrgMemberModel) -> CrudResponseModel:
        await CenterDao.create_org_member(db, data)
        await db.commit()
        return CrudResponseModel(is_success=True, message='新增成功')

    @classmethod
    async def update_org_member(cls, db: AsyncSession, member_id: int, data: EditOrgMemberModel) -> CrudResponseModel:
        existing = await CenterDao.get_org_member(db, member_id)
        if existing is None:
            return CrudResponseModel(is_success=False, message='成员不存在')
        await CenterDao.update_org_member(db, member_id, data)
        await db.commit()
        return CrudResponseModel(is_success=True, message='更新成功')

    @classmethod
    async def delete_org_member(cls, db: AsyncSession, member_id: int) -> CrudResponseModel:
        existing = await CenterDao.get_org_member(db, member_id)
        if existing is None:
            return CrudResponseModel(is_success=False, message='成员不存在')
        await CenterDao.delete_org_member(db, member_id)
        await db.commit()
        return CrudResponseModel(is_success=True, message='删除成功')

    # ===== 核心团队成员 =====

    @classmethod
    async def get_team_members(cls, db: AsyncSession, include_disabled: bool = False, tenant_id: int | None = None) -> list[dict]:
        if include_disabled:
            objs = await CenterDao.get_all_team_members(db, tenant_id)
        else:
            objs = await CenterDao.get_team_members(db, tenant_id)
        return [TeamMemberModel.model_validate(o).model_dump(by_alias=True) for o in objs]

    @classmethod
    async def create_team_member(cls, db: AsyncSession, data: EditTeamMemberModel) -> CrudResponseModel:
        await CenterDao.create_team_member(db, data)
        await db.commit()
        return CrudResponseModel(is_success=True, message='新增成功')

    @classmethod
    async def update_team_member(cls, db: AsyncSession, member_id: int, data: EditTeamMemberModel) -> CrudResponseModel:
        existing = await CenterDao.get_team_member(db, member_id)
        if existing is None:
            return CrudResponseModel(is_success=False, message='成员不存在')
        await CenterDao.update_team_member(db, member_id, data)
        await db.commit()
        return CrudResponseModel(is_success=True, message='更新成功')

    @classmethod
    async def delete_team_member(cls, db: AsyncSession, member_id: int) -> CrudResponseModel:
        existing = await CenterDao.get_team_member(db, member_id)
        if existing is None:
            return CrudResponseModel(is_success=False, message='成员不存在')
        await CenterDao.delete_team_member(db, member_id)
        await db.commit()
        return CrudResponseModel(is_success=True, message='删除成功')

    @classmethod
    async def get_full_center_info(cls, db: AsyncSession, tenant_id: int | None = None) -> dict:
        """获取完整中心信息（含组织架构和团队成员），用于门户展示"""
        info = await cls.get_center_info(db, tenant_id)
        org_members = await cls.get_org_members(db, tenant_id)
        team_members = await cls.get_team_members(db, tenant_id=tenant_id)
        return {
            'info': info or {},
            'orgMembers': org_members,
            'teamMembers': team_members,
        }

