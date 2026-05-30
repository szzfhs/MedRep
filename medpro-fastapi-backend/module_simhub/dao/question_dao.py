"""SimHub 习题 DAO"""
import math
from datetime import datetime

from sqlalchemy import desc, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from common.vo import PageModel
from module_simhub.entity.do.simhub_do import VfQuestion, VfSectionQuestion
from module_simhub.entity.vo.question_vo import QuestionPageQueryModel


class QuestionDao:
    @classmethod
    async def get_question_list(cls, db: AsyncSession, query: QuestionPageQueryModel) -> PageModel:
        conditions = [VfQuestion.del_flag == '0']
        if query.question_name:
            conditions.append(VfQuestion.question_name.like(f'%{query.question_name}%'))
        if query.question_type:
            conditions.append(VfQuestion.question_type == query.question_type)
        if query.difficulty is not None:
            conditions.append(VfQuestion.difficulty == query.difficulty)
        if query.status is not None:
            conditions.append(VfQuestion.status == query.status)
        if query.tenant_id is not None:
            if query.tenant_id == 0:
                conditions.append(VfQuestion.tenant_id.is_(None))
            else:
                conditions.append(VfQuestion.tenant_id == query.tenant_id)

        count_result = await db.execute(select(func.count()).where(*conditions))
        total = count_result.scalar() or 0

        offset = (query.page_num - 1) * query.page_size
        rows_result = await db.execute(
            select(VfQuestion)
            .where(*conditions)
            .order_by(desc(VfQuestion.create_time))
            .offset(offset)
            .limit(query.page_size)
        )
        rows = rows_result.scalars().all()
        has_next = math.ceil(total / query.page_size) > query.page_num if query.page_size > 0 else False
        return PageModel(rows=rows, pageNum=query.page_num, pageSize=query.page_size, total=total, hasNext=has_next)

    @classmethod
    async def get_question_by_id(cls, db: AsyncSession, question_id: int) -> VfQuestion | None:
        result = await db.execute(
            select(VfQuestion).where(VfQuestion.question_id == question_id, VfQuestion.del_flag == '0')
        )
        return result.scalars().first()

    @classmethod
    async def add_question(cls, db: AsyncSession, create_by: str, data: dict) -> VfQuestion:
        q = VfQuestion(**data, create_by=create_by, create_time=datetime.now())
        db.add(q)
        await db.flush()
        return q

    @classmethod
    async def edit_question(cls, db: AsyncSession, update_by: str, question_id: int, data: dict) -> None:
        data['update_by'] = update_by
        data['update_time'] = datetime.now()
        await db.execute(
            update(VfQuestion).where(VfQuestion.question_id == question_id).values(**data)
        )
        await db.flush()

    @classmethod
    async def delete_question(cls, db: AsyncSession, question_ids: list[int]) -> None:
        await db.execute(
            update(VfQuestion).where(VfQuestion.question_id.in_(question_ids)).values(del_flag='2')
        )
        await db.flush()


class SectionQuestionDao:
    @classmethod
    async def get_questions_by_section(cls, db: AsyncSession, section_id: int) -> list[VfSectionQuestion]:
        result = await db.execute(
            select(VfSectionQuestion)
            .where(VfSectionQuestion.section_id == section_id, VfSectionQuestion.status == '0')
            .order_by(VfSectionQuestion.sort_order)
        )
        return list(result.scalars().all())

    @classmethod
    async def get_questions_by_course(cls, db: AsyncSession, course_id: int) -> list[VfSectionQuestion]:
        result = await db.execute(
            select(VfSectionQuestion)
            .where(VfSectionQuestion.course_id == course_id, VfSectionQuestion.status == '0')
            .order_by(VfSectionQuestion.section_id, VfSectionQuestion.sort_order)
        )
        return list(result.scalars().all())

    @classmethod
    async def add_section_question(
        cls, db: AsyncSession, section_id: int, course_id: int, question_id: int, sort_order: int = 0
    ) -> VfSectionQuestion:
        rel = VfSectionQuestion(
            section_id=section_id,
            course_id=course_id,
            question_id=question_id,
            sort_order=sort_order,
            create_time=datetime.now(),
        )
        db.add(rel)
        await db.flush()
        return rel

    @classmethod
    async def remove_section_question(cls, db: AsyncSession, section_id: int, question_id: int) -> None:
        result = await db.execute(
            select(VfSectionQuestion).where(
                VfSectionQuestion.section_id == section_id,
                VfSectionQuestion.question_id == question_id,
            )
        )
        rel = result.scalars().first()
        if rel:
            await db.delete(rel)
            await db.flush()

    @classmethod
    async def check_exists(cls, db: AsyncSession, section_id: int, question_id: int) -> bool:
        result = await db.execute(
            select(func.count()).where(
                VfSectionQuestion.section_id == section_id,
                VfSectionQuestion.question_id == question_id,
            )
        )
        return (result.scalar() or 0) > 0
