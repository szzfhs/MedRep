"""SimHub 行政班级管理 Service"""
from sqlalchemy.ext.asyncio import AsyncSession

from common.vo import CrudResponseModel, PageModel
from module_simhub.dao.class_admin_dao import ClassAdminDao, ClassStudentDao, TermConfigDao
from module_simhub.entity.vo.class_admin_vo import (
    AddClassAdminModel,
    AddClassStudentModel,
    AddTermConfigModel,
    BatchAddClassStudentModel,
    ClassAdminModel,
    ClassAdminPageQueryModel,
    ClassStudentModel,
    ClassStudentPageQueryModel,
    DeleteClassAdminModel,
    DeleteClassStudentModel,
    DeleteTermConfigModel,
    EditClassAdminModel,
    EditTermConfigModel,
    TermConfigModel,
    TermConfigPageQueryModel,
)


class TermConfigService:
    """学年学期配置 Service"""

    @classmethod
    async def get_term_list(cls, db: AsyncSession, query: TermConfigPageQueryModel) -> PageModel:
        """分页查询学年学期"""
        page = await TermConfigDao.get_term_list(db, query)
        page.rows = [TermConfigModel.model_validate(r).model_dump(by_alias=True) for r in page.rows]
        return page

    @classmethod
    async def get_term_detail(cls, db: AsyncSession, term_id: int) -> dict | None:
        """获取学年学期详情"""
        term = await TermConfigDao.get_term_by_id(db, term_id)
        if term is None:
            return None
        return TermConfigModel.model_validate(term).model_dump(by_alias=True)

    @classmethod
    async def add_term(cls, db: AsyncSession, create_by: str, data: AddTermConfigModel) -> CrudResponseModel:
        """新增学年学期"""
        create_data = data.model_dump(exclude_none=True, by_alias=False)
        # 如果设置为当前学期，先清除其他学期的当前标记
        if create_data.get('is_current') == '1':
            await TermConfigDao.set_current_term(db, 0)  # 清除所有
        term = await TermConfigDao.add_term(db, create_by, create_data)
        # 如果是当前学期，设置标记
        if create_data.get('is_current') == '1':
            await TermConfigDao.set_current_term(db, term.term_id)
        await db.commit()
        return CrudResponseModel(is_success=True, message='新增成功')

    @classmethod
    async def edit_term(cls, db: AsyncSession, update_by: str, data: EditTermConfigModel) -> CrudResponseModel:
        """编辑学年学期"""
        term = await TermConfigDao.get_term_by_id(db, data.term_id)
        if not term:
            return CrudResponseModel(is_success=False, message='学年学期不存在')
        update_data = data.model_dump(exclude={'term_id'}, exclude_none=True, by_alias=False)
        # 如果设置为当前学期，先清除其他学期的当前标记
        if update_data.get('is_current') == '1':
            await TermConfigDao.set_current_term(db, data.term_id)
        await TermConfigDao.edit_term(db, update_by, data.term_id, update_data)
        await db.commit()
        return CrudResponseModel(is_success=True, message='更新成功')

    @classmethod
    async def delete_term(cls, db: AsyncSession, data: DeleteTermConfigModel) -> CrudResponseModel:
        """删除学年学期"""
        ids = [int(i) for i in data.term_ids.split(',') if i.strip().isdigit()]
        if not ids:
            return CrudResponseModel(is_success=False, message='无效的ID')
        await TermConfigDao.delete_terms(db, ids)
        await db.commit()
        return CrudResponseModel(is_success=True, message='删除成功')

    @classmethod
    async def get_all_active(cls, db: AsyncSession) -> list[dict]:
        """获取所有启用的学年学期（用于下拉选项）"""
        terms = await TermConfigDao.get_all_active(db)
        return [TermConfigModel.model_validate(t).model_dump(by_alias=True) for t in terms]


