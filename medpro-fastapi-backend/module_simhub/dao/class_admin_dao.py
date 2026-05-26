"""SimHub 行政班级管理 DAO"""
import math
from datetime import datetime

from sqlalchemy import desc, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from common.vo import PageModel
from module_admin.entity.do.user_do import SysUser
from module_simhub.entity.do.simhub_do import VfClassAdmin, VfClassStudent, VfTermConfig
from module_simhub.entity.vo.class_admin_vo import (
    ClassAdminPageQueryModel,
    ClassStudentPageQueryModel,
    TermConfigPageQueryModel,
)


class TermConfigDao:
    """学年学期配置 DAO"""

    @classmethod
    async def get_term_list(cls, db: AsyncSession, query: TermConfigPageQueryModel) -> PageModel:
        """分页查询学年学期"""
        stmt = select(VfTermConfig).where(VfTermConfig.del_flag == '0')

        if query.term_name:
            stmt = stmt.where(VfTermConfig.term_name.like(f'%{query.term_name}%'))
        if query.school_year:
            stmt = stmt.where(VfTermConfig.school_year == query.school_year)
        if query.is_current is not None:
            stmt = stmt.where(VfTermConfig.is_current == query.is_current)
        if query.status is not None:
            stmt = stmt.where(VfTermConfig.status == query.status)

        # 计算总数
        count_stmt = select(func.count()).select_from(stmt.alias())
        total = (await db.execute(count_stmt)).scalar()

        # 分页查询
        stmt = stmt.order_by(desc(VfTermConfig.sort_order), desc(VfTermConfig.term_id))
        stmt = stmt.offset((query.page_num - 1) * query.page_size).limit(query.page_size)
        result = await db.execute(stmt)
        rows = result.scalars().all()

        has_next = query.page_num * query.page_size < total
        return PageModel(rows=rows, total=total, pageNum=query.page_num, pageSize=query.page_size, hasNext=has_next)

    @classmethod
    async def get_term_by_id(cls, db: AsyncSession, term_id: int) -> VfTermConfig | None:
        """根据ID查询学年学期"""
        stmt = select(VfTermConfig).where(VfTermConfig.term_id == term_id, VfTermConfig.del_flag == '0')
        result = await db.execute(stmt)
        return result.scalars().first()

    @classmethod
    async def add_term(cls, db: AsyncSession, create_by: str, data: dict) -> VfTermConfig:
        """新增学年学期"""
        term = VfTermConfig(**data, create_by=create_by, create_time=datetime.now())
        db.add(term)
        await db.flush()
        return term

    @classmethod
    async def edit_term(cls, db: AsyncSession, update_by: str, term_id: int, data: dict):
        """编辑学年学期"""
        data['update_by'] = update_by
        data['update_time'] = datetime.now()
        stmt = update(VfTermConfig).where(VfTermConfig.term_id == term_id).values(**data)
        await db.execute(stmt)

    @classmethod
    async def delete_terms(cls, db: AsyncSession, term_ids: list[int]):
        """软删除学年学期"""
        stmt = update(VfTermConfig).where(VfTermConfig.term_id.in_(term_ids)).values(del_flag='2')
        await db.execute(stmt)

    @classmethod
    async def get_all_active(cls, db: AsyncSession) -> list[VfTermConfig]:
        """获取所有启用的学年学期（用于下拉选项）"""
        stmt = (
            select(VfTermConfig)
            .where(VfTermConfig.status == '0', VfTermConfig.del_flag == '0')
            .order_by(desc(VfTermConfig.sort_order), desc(VfTermConfig.term_id))
        )
        result = await db.execute(stmt)
        return result.scalars().all()

    @classmethod
    async def set_current_term(cls, db: AsyncSession, term_id: int):
        """设置当前学期（先清除所有，再设置指定的）"""
        # 清除所有当前标记
        await db.execute(update(VfTermConfig).values(is_current='0'))
        # 设置指定学期为当前
        await db.execute(update(VfTermConfig).where(VfTermConfig.term_id == term_id).values(is_current='1'))


