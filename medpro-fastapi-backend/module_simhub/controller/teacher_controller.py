"""SimHub 教师端 Controller"""
from typing import Annotated

from fastapi import Path, Query, Request, Response
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from common.annotation.log_annotation import Log
from common.aspect.db_seesion import DBSessionDependency
from common.aspect.interface_auth import UserInterfaceAuthDependency
from common.aspect.pre_auth import CurrentUserDependency, PreAuthDependency
from common.enums import BusinessType
from common.router import APIRouterPro
from common.vo import DataResponseModel, PageResponseModel, ResponseBaseModel
from module_admin.entity.do.user_do import SysUser
from module_admin.entity.vo.user_vo import CurrentUserModel
from module_simhub.dao.course_dao import CourseDao, CourseSectionDao
from module_simhub.entity.do.simhub_do import (
    VfCourse,
    VfCourseEnrollment,
    VfCourseSection,
    VfExperimentParticipation,
)
from module_simhub.entity.vo.course_vo import (
    AddCourseModel,
    AddSectionModel,
    CoursePageQueryModel,
    DeleteCourseModel,
    EditCourseModel,
    EditSectionModel,
)
from module_simhub.service.course_service import CourseService
from utils.log_util import logger
from utils.response_util import ResponseUtil

teacher_controller = APIRouterPro(
    prefix='/simhub/teacher',
    order_num=28,
    tags=['SimHub-教师端'],
    dependencies=[PreAuthDependency()],
)


# ——— 工作台 ———