class ClassAdminService:
    """行政班级 Service"""

    @classmethod
    async def get_class_list(cls, db: AsyncSession, query: ClassAdminPageQueryModel) -> PageModel:
        """分页查询行政班级"""
        page = await ClassAdminDao.get_class_list(db, query)
        page.rows = [ClassAdminModel.model_validate(r).model_dump(by_alias=True) for r in page.rows]
        return page

    @classmethod
    async def get_class_detail(cls, db: AsyncSession, class_id: int) -> dict | None:
        """获取行政班级详情"""
        class_admin = await ClassAdminDao.get_class_by_id(db, class_id)
        if class_admin is None:
            return None
        return ClassAdminModel.model_validate(class_admin).model_dump(by_alias=True)

    @classmethod
    async def add_class(cls, db: AsyncSession, create_by: str, data: AddClassAdminModel) -> CrudResponseModel:
        """新增行政班级"""
        create_data = data.model_dump(exclude_none=True, by_alias=False)
        await ClassAdminDao.add_class(db, create_by, create_data)
        await db.commit()
        return CrudResponseModel(is_success=True, message='新增成功')

    @classmethod
    async def edit_class(cls, db: AsyncSession, update_by: str, data: EditClassAdminModel) -> CrudResponseModel:
        """编辑行政班级"""
        class_admin = await ClassAdminDao.get_class_by_id(db, data.class_id)
        if not class_admin:
            return CrudResponseModel(is_success=False, message='行政班级不存在')
        update_data = data.model_dump(exclude={'class_id'}, exclude_none=True, by_alias=False)
        await ClassAdminDao.edit_class(db, update_by, data.class_id, update_data)
        await db.commit()
        return CrudResponseModel(is_success=True, message='更新成功')

    @classmethod
    async def delete_class(cls, db: AsyncSession, data: DeleteClassAdminModel) -> CrudResponseModel:
        """删除行政班级"""
        ids = [int(i) for i in data.class_ids.split(',') if i.strip().isdigit()]
        if not ids:
            return CrudResponseModel(is_success=False, message='无效的ID')
        await ClassAdminDao.delete_classes(db, ids)
        await db.commit()
        return CrudResponseModel(is_success=True, message='删除成功')

    @classmethod
    async def get_all_active(cls, db: AsyncSession) -> list[dict]:
        """获取所有启用的行政班级（用于下拉选项）"""
        classes = await ClassAdminDao.get_all_active(db)
        return [ClassAdminModel.model_validate(c).model_dump(by_alias=True) for c in classes]


class ClassStudentService:
    """班级学生 Service"""

    @classmethod
    async def get_student_list(cls, db: AsyncSession, query: ClassStudentPageQueryModel) -> PageModel:
        """分页查询班级学生"""
        page = await ClassStudentDao.get_student_list(db, query)
        page.rows = [ClassStudentModel.model_validate(r).model_dump(by_alias=True) for r in page.rows]
        return page

    @classmethod
    async def add_student(cls, db: AsyncSession, create_by: str, data: AddClassStudentModel) -> CrudResponseModel:
        """添加班级学生"""
        # 检查是否已存在
        exists = await ClassStudentDao.check_exists(db, data.class_id, data.user_id)
        if exists:
            return CrudResponseModel(is_success=False, message='该学生已在班级中')
        create_data = data.model_dump(exclude_none=True, by_alias=False)
        await ClassStudentDao.add_student(db, create_by, create_data)
        # 更新班级学生人数
        await ClassAdminDao.update_student_count(db, data.class_id)
        await db.commit()
        return CrudResponseModel(is_success=True, message='添加成功')

    @classmethod
    async def batch_add_students(
        cls, db: AsyncSession, create_by: str, data: BatchAddClassStudentModel
    ) -> CrudResponseModel:
        """批量添加班级学生"""
        await ClassStudentDao.batch_add_students(db, create_by, data.class_id, data.user_ids)
        # 更新班级学生人数
        await ClassAdminDao.update_student_count(db, data.class_id)
        await db.commit()
        return CrudResponseModel(is_success=True, message='批量添加成功')

    @classmethod
    async def delete_student(cls, db: AsyncSession, data: DeleteClassStudentModel) -> CrudResponseModel:
        """删除班级学生"""
        ids = [int(i) for i in data.ids.split(',') if i.strip().isdigit()]
        if not ids:
            return CrudResponseModel(is_success=False, message='无效的ID')
        # 获取班级ID用于更新学生人数
        first_student = await ClassStudentDao.get_student_by_id(db, ids[0])
        class_id = first_student.class_id if first_student else None
        
        await ClassStudentDao.delete_students(db, ids)
        # 更新班级学生人数
        if class_id:
            await ClassAdminDao.update_student_count(db, class_id)
        await db.commit()
        return CrudResponseModel(is_success=True, message='删除成功')