class ClassAdminDao:
    """行政班级 DAO"""

    @classmethod
    async def get_class_list(cls, db: AsyncSession, query: ClassAdminPageQueryModel) -> PageModel:
        """分页查询行政班级"""
        stmt = select(VfClassAdmin).where(VfClassAdmin.del_flag == '0')

        if query.class_name:
            stmt = stmt.where(VfClassAdmin.class_name.like(f'%{query.class_name}%'))
        if query.class_code:
            stmt = stmt.where(VfClassAdmin.class_code.like(f'%{query.class_code}%'))
        if query.dept_id is not None:
            stmt = stmt.where(VfClassAdmin.dept_id == query.dept_id)
        if query.term_id is not None:
            stmt = stmt.where(VfClassAdmin.term_id == query.term_id)
        if query.grade:
            stmt = stmt.where(VfClassAdmin.grade == query.grade)
        if query.status is not None:
            stmt = stmt.where(VfClassAdmin.status == query.status)

        # 计算总数
        count_stmt = select(func.count()).select_from(stmt.alias())
        total = (await db.execute(count_stmt)).scalar()

        # 分页查询
        stmt = stmt.order_by(desc(VfClassAdmin.sort_order), desc(VfClassAdmin.class_id))
        stmt = stmt.offset((query.page_num - 1) * query.page_size).limit(query.page_size)
        result = await db.execute(stmt)
        rows = result.scalars().all()

        has_next = query.page_num * query.page_size < total
        return PageModel(rows=rows, total=total, pageNum=query.page_num, pageSize=query.page_size, hasNext=has_next)

    @classmethod
    async def get_class_by_id(cls, db: AsyncSession, class_id: int) -> VfClassAdmin | None:
        """根据ID查询行政班级"""
        stmt = select(VfClassAdmin).where(VfClassAdmin.class_id == class_id, VfClassAdmin.del_flag == '0')
        result = await db.execute(stmt)
        return result.scalars().first()

    @classmethod
    async def add_class(cls, db: AsyncSession, create_by: str, data: dict) -> VfClassAdmin:
        """新增行政班级"""
        class_admin = VfClassAdmin(**data, create_by=create_by, create_time=datetime.now())
        db.add(class_admin)
        await db.flush()
        return class_admin

    @classmethod
    async def edit_class(cls, db: AsyncSession, update_by: str, class_id: int, data: dict):
        """编辑行政班级"""
        data['update_by'] = update_by
        data['update_time'] = datetime.now()
        stmt = update(VfClassAdmin).where(VfClassAdmin.class_id == class_id).values(**data)
        await db.execute(stmt)

    @classmethod
    async def delete_classes(cls, db: AsyncSession, class_ids: list[int]):
        """软删除行政班级"""
        stmt = update(VfClassAdmin).where(VfClassAdmin.class_id.in_(class_ids)).values(del_flag='2')
        await db.execute(stmt)

    @classmethod
    async def update_student_count(cls, db: AsyncSession, class_id: int):
        """更新班级学生人数"""
        # 统计班级学生数
        count_stmt = select(func.count()).select_from(VfClassStudent).where(VfClassStudent.class_id == class_id)
        count = (await db.execute(count_stmt)).scalar()
        # 更新班级表
        await db.execute(update(VfClassAdmin).where(VfClassAdmin.class_id == class_id).values(student_count=count))

    @classmethod
    async def get_all_active(cls, db: AsyncSession) -> list[VfClassAdmin]:
        """获取所有启用的行政班级（用于下拉选项）"""
        stmt = (
            select(VfClassAdmin)
            .where(VfClassAdmin.status == '0', VfClassAdmin.del_flag == '0')
            .order_by(desc(VfClassAdmin.sort_order), desc(VfClassAdmin.class_id))
        )
        result = await db.execute(stmt)
        return result.scalars().all()


class ClassStudentDao:
    """班级学生 DAO"""

    @classmethod
    async def get_student_list(cls, db: AsyncSession, query: ClassStudentPageQueryModel) -> PageModel:
        """分页查询班级学生"""
        stmt = select(VfClassStudent).where(VfClassStudent.class_id == query.class_id)

        if query.student_name:
            stmt = stmt.where(VfClassStudent.student_name.like(f'%{query.student_name}%'))
        if query.student_no:
            stmt = stmt.where(VfClassStudent.student_no.like(f'%{query.student_no}%'))
        if query.status is not None:
            stmt = stmt.where(VfClassStudent.status == query.status)

        # 计算总数
        count_stmt = select(func.count()).select_from(stmt.alias())
        total = (await db.execute(count_stmt)).scalar()

        # 分页查询
        stmt = stmt.order_by(desc(VfClassStudent.sort_order), VfClassStudent.student_no)
        stmt = stmt.offset((query.page_num - 1) * query.page_size).limit(query.page_size)
        result = await db.execute(stmt)
        rows = result.scalars().all()

        has_next = query.page_num * query.page_size < total
        return PageModel(rows=rows, total=total, pageNum=query.page_num, pageSize=query.page_size, hasNext=has_next)

    @classmethod
    async def get_student_by_id(cls, db: AsyncSession, id: int) -> VfClassStudent | None:
        """根据ID查询班级学生"""
        stmt = select(VfClassStudent).where(VfClassStudent.id == id)
        result = await db.execute(stmt)
        return result.scalars().first()

    @classmethod
    async def check_exists(cls, db: AsyncSession, class_id: int, user_id: int) -> bool:
        """检查学生是否已在班级中"""
        stmt = select(func.count()).select_from(VfClassStudent).where(VfClassStudent.class_id == class_id, VfClassStudent.user_id == user_id)
        count = (await db.execute(stmt)).scalar()
        return count > 0

    @classmethod
    async def add_student(cls, db: AsyncSession, create_by: str, data: dict) -> VfClassStudent:
        """添加班级学生"""
        student = VfClassStudent(**data, create_by=create_by, create_time=datetime.now())
        db.add(student)
        await db.flush()
        return student

    @classmethod
    async def batch_add_students(cls, db: AsyncSession, create_by: str, class_id: int, user_ids: list[int]):
        """批量添加班级学生"""
        # 获取用户信息
        stmt = select(SysUser).where(SysUser.user_id.in_(user_ids), SysUser.del_flag == '0')
        result = await db.execute(stmt)
        users = result.scalars().all()

        for user in users:
            # 检查是否已存在
            exists = await cls.check_exists(db, class_id, user.user_id)
            if not exists:
                student = VfClassStudent(
                    class_id=class_id,
                    user_id=user.user_id,
                    student_no=user.user_name,  # 假设 user_name 是学号
                    student_name=user.nick_name,
                    join_date=datetime.now(),
                    status='0',
                    create_by=create_by,
                    create_time=datetime.now(),
                )
                db.add(student)
        await db.flush()

    @classmethod
    async def delete_students(cls, db: AsyncSession, ids: list[int]):
        """删除班级学生"""
        stmt = select(VfClassStudent).where(VfClassStudent.id.in_(ids))
        result = await db.execute(stmt)
        students = result.scalars().all()
        for student in students:
            await db.delete(student)
