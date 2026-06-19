"""SimHub 中心信息 DAO"""
from sqlalchemy import delete, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from module_simhub.entity.do.simhub_do import VfCenterInfo, VfOrgMember, VfTeamMember
from module_simhub.entity.vo.center_vo import EditCenterInfoModel, EditOrgMemberModel, EditTeamMemberModel


class CenterDao:
    """实验中心信息数据库操作层"""

    # ===== 中心基本信息 =====

    @classmethod
    async def get_center_info(cls, db: AsyncSession, tenant_id: int | None = None) -> VfCenterInfo | None:
        stmt = select(VfCenterInfo)
        if tenant_id is not None:
            stmt = stmt.where(VfCenterInfo.tenant_id == tenant_id)
        result = (await db.execute(stmt.order_by(VfCenterInfo.id).limit(1))).scalars().first()
        return result

    @classmethod
    async def upsert_center_info(cls, db: AsyncSession, update_by: str, data: EditCenterInfoModel, tenant_id: int | None = None) -> VfCenterInfo:
        """更新或创建中心信息（每租户一条记录）"""
        existing = await cls.get_center_info(db, tenant_id)
        if existing is None:
            dump = data.model_dump(exclude_none=True, by_alias=False)
            if tenant_id is not None:
                dump['tenant_id'] = tenant_id
            center = VfCenterInfo(update_by=update_by, **dump)
            db.add(center)
            await db.flush()
            return center
        else:
            update_data = data.model_dump(exclude_none=True, by_alias=False)
            update_data['update_by'] = update_by
            if tenant_id is not None:
                update_data['tenant_id'] = tenant_id
            await db.execute(
                update(VfCenterInfo).where(VfCenterInfo.id == existing.id).values(**update_data)
            )
            await db.flush()
            updated = await cls.get_center_info(db, tenant_id)
            return updated  # type: ignore[return-value]

    # ===== 组织架构成员 =====

    @classmethod
    async def get_org_members(cls, db: AsyncSession, tenant_id: int | None = None) -> list[VfOrgMember]:
        stmt = select(VfOrgMember)
        if tenant_id is not None:
            stmt = stmt.where(VfOrgMember.tenant_id == tenant_id)
        result = await db.execute(stmt.order_by(VfOrgMember.sort_order))
        return list(result.scalars().all())

    @classmethod
    async def get_org_member(cls, db: AsyncSession, member_id: int) -> VfOrgMember | None:
        return (await db.execute(select(VfOrgMember).where(VfOrgMember.id == member_id))).scalars().first()

    @classmethod
    async def create_org_member(cls, db: AsyncSession, data: EditOrgMemberModel) -> VfOrgMember:
        member = VfOrgMember(**data.model_dump(by_alias=False))
        db.add(member)
        await db.flush()
        return member

    @classmethod
    async def update_org_member(cls, db: AsyncSession, member_id: int, data: EditOrgMemberModel) -> None:
        await db.execute(
            update(VfOrgMember).where(VfOrgMember.id == member_id).values(**data.model_dump(exclude_none=True, by_alias=False))
        )
        await db.flush()

    @classmethod
    async def delete_org_member(cls, db: AsyncSession, member_id: int) -> None:
        await db.execute(delete(VfOrgMember).where(VfOrgMember.id == member_id))
        await db.flush()

    # ===== 核心团队成员 =====

    @classmethod
    async def get_team_members(cls, db: AsyncSession, tenant_id: int | None = None) -> list[VfTeamMember]:
        stmt = select(VfTeamMember).where(VfTeamMember.status == '0')
        if tenant_id is not None:
            stmt = stmt.where(VfTeamMember.tenant_id == tenant_id)
        result = await db.execute(stmt.order_by(VfTeamMember.sort_order))
        return list(result.scalars().all())

    @classmethod
    async def get_all_team_members(cls, db: AsyncSession, tenant_id: int | None = None) -> list[VfTeamMember]:
        stmt = select(VfTeamMember)
        if tenant_id is not None:
            stmt = stmt.where(VfTeamMember.tenant_id == tenant_id)
        result = await db.execute(stmt.order_by(VfTeamMember.sort_order))
        return list(result.scalars().all())

    @classmethod
    async def get_team_member(cls, db: AsyncSession, member_id: int) -> VfTeamMember | None:
        return (await db.execute(select(VfTeamMember).where(VfTeamMember.id == member_id))).scalars().first()

    @classmethod
    async def create_team_member(cls, db: AsyncSession, data: EditTeamMemberModel) -> VfTeamMember:
        member = VfTeamMember(**data.model_dump(by_alias=False))
        db.add(member)
        await db.flush()
        return member

    @classmethod
    async def update_team_member(cls, db: AsyncSession, member_id: int, data: EditTeamMemberModel) -> None:
        await db.execute(
            update(VfTeamMember).where(VfTeamMember.id == member_id).values(**data.model_dump(exclude_none=True, by_alias=False))
        )
        await db.flush()

    @classmethod
    async def delete_team_member(cls, db: AsyncSession, member_id: int) -> None:
        await db.execute(delete(VfTeamMember).where(VfTeamMember.id == member_id))
        await db.flush()

