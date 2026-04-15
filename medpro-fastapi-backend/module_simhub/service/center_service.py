"""SimHub 中心信息 Service"""
from sqlalchemy.ext.asyncio import AsyncSession

from common.vo import CrudResponseModel
from module_simhub.dao.center_dao import CenterDao
from module_simhub.entity.do.simhub_do import VfCenterInfo
from module_simhub.entity.vo.center_vo import CenterInfoModel, EditCenterInfoModel


class CenterService:
    @classmethod
    async def get_center_info(cls, db: AsyncSession) -> dict | None:
        obj = await CenterDao.get_center_info(db)
        if obj is None:
            return None
        return CenterInfoModel.model_validate(obj).model_dump(by_alias=True)

    @classmethod
    async def update_center_info(cls, db: AsyncSession, update_by: str, data: EditCenterInfoModel) -> CrudResponseModel:
        await CenterDao.upsert_center_info(db, update_by, data)
        await db.commit()
        return CrudResponseModel(is_success=True, message='更新成功')
