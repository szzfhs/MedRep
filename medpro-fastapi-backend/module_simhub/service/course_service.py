"""SimHub 课程 Service"""
from sqlalchemy.ext.asyncio import AsyncSession

from common.vo import CrudResponseModel, PageModel
from module_simhub.dao.course_dao import (
    CourseDao,
    CourseSectionDao,
    EnrollmentDao,
    LearningProgressDao,
)
from module_simhub.entity.do.simhub_do import VfCourse, VfCourseSection
from module_simhub.entity.vo.course_vo import (
    AddCourseModel,
    AddSectionModel,
    CourseSectionModel,
    CourseModel,
    CoursePageQueryModel,
    DeleteCourseModel,
    EditCourseModel,
    EditSectionModel,
    UpdateProgressModel,
)


def _build_section_tree(sections: list[VfCourseSection], parent_id: int = 0) -> list[dict]:
    result = []
    for s in sections:
        if (s.parent_id or 0) == parent_id:
            node = CourseSectionModel.model_validate(s).model_dump(by_alias=True)
            children = _build_section_tree(sections, s.section_id)  # type: ignore[arg-type]
            if children:
                node['children'] = children
            result.append(node)
    return result


class CourseService:
    @classmethod
    async def get_course_list(cls, db: AsyncSession, query: CoursePageQueryModel) -> PageModel:
        page = await CourseDao.get_course_list(db, query)
        page.rows = [CourseModel.model_validate(r).model_dump(by_alias=True) for r in page.rows]
        return page

    @classmethod
    async def get_course_detail(cls, db: AsyncSession, course_id: int) -> dict | None:
        course = await CourseDao.get_course_by_id(db, course_id)
        if course is None:
            return None
        return CourseModel.model_validate(course).model_dump(by_alias=True)

    @classmethod
    async def add_course(cls, db: AsyncSession, create_by: str, data: AddCourseModel) -> CrudResponseModel:
        course_data = data.model_dump(exclude_none=True, by_alias=False)
        await CourseDao.add_course(db, create_by, course_data)
        await db.commit()
        return CrudResponseModel(is_success=True, message='新增成功')

    @classmethod
    async def edit_course(cls, db: AsyncSession, update_by: str, data: EditCourseModel) -> CrudResponseModel:
        course = await CourseDao.get_course_by_id(db, data.course_id)
        if not course:
            return CrudResponseModel(is_success=False, message='课程不存在')
        update_data = data.model_dump(exclude={'course_id'}, exclude_none=True, by_alias=False)
        await CourseDao.edit_course(db, update_by, data.course_id, update_data)
        await db.commit()
        return CrudResponseModel(is_success=True, message='更新成功')

    @classmethod
    async def delete_course(cls, db: AsyncSession, data: DeleteCourseModel) -> CrudResponseModel:
        ids = [int(i) for i in data.course_ids.split(',')]
        await CourseDao.delete_course(db, ids)
        await db.commit()
        return CrudResponseModel(is_success=True, message='删除成功')

    @classmethod
    async def get_sections(cls, db: AsyncSession, course_id: int) -> list[dict]:
        sections = await CourseSectionDao.get_sections_by_course(db, course_id)
        return _build_section_tree(sections)

    @classmethod
    async def add_section(cls, db: AsyncSession, data: AddSectionModel) -> CrudResponseModel:
        await CourseSectionDao.add_section(db, data.model_dump(exclude_none=True, by_alias=False))
        await db.commit()
        return CrudResponseModel(is_success=True, message='新增成功')

    @classmethod
    async def edit_section(cls, db: AsyncSession, data: EditSectionModel) -> CrudResponseModel:
        section = await CourseSectionDao.get_section_by_id(db, data.section_id)
        if not section:
            return CrudResponseModel(is_success=False, message='章节不存在')
        update_data = data.model_dump(exclude={'section_id'}, exclude_none=True, by_alias=False)
        await CourseSectionDao.edit_section(db, data.section_id, update_data)
        await db.commit()
        return CrudResponseModel(is_success=True, message='更新成功')

    @classmethod
    async def delete_section(cls, db: AsyncSession, section_id: int) -> CrudResponseModel:
        await CourseSectionDao.delete_section(db, section_id)
        await db.commit()
        return CrudResponseModel(is_success=True, message='删除成功')

    @classmethod
    async def enroll(cls, db: AsyncSession, user_id: int, course_id: int) -> CrudResponseModel:
        course = await CourseDao.get_course_by_id(db, course_id)
        if not course:
            return CrudResponseModel(is_success=False, message='课程不存在')
        existing = await EnrollmentDao.get_enrollment(db, user_id, course_id)
        if existing:
            return CrudResponseModel(is_success=True, message='已选课')
        await EnrollmentDao.enroll(db, user_id, course_id)
        await CourseDao.increment_enroll(db, course_id)
        return CrudResponseModel(is_success=True, message='选课成功')

    @classmethod
    async def get_enrolled_courses(cls, db: AsyncSession, user_id: int) -> list:
        enrollments = await EnrollmentDao.get_enrolled_courses(db, user_id)
        course_ids = [e.course_id for e in enrollments]
        courses = []
        for cid in course_ids:
            c = await CourseDao.get_course_by_id(db, cid)
            if c:
                courses.append(c)
        return courses

    @classmethod
    async def update_learning_progress(
        cls, db: AsyncSession, user_id: int, data: UpdateProgressModel
    ) -> CrudResponseModel:
        progress = await LearningProgressDao.get_or_create_progress(
            db, user_id, data.course_id, data.section_id, data.resource_id
        )
        await LearningProgressDao.update_progress(db, progress.progress_id, data)
        return CrudResponseModel(is_success=True, message='进度已更新')

    @classmethod
    async def get_course_progress(cls, db: AsyncSession, user_id: int, course_id: int) -> list:
        return await LearningProgressDao.get_course_progress(db, user_id, course_id)

    @classmethod
    async def link_section_experiment(
        cls, db: AsyncSession, section_id: int, exp_id: int, sort_order: int = 0
    ) -> CrudResponseModel:
        await CourseSectionDao.add_section_experiment(db, section_id, exp_id, sort_order)
        return CrudResponseModel(is_success=True, message='关联成功')

    @classmethod
    async def unlink_section_experiment(
        cls, db: AsyncSession, section_id: int, exp_id: int
    ) -> CrudResponseModel:
        await CourseSectionDao.remove_section_experiment(db, section_id, exp_id)
        return CrudResponseModel(is_success=True, message='取消关联成功')

    @classmethod
    async def link_section_resource(
        cls, db: AsyncSession, section_id: int, resource_id: int, sort_order: int = 0
    ) -> CrudResponseModel:
        await CourseSectionDao.add_section_resource(db, section_id, resource_id, sort_order)
        return CrudResponseModel(is_success=True, message='关联成功')

    @classmethod
    async def unlink_section_resource(
        cls, db: AsyncSession, section_id: int, resource_id: int
    ) -> CrudResponseModel:
        await CourseSectionDao.remove_section_resource(db, section_id, resource_id)
        return CrudResponseModel(is_success=True, message='取消关联成功')
