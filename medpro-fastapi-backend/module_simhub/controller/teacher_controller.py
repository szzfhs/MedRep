"""SimHub 教师端 Controller"""
from typing import Annotated

from fastapi import Body, Path, Query, Request, Response
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
from module_simhub.dao.course_dao import CourseDao, CourseSectionDao, LessonPrepDao
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
    CreateLessonPrepModel,
    DeleteCourseModel,
    EditCourseModel,
    EditSectionModel,
    SavePrepStepModel,
    SectionResourceSortModel,
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


# ——— 章节-资源绑定 CRUD ———

@teacher_controller.get(
    '/section/{section_id}/resources',
    summary='获取章节绑定的资源列表（含资源详情）',
    response_model=DataResponseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:teacher:query')],
)
async def get_section_resources(
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
        return ResponseUtil.fail(msg='无权访问他人课程')
    resources = await CourseSectionDao.get_section_resources_with_detail(query_db, section_id)
    return ResponseUtil.success(data=resources)


@teacher_controller.post(
    '/section/{section_id}/resources/bind',
    summary='批量绑定资源到章节',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:teacher:edit')],
)
@Log(title='教师-章节资源', business_type=BusinessType.INSERT)
async def bind_section_resources(
    request: Request,
    section_id: Annotated[int, Path(ge=1)],
    resource_ids: Annotated[list[int], Body(embed=True, alias='resourceIds')],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> Response:
    section = await CourseSectionDao.get_section_by_id(query_db, section_id)
    if not section:
        return ResponseUtil.fail(msg='章节不存在')
    course = await CourseDao.get_course_by_id(query_db, section.course_id)
    if not course or course.teacher_id != current_user.user.user_id:
        return ResponseUtil.fail(msg='无权操作他人课程')
    # 去重绑定
    existing = await CourseSectionDao.get_section_resources(query_db, section_id)
    existing_ids = {r.resource_id for r in existing}
    for rid in resource_ids:
        if rid not in existing_ids:
            await CourseSectionDao.add_section_resource(query_db, section_id, rid, len(existing_ids))
            existing_ids.add(rid)
    await CourseSectionDao.refresh_section_flags(query_db, section_id)
    await query_db.commit()
    return ResponseUtil.success(msg='绑定成功')


@teacher_controller.delete(
    '/section/{section_id}/resources/{resource_id}',
    summary='解绑章节资源',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:teacher:edit')],
)
@Log(title='教师-章节资源', business_type=BusinessType.DELETE)
async def unbind_section_resource(
    request: Request,
    section_id: Annotated[int, Path(ge=1)],
    resource_id: Annotated[int, Path(ge=1)],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> Response:
    section = await CourseSectionDao.get_section_by_id(query_db, section_id)
    if not section:
        return ResponseUtil.fail(msg='章节不存在')
    course = await CourseDao.get_course_by_id(query_db, section.course_id)
    if not course or course.teacher_id != current_user.user.user_id:
        return ResponseUtil.fail(msg='无权操作他人课程')
    await CourseSectionDao.remove_section_resource(query_db, section_id, resource_id)
    await CourseSectionDao.refresh_section_flags(query_db, section_id)
    await query_db.commit()
    return ResponseUtil.success(msg='解绑成功')


@teacher_controller.put(
    '/section/{section_id}/resources/sort',
    summary='调整章节资源排序',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:teacher:edit')],
)
@Log(title='教师-章节资源', business_type=BusinessType.UPDATE)
async def sort_section_resources(
    request: Request,
    section_id: Annotated[int, Path(ge=1)],
    data: SectionResourceSortModel,
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> Response:
    section = await CourseSectionDao.get_section_by_id(query_db, section_id)
    if not section:
        return ResponseUtil.fail(msg='章节不存在')
    course = await CourseDao.get_course_by_id(query_db, section.course_id)
    if not course or course.teacher_id != current_user.user.user_id:
        return ResponseUtil.fail(msg='无权操作他人课程')
    await CourseSectionDao.sort_section_resources(query_db, data.bind_ids)
    await query_db.commit()
    return ResponseUtil.success(msg='排序已更新')


# ——— 备课草稿 CRUD ———

@teacher_controller.get(
    '/lesson-prep',
    summary='获取我的备课草稿列表',
    response_model=DataResponseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:teacher:query')],
)
async def get_lesson_preps(
    request: Request,
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> Response:
    preps = await LessonPrepDao.get_by_teacher(query_db, current_user.user.user_id)
    from module_simhub.entity.vo.course_vo import LessonPrepModel
    data = [LessonPrepModel.model_validate(p).model_dump(by_alias=True) for p in preps]
    return ResponseUtil.success(data=data)


@teacher_controller.post(
    '/lesson-prep',
    summary='新建备课草稿',
    response_model=DataResponseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:teacher:add')],
)
@Log(title='教师-备课', business_type=BusinessType.INSERT)
async def create_lesson_prep(
    request: Request,
    data: CreateLessonPrepModel,
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> Response:
    prep = await LessonPrepDao.create(
        query_db,
        teacher_id=current_user.user.user_id,
        prep_name=data.prep_name,
        course_id=data.course_id,
    )
    prep_id = prep.prep_id  # commit 前读取，避免 commit 后 expire 触发 lazy load
    await query_db.commit()
    return ResponseUtil.success(data={'prepId': prep_id})


@teacher_controller.get(
    '/lesson-prep/{prep_id}',
    summary='获取备课草稿详情',
    response_model=DataResponseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:teacher:query')],
)
async def get_lesson_prep_detail(
    request: Request,
    prep_id: Annotated[int, Path(ge=1)],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> Response:
    prep = await LessonPrepDao.get_by_id(query_db, prep_id)
    if not prep:
        return ResponseUtil.fail(msg='备课草稿不存在')
    if prep.teacher_id != current_user.user.user_id:
        return ResponseUtil.fail(msg='无权访问他人备课')
    from module_simhub.entity.vo.course_vo import LessonPrepModel
    return ResponseUtil.success(data=LessonPrepModel.model_validate(prep).model_dump(by_alias=True))


@teacher_controller.put(
    '/lesson-prep/{prep_id}/step',
    summary='保存备课某步骤草稿',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:teacher:edit')],
)
@Log(title='教师-备课', business_type=BusinessType.UPDATE)
async def save_lesson_prep_step(
    request: Request,
    prep_id: Annotated[int, Path(ge=1)],
    data: SavePrepStepModel,
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> Response:
    prep = await LessonPrepDao.get_by_id(query_db, prep_id)
    if not prep:
        return ResponseUtil.fail(msg='备课草稿不存在')
    if prep.teacher_id != current_user.user.user_id:
        return ResponseUtil.fail(msg='无权操作他人备课')
    await LessonPrepDao.save_step(query_db, prep_id, data.step, data.data)
    await query_db.commit()
    return ResponseUtil.success(msg='保存成功')


@teacher_controller.delete(
    '/lesson-prep/{prep_id}',
    summary='删除备课草稿',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:teacher:remove')],
)
@Log(title='教师-备课', business_type=BusinessType.DELETE)
async def delete_lesson_prep(
    request: Request,
    prep_id: Annotated[int, Path(ge=1)],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> Response:
    prep = await LessonPrepDao.get_by_id(query_db, prep_id)
    if not prep:
        return ResponseUtil.fail(msg='备课草稿不存在')
    if prep.teacher_id != current_user.user.user_id:
        return ResponseUtil.fail(msg='无权操作他人备课')
    await LessonPrepDao.delete(query_db, prep_id)
    await query_db.commit()
    return ResponseUtil.success(msg='删除成功')


@teacher_controller.post(
    '/lesson-prep/{prep_id}/publish',
    summary='发布备课草稿为正式课程',
    response_model=DataResponseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:teacher:add')],
)
@Log(title='教师-备课发布', business_type=BusinessType.INSERT)
async def publish_lesson_prep(
    request: Request,
    prep_id: Annotated[int, Path(ge=1)],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> Response:
    import json as _json
    from sqlalchemy import delete as _delete
    prep = await LessonPrepDao.get_by_id(query_db, prep_id)
    if not prep:
        return ResponseUtil.fail(msg='备课草稿不存在')
    if prep.teacher_id != current_user.user.user_id:
        return ResponseUtil.fail(msg='无权操作他人备课')
    if not prep.basic_info_json:
        return ResponseUtil.fail(msg='请先完成步骤1（课程基本信息）')

    # 在任何 commit/flush 之前，将所有需要的字段读入局部变量，避免 expire 后 lazy load
    _basic_info_json = prep.basic_info_json
    _outline_json = prep.outline_json
    _resource_config_json = prep.resource_config_json
    _prep_name = prep.prep_name
    _existing_course_id: int | None = prep.course_id  # 已关联课程 ID（重复发布时不为 None）

    # 解析基本信息
    try:
        basic_info = _json.loads(_basic_info_json)
    except Exception:
        return ResponseUtil.fail(msg='基本信息格式错误，请重新填写')

    course_name = basic_info.get('courseName') or _prep_name
    if not course_name:
        return ResponseUtil.fail(msg='课程名称不能为空')

    # 组装课程字段（新建和更新共用）
    _course_fields = {
        'course_name': course_name,
        'teacher_id': current_user.user.user_id,
        'teacher_name': current_user.user.nick_name or current_user.user.user_name,
        'description': basic_info.get('description'),
        'course_category': basic_info.get('courseCategory', '1'),
        'total_hours': basic_info.get('totalHours') or 0,
        'publish_date': basic_info.get('publishDate') or None,
        'status': '0',
        'learning_outcomes': _json.dumps(basic_info.get('learningOutcomes', []), ensure_ascii=False)
            if basic_info.get('learningOutcomes') else None,
        'certificate_info': basic_info.get('certificateInfo'),
    }

    if _existing_course_id:
        # ── 重复发布：更新已有课程 ──
        await CourseDao.edit_course(query_db, current_user.user.user_name, _existing_course_id, _course_fields)
        # 删除旧章节，重建
        await query_db.execute(
            _delete(VfCourseSection).where(VfCourseSection.course_id == _existing_course_id)
        )
        await query_db.flush()
        new_course_id = _existing_course_id
    else:
        # ── 首次发布：新建课程 ──
        new_course = await CourseDao.add_course(query_db, current_user.user.user_name, _course_fields)
        new_course_id = new_course.course_id  # flush 后 id 已生成，立即读取

    # 从大纲 JSON 创建章节，同时建立 outline_uuid → section_id 的映射
    uuid_to_section_id: dict[str, int] = {}
    if _outline_json and new_course_id:
        try:
            outline = _json.loads(_outline_json)
            sort_ch = 0
            for chapter in outline:
                ch_obj = await CourseSectionDao.add_section(
                    query_db,
                    {
                        'course_id': new_course_id,
                        'title': chapter.get('title', ''),
                        'section_type': 'chapter',
                        'hours': chapter.get('hours', 0),
                        'sort_order': sort_ch,
                        'parent_id': 0,
                    }
                )
                ch_id = ch_obj.section_id
                sort_se = 0
                for section in chapter.get('children', []):
                    se_obj = await CourseSectionDao.add_section(
                        query_db,
                        {
                            'course_id': new_course_id,
                            'parent_id': ch_id,
                            'title': section.get('title', ''),
                            'section_type': 'section',
                            'hours': section.get('hours', 0),
                            'sort_order': sort_se,
                        }
                    )
                    # 记录 outline UUID → 真实 section_id 映射
                    section_uuid = section.get('id')
                    if section_uuid:
                        uuid_to_section_id[section_uuid] = se_obj.section_id
                    sort_se += 1
                sort_ch += 1
        except Exception as e:
            logger.warning(f'从大纲创建章节时出错: {e}', exc_info=True)

    # 处理 resource_config_json：将草稿中的资源绑定到真实章节
    if _resource_config_json and uuid_to_section_id:
        try:
            resource_config: dict = _json.loads(_resource_config_json)
            for section_uuid, resources in resource_config.items():
                real_section_id = uuid_to_section_id.get(section_uuid)
                if not real_section_id or not isinstance(resources, list):
                    continue
                for sort_i, res_item in enumerate(resources):
                    resource_id = res_item.get('resourceId')
                    if resource_id:
                        await CourseSectionDao.add_section_resource(
                            query_db, real_section_id, int(resource_id), sort_order=sort_i
                        )
                # 绑定完成后刷新该章节的 has_* 标志
                await CourseSectionDao.refresh_section_flags(query_db, real_section_id)
        except Exception as e:
            logger.warning(f'绑定章节资源时出错: {e}', exc_info=True)

    # 标记备课为已发布，回写 course_id（首次发布时）
    await LessonPrepDao.publish(query_db, prep_id, course_id=new_course_id)
    await query_db.commit()
    return ResponseUtil.success(data={'courseId': new_course_id}, msg='发布成功')
