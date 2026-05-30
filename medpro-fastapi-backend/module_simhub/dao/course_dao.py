"""SimHub 课程 DAO"""
import math
from datetime import datetime

from sqlalchemy import desc, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from common.vo import PageModel
from module_simhub.entity.do.simhub_do import (
    VfCourse,
    VfCourseEnrollment,
    VfCourseSection,
    VfLearningProgress,
    VfSectionExperiment,
    VfSectionResource,
)
from module_simhub.entity.vo.course_vo import CoursePageQueryModel, UpdateProgressModel


class CourseSectionDao:
    @classmethod
    async def get_sections_by_course(cls, db: AsyncSession, course_id: int) -> list[VfCourseSection]:
        result = await db.execute(
            select(VfCourseSection)
            .where(VfCourseSection.course_id == course_id)
            .order_by(VfCourseSection.sort_order)
        )
        return list(result.scalars().all())

    @classmethod
    async def get_section_by_id(cls, db: AsyncSession, section_id: int) -> VfCourseSection | None:
        result = await db.execute(
            select(VfCourseSection).where(VfCourseSection.section_id == section_id)
        )
        return result.scalars().first()

    @classmethod
    async def add_section(cls, db: AsyncSession, data: dict) -> VfCourseSection:
        section = VfCourseSection(**data)
        db.add(section)
        await db.flush()
        return section

    @classmethod
    async def edit_section(cls, db: AsyncSession, section_id: int, data: dict) -> None:
        await db.execute(
            update(VfCourseSection).where(VfCourseSection.section_id == section_id).values(**data)
        )
        await db.flush()

    @classmethod
    async def delete_section(cls, db: AsyncSession, section_id: int) -> None:
        section = await cls.get_section_by_id(db, section_id)
        if section:
            await db.delete(section)
            await db.flush()

    @classmethod
    async def get_section_experiments(cls, db: AsyncSession, section_id: int) -> list[VfSectionExperiment]:
        result = await db.execute(
            select(VfSectionExperiment)
            .where(VfSectionExperiment.section_id == section_id)
            .order_by(VfSectionExperiment.sort_order)
        )
        return list(result.scalars().all())

    @classmethod
    async def get_section_resources(cls, db: AsyncSession, section_id: int) -> list[VfSectionResource]:
        result = await db.execute(
            select(VfSectionResource)
            .where(VfSectionResource.section_id == section_id)
            .order_by(VfSectionResource.sort_order)
        )
        return list(result.scalars().all())

    @classmethod
    async def add_section_experiment(cls, db: AsyncSession, section_id: int, exp_id: int, sort_order: int = 0) -> None:
        # 通过 section 获取 course_id 以填充冗余字段
        section = await cls.get_section_by_id(db, section_id)
        course_id = section.course_id if section else None
        rel = VfSectionExperiment(section_id=section_id, exp_id=exp_id, sort_order=sort_order, course_id=course_id)
        db.add(rel)
        await db.flush()

    @classmethod
    async def remove_section_experiment(cls, db: AsyncSession, section_id: int, exp_id: int) -> None:
        result = await db.execute(
            select(VfSectionExperiment).where(
                VfSectionExperiment.section_id == section_id,
                VfSectionExperiment.exp_id == exp_id,
            )
        )
        rel = result.scalars().first()
        if rel:
            await db.delete(rel)
            await db.flush()

    @classmethod
    async def add_section_resource(cls, db: AsyncSession, section_id: int, resource_id: int, sort_order: int = 0) -> None:
        section = await cls.get_section_by_id(db, section_id)
        course_id = section.course_id if section else None
        rel = VfSectionResource(section_id=section_id, resource_id=resource_id, sort_order=sort_order, course_id=course_id)
        db.add(rel)
        await db.flush()

    @classmethod
    async def remove_section_resource(cls, db: AsyncSession, section_id: int, resource_id: int) -> None:
        result = await db.execute(
            select(VfSectionResource).where(
                VfSectionResource.section_id == section_id,
                VfSectionResource.resource_id == resource_id,
            )
        )
        rel = result.scalars().first()
        if rel:
            await db.delete(rel)
            await db.flush()


