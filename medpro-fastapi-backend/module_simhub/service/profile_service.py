"""SimHub 用户档案 Service"""
from sqlalchemy.ext.asyncio import AsyncSession

from common.vo import CrudResponseModel
from module_simhub.dao.profile_dao import StudentProfileDao, TeacherProfileDao
from module_simhub.entity.vo.profile_vo import EditStudentProfileModel, EditTeacherProfileModel, StudentProfileModel, TeacherProfileModel


class StudentProfileService:
    @classmethod
    async def get_profile(cls, db: AsyncSession, user_id: int) -> dict | None:
        obj = await StudentProfileDao.get_by_user_id(db, user_id)
        if obj is None:
            return None
        return StudentProfileModel.model_validate(obj).model_dump(by_alias=True)

    @classmethod
    async def save_profile(
        cls, db: AsyncSession, user_id: int, data: EditStudentProfileModel
    ) -> CrudResponseModel:
        profile_data = data.model_dump(exclude_none=True, by_alias=False)
        await StudentProfileDao.upsert(db, user_id, profile_data)
        return CrudResponseModel(is_success=True, message='保存成功')


class TeacherProfileService:
    @classmethod
    async def get_profile(cls, db: AsyncSession, user_id: int) -> dict | None:
        obj = await TeacherProfileDao.get_by_user_id(db, user_id)
        if obj is None:
            return None
        return TeacherProfileModel.model_validate(obj).model_dump(by_alias=True)

    @classmethod
    async def save_profile(
        cls, db: AsyncSession, user_id: int, data: EditTeacherProfileModel
    ) -> CrudResponseModel:
        profile_data = data.model_dump(exclude_none=True, by_alias=False)
        await TeacherProfileDao.upsert(db, user_id, profile_data)
        return CrudResponseModel(is_success=True, message='保存成功')
