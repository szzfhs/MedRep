"""SimHub 中心信息 DAO"""
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from module_simhub.entity.do.simhub_do import VfCenterInfo
from module_simhub.entity.vo.center_vo import EditCenterInfoModel


class CenterDao:
    """实验中心信息数据库操作层"""

    @classmethod
    async def get_center_info(cls, db: AsyncSession) -> VfCenterInfo | None:
        result = (await db.execute(select(VfCenterInfo).limit(1))).scalars().first()
        return result

    @classmethod
    async def upsert_center_info(cls, db: AsyncSession, update_by: str, data: EditCenterInfoModel) -> VfCenterInfo:
        """更新或创建中心信息（始终保持一条记录）"""
        existing = await cls.get_center_info(db)
        if existing is None:
            center = VfCenterInfo(
                update_by=update_by,
                **data.model_dump(exclude_none=True, by_alias=False),
            )
            db.add(center)
            await db.flush()
            return center
        else:
            update_data = data.model_dump(exclude_none=True, by_alias=False)
            update_data['update_by'] = update_by
            await db.execute(
                update(VfCenterInfo).where(VfCenterInfo.id == existing.id).values(**update_data)
            )
            await db.flush()
            updated = await cls.get_center_info(db)
            return updated  # type: ignore[return-value]