class CourseDao:
    @classmethod
    async def get_course_list(cls, db: AsyncSession, query: CoursePageQueryModel) -> PageModel:
        conditions = [VfCourse.del_flag == '0']
        if query.course_name:
            conditions.append(VfCourse.course_name.like(f'%{query.course_name}%'))
        if query.teacher_id:
            conditions.append(VfCourse.teacher_id == query.teacher_id)
        if query.status is not None:
            conditions.append(VfCourse.status == query.status)
        if query.course_category:
            conditions.append(VfCourse.course_category == query.course_category)
        if query.tenant_id is not None:
            if query.tenant_id == 0:
                conditions.append(VfCourse.tenant_id.is_(None))
            else:
                conditions.append(VfCourse.tenant_id == query.tenant_id)

        count_result = await db.execute(select(func.count()).where(*conditions))
        total = count_result.scalar() or 0

        offset = (query.page_num - 1) * query.page_size
        rows_result = await db.execute(
            select(VfCourse)
            .where(*conditions)
            .order_by(VfCourse.sort_order, desc(VfCourse.create_time))
            .offset(offset)
            .limit(query.page_size)
        )
        rows = rows_result.scalars().all()
        has_next = math.ceil(total / query.page_size) > query.page_num if query.page_size > 0 else False
        return PageModel(rows=rows, pageNum=query.page_num, pageSize=query.page_size, total=total, hasNext=has_next)

    @classmethod
    async def get_course_by_id(cls, db: AsyncSession, course_id: int) -> VfCourse | None:
        result = await db.execute(
            select(VfCourse).where(VfCourse.course_id == course_id, VfCourse.del_flag == '0')
        )
        return result.scalars().first()

    @classmethod
    async def add_course(cls, db: AsyncSession, create_by: str, data: dict) -> VfCourse:
        course = VfCourse(**data, create_by=create_by, create_time=datetime.now())
        db.add(course)
        await db.flush()
        return course

    @classmethod
    async def edit_course(cls, db: AsyncSession, update_by: str, course_id: int, data: dict) -> None:
        data['update_by'] = update_by
        data['update_time'] = datetime.now()
        await db.execute(update(VfCourse).where(VfCourse.course_id == course_id).values(**data))
        await db.flush()

    @classmethod
    async def delete_course(cls, db: AsyncSession, course_ids: list[int]) -> None:
        await db.execute(
            update(VfCourse).where(VfCourse.course_id.in_(course_ids)).values(del_flag='2')
        )
        await db.flush()

    @classmethod
    async def increment_enroll(cls, db: AsyncSession, course_id: int) -> None:
        await db.execute(
            update(VfCourse).where(VfCourse.course_id == course_id).values(enroll_count=VfCourse.enroll_count + 1)
        )
        await db.flush()


class EnrollmentDao:
    @classmethod
    async def get_enrollment(cls, db: AsyncSession, user_id: int, course_id: int) -> VfCourseEnrollment | None:
        result = await db.execute(
            select(VfCourseEnrollment).where(
                VfCourseEnrollment.user_id == user_id,
                VfCourseEnrollment.course_id == course_id,
            )
        )
        return result.scalars().first()

    @classmethod
    async def enroll(cls, db: AsyncSession, user_id: int, course_id: int) -> VfCourseEnrollment:
        enrollment = VfCourseEnrollment(user_id=user_id, course_id=course_id, enroll_time=datetime.now(), status='0')
        db.add(enrollment)
        await db.flush()
        return enrollment

    @classmethod
    async def get_enrolled_courses(cls, db: AsyncSession, user_id: int) -> list[VfCourseEnrollment]:
        result = await db.execute(
            select(VfCourseEnrollment).where(VfCourseEnrollment.user_id == user_id)
        )
        return list(result.scalars().all())

    @classmethod
    async def get_course_students(cls, db: AsyncSession, course_id: int) -> list[VfCourseEnrollment]:
        result = await db.execute(
            select(VfCourseEnrollment).where(VfCourseEnrollment.course_id == course_id)
        )
        return list(result.scalars().all())


class LearningProgressDao:
    @classmethod
    async def get_or_create_progress(
        cls, db: AsyncSession, user_id: int, course_id: int, section_id: int, resource_id: int | None = None
    ) -> VfLearningProgress:
        conditions = [
            VfLearningProgress.user_id == user_id,
            VfLearningProgress.course_id == course_id,
            VfLearningProgress.section_id == section_id,
        ]
        if resource_id:
            conditions.append(VfLearningProgress.resource_id == resource_id)

        result = await db.execute(select(VfLearningProgress).where(*conditions))
        progress = result.scalars().first()
        if progress is None:
            progress = VfLearningProgress(
                user_id=user_id,
                course_id=course_id,
                section_id=section_id,
                resource_id=resource_id,
                last_position=0,
                completed='0',
                update_time=datetime.now(),
            )
            db.add(progress)
            await db.flush()
        return progress

    @classmethod
    async def update_progress(cls, db: AsyncSession, progress_id: int, data: UpdateProgressModel) -> None:
        await db.execute(
            update(VfLearningProgress)
            .where(VfLearningProgress.progress_id == progress_id)
            .values(
                last_position=data.last_position,
                completed=data.completed,
                update_time=datetime.now(),
            )
        )
        await db.flush()

    @classmethod
    async def get_course_progress(cls, db: AsyncSession, user_id: int, course_id: int) -> list[VfLearningProgress]:
        result = await db.execute(
            select(VfLearningProgress).where(
                VfLearningProgress.user_id == user_id,
                VfLearningProgress.course_id == course_id,
            )
        )
        return list(result.scalars().all())
