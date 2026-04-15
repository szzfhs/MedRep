"""SimHub 规章制度 Service"""
from sqlalchemy.ext.asyncio import AsyncSession

from common.vo import CrudResponseModel, PageModel
from module_simhub.dao.regulation_dao import RegulationDao
from module_simhub.entity.do.simhub_do import VfRegulation
from module_simhub.entity.vo.regulation_vo import (
    AddRegulationModel,
    DeleteRegulationModel,
    EditRegulationModel,
    RegulationModel,
    RegulationPageQueryModel,
)


class RegulationService:
    @classmethod
    async def get_list(cls, db: AsyncSession, query: RegulationPageQueryModel) -> PageModel:
        return await cls.get_regulation_list(db, query)

    @classmethod
    async def get_regulation_list(cls, db: AsyncSession, query: RegulationPageQueryModel) -> PageModel:
        page = await RegulationDao.get_regulation_list(db, query)
        page.rows = [RegulationModel.model_validate(r).model_dump(by_alias=True) for r in page.rows]
        return page

    @classmethod
    async def get_detail(cls, db: AsyncSession, reg_id: int) -> dict | None:
        return await cls.get_regulation_detail(db, reg_id)

    @classmethod
    async def get_regulation_detail(cls, db: AsyncSession, reg_id: int) -> dict | None:
        reg = await RegulationDao.get_regulation_by_id(db, reg_id)
        if reg is None:
            return None
        return RegulationModel.model_validate(reg).model_dump(by_alias=True)

    @classmethod
    async def add(cls, db: AsyncSession, create_by: str, data: AddRegulationModel) -> CrudResponseModel:
        reg_data = data.model_dump(exclude_none=True, by_alias=False)
        await RegulationDao.add_regulation(db, create_by, reg_data)
        await db.commit()
        return CrudResponseModel(is_success=True, message='新增成功')

    @classmethod
    async def add_regulation(cls, db: AsyncSession, create_by: str, data: AddRegulationModel) -> CrudResponseModel:
        """控制器调用别名。"""
        return await cls.add(db, create_by, data)

    @classmethod
    async def edit(cls, db: AsyncSession, update_by: str, data: EditRegulationModel) -> CrudResponseModel:
        reg = await RegulationDao.get_regulation_by_id(db, data.reg_id)
        if not reg:
            return CrudResponseModel(is_success=False, message='规章制度不存在')
        update_data = data.model_dump(exclude={'reg_id'}, exclude_none=True, by_alias=False)
        await RegulationDao.edit_regulation(db, update_by, data.reg_id, update_data)
        await db.commit()
        return CrudResponseModel(is_success=True, message='更新成功')

    @classmethod
    async def edit_regulation(cls, db: AsyncSession, update_by: str, data: EditRegulationModel) -> CrudResponseModel:
        """控制器调用别名。"""
        return await cls.edit(db, update_by, data)

    @classmethod
    async def delete(cls, db: AsyncSession, data: DeleteRegulationModel) -> CrudResponseModel:
        ids = [int(i) for i in data.reg_ids.split(',')]
        await RegulationDao.delete_regulation(db, ids)
        await db.commit()
        return CrudResponseModel(is_success=True, message='删除成功')

    @classmethod
    async def delete_regulation(cls, db: AsyncSession, data: DeleteRegulationModel) -> CrudResponseModel:
        """控制器调用别名。"""
        return await cls.delete(db, data)