@teacher_controller.get(
    '/dashboard',
    summary='教师工作台数据汇总',
    response_model=DataResponseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:teacher:query')],
)
async def get_teacher_dashboard(
    request: Request,
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> Response:
    user_id = current_user.user.user_id
    # 我的课程数
    course_count_res = await query_db.execute(
        select(func.count(VfCourse.course_id)).where(
            VfCourse.teacher_id == user_id, VfCourse.del_flag == '0'
        )
    )
    course_count = course_count_res.scalar() or 0

    # 课程ID列表
    my_course_ids_res = await query_db.execute(
        select(VfCourse.course_id).where(
            VfCourse.teacher_id == user_id, VfCourse.del_flag == '0'
        )
    )
    my_course_ids = [r[0] for r in my_course_ids_res.all()]

    # 选课总学生数
    student_count = 0
    exp_count = 0
    if my_course_ids:
        student_count_res = await query_db.execute(
            select(func.count(VfCourseEnrollment.enrollment_id)).where(
                VfCourseEnrollment.course_id.in_(my_course_ids)
            )
        )
        student_count = student_count_res.scalar() or 0

        # 实验参与次数（来自选课学生的实验参与）
        exp_count_res = await query_db.execute(
            select(func.count(VfExperimentParticipation.participation_id))
        )
        exp_count = exp_count_res.scalar() or 0

    # 最近 5 门课程
    recent_courses_res = await query_db.execute(
        select(VfCourse)
        .where(VfCourse.teacher_id == user_id, VfCourse.del_flag == '0')
        .order_by(desc(VfCourse.create_time))
        .limit(5)
    )
    recent_courses = recent_courses_res.scalars().all()

    data = {
        'courseCount': course_count,
        'studentCount': student_count,
        'expCount': exp_count,
        'recentCourses': [
            {
                'courseId': c.course_id,
                'courseName': c.course_name,
                'status': c.status,
                'enrollCount': c.enroll_count,
                'createTime': c.create_time.isoformat() if c.create_time else None,
            }
            for c in recent_courses
        ],
    }
    return ResponseUtil.success(data=data)


# ——— 我的课程 CRUD ———

@teacher_controller.get(
    '/courses',
    summary='获取教师自己的课程列表',
    response_model=PageResponseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:teacher:query')],
)
async def get_my_courses(
    request: Request,
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
    page_num: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    course_name: str | None = Query(default=None),
    status: str | None = Query(default=None),
) -> Response:
    user_id = current_user.user.user_id
    query = CoursePageQueryModel(
        page_num=page_num,
        page_size=page_size,
        course_name=course_name,
        teacher_id=user_id,
        status=status,
    )
    result = await CourseService.get_course_list(query_db, query)
    return ResponseUtil.success(model_content=result)


@teacher_controller.post(
    '/course',
    summary='教师新建课程',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:teacher:add')],
)
@Log(title='教师-课程', business_type=BusinessType.INSERT)
async def create_my_course(
    request: Request,
    data: AddCourseModel,
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> Response:
    # 强制将 teacher_id 设为当前用户
    data.teacher_id = current_user.user.user_id
    result = await CourseService.add_course(query_db, current_user.user.user_name, data)
    logger.info(result.message)
    return ResponseUtil.success(msg=result.message)


@teacher_controller.put(
    '/course/{course_id}',
    summary='教师编辑课程',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:teacher:edit')],
)
@Log(title='教师-课程', business_type=BusinessType.UPDATE)
async def update_my_course(
    request: Request,
    course_id: Annotated[int, Path(ge=1)],
    data: EditCourseModel,
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> Response:
    course = await CourseDao.get_course_by_id(query_db, course_id)
    if not course:
        return ResponseUtil.fail(msg='课程不存在')
    if course.teacher_id != current_user.user.user_id:
        return ResponseUtil.fail(msg='无权操作他人课程')
    data.course_id = course_id
    data.teacher_id = current_user.user.user_id
    result = await CourseService.edit_course(query_db, current_user.user.user_name, data)
    logger.info(result.message)
    return ResponseUtil.success(msg=result.message)


@teacher_controller.delete(
    '/course/{course_id}',
    summary='教师删除课程',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:teacher:remove')],
)
@Log(title='教师-课程', business_type=BusinessType.DELETE)
async def delete_my_course(
    request: Request,
    course_id: Annotated[int, Path(ge=1)],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> Response:
    course = await CourseDao.get_course_by_id(query_db, course_id)
    if not course:
        return ResponseUtil.fail(msg='课程不存在')
    if course.teacher_id != current_user.user.user_id:
        return ResponseUtil.fail(msg='无权操作他人课程')
    result = await CourseService.delete_course(query_db, DeleteCourseModel(course_ids=str(course_id)))
    logger.info(result.message)
    return ResponseUtil.success(msg=result.message)


# ——— 章节管理 ———

@teacher_controller.get(
    '/course/{course_id}/sections',
    summary='获取课程章节树',
    response_model=DataResponseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:teacher:query')],
)
async def get_course_sections(
    request: Request,
    course_id: Annotated[int, Path(ge=1)],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> Response:
    course = await CourseDao.get_course_by_id(query_db, course_id)
    if not course:
        return ResponseUtil.fail(msg='课程不存在')
    if course.teacher_id != current_user.user.user_id:
        return ResponseUtil.fail(msg='无权访问他人课程')
    sections = await CourseService.get_sections(query_db, course_id)
    return ResponseUtil.success(data=sections)


@teacher_controller.post(
    '/section',
    summary='新增章节',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:teacher:edit')],
)
@Log(title='教师-章节', business_type=BusinessType.INSERT)
async def add_section(
    request: Request,
    data: AddSectionModel,
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> Response:
    course = await CourseDao.get_course_by_id(query_db, data.course_id)
    if not course:
        return ResponseUtil.fail(msg='课程不存在')
    if course.teacher_id != current_user.user.user_id:
        return ResponseUtil.fail(msg='无权操作他人课程')
    result = await CourseService.add_section(query_db, data)
    logger.info(result.message)
    return ResponseUtil.success(msg=result.message)


@teacher_controller.put(
    '/section/{section_id}',
    summary='编辑章节',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:teacher:edit')],
)
@Log(title='教师-章节', business_type=BusinessType.UPDATE)
async def edit_section(
    request: Request,
    section_id: Annotated[int, Path(ge=1)],
    data: EditSectionModel,
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> Response:
    section = await CourseSectionDao.get_section_by_id(query_db, section_id)
    if not section:
        return ResponseUtil.fail(msg='章节不存在')
    course = await CourseDao.get_course_by_id(query_db, section.course_id)
    if not course or course.teacher_id != current_user.user.user_id:
        return ResponseUtil.fail(msg='无权操作他人课程')
    data.section_id = section_id
    result = await CourseService.edit_section(query_db, data)
    logger.info(result.message)
    return ResponseUtil.success(msg=result.message)


@teacher_controller.delete(
    '/section/{section_id}',
    summary='删除章节',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:teacher:edit')],
)
@Log(title='教师-章节', business_type=BusinessType.DELETE)
async def delete_section(
    request: Request,
    section_id: Annotated[int, Path(ge=1)],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> Response:
    section = await CourseSectionDao.get_section_by_id(query_db, section_id)
    if not section:
        return ResponseUtil.fail(msg='章节不存在')
    course = await CourseDao.get_course_by_id(query_db, section.course_id)
    if not course or course.teacher_id != current_user.user.user_id:
        return ResponseUtil.fail(msg='无权操作他人课程')
    result = await CourseService.delete_section(query_db, section_id)
    logger.info(result.message)
    return ResponseUtil.success(msg=result.message)


# ——— 选课学生 ———

@teacher_controller.get(
    '/course/{course_id}/students',
    summary='查看课程选课学生列表',
    response_model=DataResponseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:teacher:query')],
)
async def get_course_students(
    request: Request,
    course_id: Annotated[int, Path(ge=1)],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> Response:
    course = await CourseDao.get_course_by_id(query_db, course_id)
    if not course:
        return ResponseUtil.fail(msg='课程不存在')
    if course.teacher_id != current_user.user.user_id:
        return ResponseUtil.fail(msg='无权访问他人课程')

    # 联查 sys_user 获取学生信息
    result = await query_db.execute(
        select(
            VfCourseEnrollment.enrollment_id,
            VfCourseEnrollment.user_id,
            VfCourseEnrollment.enroll_time,
            VfCourseEnrollment.status,
            SysUser.user_name,
            SysUser.nick_name,
        )
        .join(SysUser, SysUser.user_id == VfCourseEnrollment.user_id, isouter=True)
        .where(VfCourseEnrollment.course_id == course_id)
        .order_by(desc(VfCourseEnrollment.enroll_time))
    )
    rows = result.all()
    students = [
        {
            'enrollmentId': r.enrollment_id,
            'userId': r.user_id,
            'userName': r.user_name,
            'nickName': r.nick_name,
            'enrollTime': r.enroll_time.isoformat() if r.enroll_time else None,
            'status': r.status,
        }
        for r in rows
    ]
    return ResponseUtil.success(data={'total': len(students), 'list': students})


# ——— 统计数据 ———

@teacher_controller.get(
    '/stats',
    summary='教师教学统计数据',
    response_model=DataResponseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:teacher:query')],
)
async def get_teacher_stats(
    request: Request,
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> Response:
    user_id = current_user.user.user_id

    my_course_ids_res = await query_db.execute(
        select(VfCourse.course_id).where(
            VfCourse.teacher_id == user_id, VfCourse.del_flag == '0'
        )
    )
    my_course_ids = [r[0] for r in my_course_ids_res.all()]

    published = draft = total_students = 0
    if my_course_ids:
        # 已发布课程
        published_res = await query_db.execute(
            select(func.count(VfCourse.course_id)).where(
                VfCourse.course_id.in_(my_course_ids), VfCourse.status == '0'
            )
        )
        published = published_res.scalar() or 0
        draft = len(my_course_ids) - published

        # 总学生数
        total_students_res = await query_db.execute(
            select(func.count(VfCourseEnrollment.enrollment_id)).where(
                VfCourseEnrollment.course_id.in_(my_course_ids)
            )
        )
        total_students = total_students_res.scalar() or 0

    # 课程章节总数
    sections_res = await query_db.execute(
        select(func.count(VfCourseSection.section_id)).where(
            VfCourseSection.course_id.in_(my_course_ids)
        ) if my_course_ids else select(func.count(VfCourseSection.section_id)).where(
            VfCourseSection.section_id == -1
        )
    )
    total_sections = sections_res.scalar() or 0

    data = {
        'totalCourses': len(my_course_ids),
        'publishedCourses': published,
        'draftCourses': draft,
        'totalStudents': total_students,
        'totalSections': total_sections,
    }
    return ResponseUtil.success(data=data)
