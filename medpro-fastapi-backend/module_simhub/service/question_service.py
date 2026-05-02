"""SimHub 习题 Service"""
from sqlalchemy.ext.asyncio import AsyncSession

from common.vo import CrudResponseModel, PageModel
from module_simhub.dao.course_dao import CourseSectionDao
from module_simhub.dao.question_dao import QuestionDao, SectionQuestionDao
from module_simhub.entity.vo.question_vo import (
    AddQuestionModel,
    AddSectionQuestionModel,
    DeleteQuestionModel,
    EditQuestionModel,
    QuestionModel,
    QuestionPageQueryModel,
    SectionQuestionModel,
)


class QuestionService:
    @classmethod
    async def get_question_list(cls, db: AsyncSession, query: QuestionPageQueryModel) -> PageModel:
        page = await QuestionDao.get_question_list(db, query)
        page.rows = [QuestionModel.model_validate(r).model_dump(by_alias=True) for r in page.rows]
        return page

    @classmethod
    async def get_question_detail(cls, db: AsyncSession, question_id: int) -> dict | None:
        q = await QuestionDao.get_question_by_id(db, question_id)
        if q is None:
            return None
        return QuestionModel.model_validate(q).model_dump(by_alias=True)

    @classmethod
    async def add_question(
        cls, db: AsyncSession, create_by: str, data: AddQuestionModel
    ) -> CrudResponseModel:
        create_data = data.model_dump(exclude_none=True, by_alias=False)
        await QuestionDao.add_question(db, create_by, create_data)
        await db.commit()
        return CrudResponseModel(is_success=True, message='新增成功')

    @classmethod
    async def edit_question(
        cls, db: AsyncSession, update_by: str, data: EditQuestionModel
    ) -> CrudResponseModel:
        q = await QuestionDao.get_question_by_id(db, data.question_id)
        if not q:
            return CrudResponseModel(is_success=False, message='习题不存在')
        update_data = data.model_dump(exclude={'question_id'}, exclude_none=True, by_alias=False)
        await QuestionDao.edit_question(db, update_by, data.question_id, update_data)
        await db.commit()
        return CrudResponseModel(is_success=True, message='更新成功')

    @classmethod
    async def delete_question(
        cls, db: AsyncSession, data: DeleteQuestionModel
    ) -> CrudResponseModel:
        ids = [int(i) for i in data.question_ids.split(',') if i.strip().isdigit()]
        if not ids:
            return CrudResponseModel(is_success=False, message='ID参数无效')
        await QuestionDao.delete_question(db, ids)
        await db.commit()
        return CrudResponseModel(is_success=True, message='删除成功')


class SectionQuestionService:
    @classmethod
    async def get_section_questions(cls, db: AsyncSession, section_id: int) -> list[dict]:
        rels = await SectionQuestionDao.get_questions_by_section(db, section_id)
        result = []
        for rel in rels:
            q = await QuestionDao.get_question_by_id(db, rel.question_id)  # type: ignore[arg-type]
            item = SectionQuestionModel.model_validate(rel).model_dump(by_alias=True)
            if q:
                item['question'] = QuestionModel.model_validate(q).model_dump(by_alias=True)
            result.append(item)
        return result

    @classmethod
    async def add_section_question(
        cls, db: AsyncSession, data: AddSectionQuestionModel
    ) -> CrudResponseModel:
        # 校验章节是否存在并获取 course_id
        section = await CourseSectionDao.get_section_by_id(db, data.section_id)
        if not section:
            return CrudResponseModel(is_success=False, message='章节不存在')
        # 校验习题是否存在
        question = await QuestionDao.get_question_by_id(db, data.question_id)
        if not question:
            return CrudResponseModel(is_success=False, message='习题不存在')
        # 幂等检查
        exists = await SectionQuestionDao.check_exists(db, data.section_id, data.question_id)
        if exists:
            return CrudResponseModel(is_success=False, message='该习题已关联到此章节')
        await SectionQuestionDao.add_section_question(
            db,
            section_id=data.section_id,
            course_id=section.course_id,  # type: ignore[arg-type]
            question_id=data.question_id,
            sort_order=data.sort_order or 0,
        )
        await db.commit()
        return CrudResponseModel(is_success=True, message='关联成功')

    @classmethod
    async def remove_section_question(
        cls, db: AsyncSession, section_id: int, question_id: int
    ) -> CrudResponseModel:
        await SectionQuestionDao.remove_section_question(db, section_id, question_id)
        await db.commit()
        return CrudResponseModel(is_success=True, message='移除成功')
