"""SimHub 学生端 Controller"""
from typing import Annotated

from fastapi import Path, Query, Request, Response
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from common.aspect.db_seesion import DBSessionDependency
from common.aspect.interface_auth import UserInterfaceAuthDependency
from common.aspect.pre_auth import CurrentUserDependency, PreAuthDependency
from common.router import APIRouterPro
from common.vo import DataResponseModel, ResponseBaseModel
from module_admin.entity.vo.user_vo import CurrentUserModel
from module_simhub.dao.course_dao import (
    CourseSectionDao,
    EnrollmentDao,
    LearningProgressDao,
)
from module_simhub.entity.do.simhub_do import (
    VfCourse,
    VfCourseEnrollment,
    VfCourseSection,
    VfExperiment,
    VfExperimentParticipation,
    VfLearningProgress,
)
from module_simhub.entity.vo.course_vo import UpdateProgressModel
from module_simhub.service.course_service import CourseService, _build_section_tree
from utils.response_util import ResponseUtil

student_controller = APIRouterPro(
    prefix='/simhub/student',
    order_num=29,
    tags=['SimHub-学生端'],
    dependencies=[PreAuthDependency()],
)


# ——— 学习中心 Dashboard ———

@student_controller.get(
    '/dashboard',
    summary='学生学习中心数据汇总',
    response_model=DataResponseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:course:enroll')],
)
async def get_student_dashboard(
    request: Request,
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> Response:
    user_id = current_user.user.user_id

    # 参与实验数
    exp_count_res = await query_db.execute(
        select(func.count(VfExperimentParticipation.participation_id)).where(
            VfExperimentParticipation.user_id == user_id
        )
    )
    exp_count = exp_count_res.scalar() or 0

    # 选课数 & 完成课程数
    enroll_count_res = await query_db.execute(
        select(func.count(VfCourseEnrollment.enrollment_id)).where(
            VfCourseEnrollment.user_id == user_id
        )
    )
    enroll_count = enroll_count_res.scalar() or 0

    completed_count_res = await query_db.execute(
        select(func.count(VfCourseEnrollment.enrollment_id)).where(
            VfCourseEnrollment.user_id == user_id,
            VfCourseEnrollment.status == '1',
        )
    )
    completed_count = completed_count_res.scalar() or 0

    # 已完成章节数（学习记录）
    section_done_res = await query_db.execute(
        select(func.count(VfLearningProgress.progress_id)).where(
            VfLearningProgress.user_id == user_id,
            VfLearningProgress.completed == '1',
        )
    )
    section_done = section_done_res.scalar() or 0

    # 最近 5 门选课（含进度）
    enrollments_res = await query_db.execute(
        select(VfCourseEnrollment)
        .where(VfCourseEnrollment.user_id == user_id)
        .order_by(desc(VfCourseEnrollment.enroll_time))
        .limit(5)
    )
    enrollments = enrollments_res.scalars().all()

    recent_courses = []
    for enroll in enrollments:
        course_res = await query_db.execute(
            select(VfCourse).where(
                VfCourse.course_id == enroll.course_id, VfCourse.del_flag == '0'
            )
        )
        course = course_res.scalar_one_or_none()
        if not course:
            continue
        # 进度百分比
        total = course.total_sections or 0
        done = 0
        if total > 0:
            done_res = await query_db.execute(
                select(func.count(VfLearningProgress.progress_id)).where(
                    VfLearningProgress.user_id == user_id,
                    VfLearningProgress.course_id == enroll.course_id,
                    VfLearningProgress.completed == '1',
                )
            )
            done = done_res.scalar() or 0
        progress_pct = int(done * 100 / total) if total > 0 else 0
        recent_courses.append({
            'courseId': course.course_id,
            'courseName': course.course_name,
            'coverImage': course.cover_image,
            'totalSections': total,
            'doneSections': done,
            'progress': progress_pct,
            'enrollStatus': enroll.status,
        })

    # 最近 5 条实验参与记录
    recent_exps_res = await query_db.execute(
        select(VfExperimentParticipation)
        .where(VfExperimentParticipation.user_id == user_id)
        .order_by(desc(VfExperimentParticipation.start_time))
        .limit(5)
    )
    recent_participations = recent_exps_res.scalars().all()

    recent_experiments = []
    for p in recent_participations:
        exp_res = await query_db.execute(
            select(VfExperiment).where(
                VfExperiment.exp_id == p.exp_id, VfExperiment.del_flag == '0'
            )
        )
        exp = exp_res.scalar_one_or_none()
        recent_experiments.append({
            'participationId': p.participation_id,
            'expId': p.exp_id,
            'expName': exp.exp_name if exp else '(已删除)',
            'startTime': p.start_time.isoformat() if p.start_time else None,
            'status': p.status,
        })

    data = {
        'expCount': exp_count,
        'enrollCount': enroll_count,
        'completedCount': completed_count,
        'sectionDone': section_done,
        'recentCourses': recent_courses,
        'recentExperiments': recent_experiments,
    }
    return ResponseUtil.success(data=data)


# ——— 我参与的实验历史 ———

@student_controller.get(
    '/experiments',
    summary='我参与的实验历史',
    response_model=DataResponseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:course:enroll')],
)
async def get_my_experiments(
    request: Request,
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
    page_num: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> Response:
    user_id = current_user.user.user_id
    offset = (page_num - 1) * page_size

    total_res = await query_db.execute(
        select(func.count(VfExperimentParticipation.participation_id)).where(
            VfExperimentParticipation.user_id == user_id
        )
    )
    total = total_res.scalar() or 0

    participations_res = await query_db.execute(
        select(VfExperimentParticipation)
        .where(VfExperimentParticipation.user_id == user_id)
        .order_by(desc(VfExperimentParticipation.start_time))
        .offset(offset)
        .limit(page_size)
    )
    participations = participations_res.scalars().all()

    rows = []
    for p in participations:
        exp_res = await query_db.execute(
            select(VfExperiment).where(VfExperiment.exp_id == p.exp_id)
        )
        exp = exp_res.scalar_one_or_none()
        rows.append({
            'participationId': p.participation_id,
            'expId': p.exp_id,
            'expName': exp.exp_name if exp else '(已删除)',
            'coverImage': exp.cover_image if exp else '',
            'launchUrl': exp.launch_url if exp else '',
            'expType': exp.exp_type if exp else '',
            'startTime': p.start_time.isoformat() if p.start_time else None,
            'endTime': p.end_time.isoformat() if p.end_time else None,
            'durationSeconds': p.duration_seconds or 0,
            'status': p.status,
        })

    return ResponseUtil.success(data={'total': total, 'rows': rows})


# ——— 我的课程（含进度）———

@student_controller.get(
    '/courses',
    summary='我的课程列表（含进度）',
    response_model=DataResponseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:course:enroll')],
)
async def get_my_courses_with_progress(
    request: Request,
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> Response:
    user_id = current_user.user.user_id

    enrollments_res = await query_db.execute(
        select(VfCourseEnrollment)
        .where(VfCourseEnrollment.user_id == user_id)
        .order_by(desc(VfCourseEnrollment.enroll_time))
    )
    enrollments = enrollments_res.scalars().all()

    courses = []
    for enroll in enrollments:
        course_res = await query_db.execute(
            select(VfCourse).where(
                VfCourse.course_id == enroll.course_id, VfCourse.del_flag == '0'
            )
        )
        course = course_res.scalar_one_or_none()
        if not course:
            continue
        total = course.total_sections or 0
        done = 0
        if total > 0:
            done_res = await query_db.execute(
                select(func.count(VfLearningProgress.progress_id)).where(
                    VfLearningProgress.user_id == user_id,
                    VfLearningProgress.course_id == enroll.course_id,
                    VfLearningProgress.completed == '1',
                )
            )
            done = done_res.scalar() or 0
        progress_pct = int(done * 100 / total) if total > 0 else 0
        courses.append({
            'courseId': course.course_id,
            'courseName': course.course_name,
            'coverImage': course.cover_image,
            'description': course.description,
            'category': course.category,
            'totalSections': total,
            'doneSections': done,
            'progress': progress_pct,
            'enrollStatus': enroll.status,
            'enrollTime': enroll.enroll_time.isoformat() if enroll.enroll_time else None,
        })

    return ResponseUtil.success(data=courses)


# ——— 单门课程学习详情（章节树 + 进度）———

@student_controller.get(
    '/course/{course_id}/progress',
    summary='课程学习详情（章节树 + 各章节进度）',
    response_model=DataResponseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:course:enroll')],
)
async def get_course_learn_detail(
    request: Request,
    course_id: Annotated[int, Path(ge=1)],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> Response:
    user_id = current_user.user.user_id

    course_res = await query_db.execute(
        select(VfCourse).where(VfCourse.course_id == course_id, VfCourse.del_flag == '0')
    )
    course = course_res.scalar_one_or_none()
    if not course:
        return ResponseUtil.fail(msg='课程不存在')

    sections = await CourseSectionDao.get_sections_by_course(query_db, course_id)

    # 获取该课程所有已完成章节 ID
    progress_res = await query_db.execute(
        select(VfLearningProgress.section_id).where(
            VfLearningProgress.user_id == user_id,
            VfLearningProgress.course_id == course_id,
            VfLearningProgress.completed == '1',
        )
    )
    completed_section_ids = {r[0] for r in progress_res.all()}

    def build_tree_with_progress(secs: list[VfCourseSection], parent_id: int = 0) -> list[dict]:
        result = []
        for s in secs:
            if (s.parent_id or 0) == parent_id:
                node = {
                    'sectionId': s.section_id,
                    'courseId': s.course_id,
                    'parentId': s.parent_id,
                    'title': s.title,
                    'sortOrder': s.sort_order,
                    'sectionType': s.section_type,
                    'description': s.description,
                    'completed': s.section_id in completed_section_ids,
                    'children': build_tree_with_progress(secs, s.section_id),
                }
                result.append(node)
        return result

    section_tree = build_tree_with_progress(sections)

    total = course.total_sections or 0
    done = len(completed_section_ids)
    progress_pct = int(done * 100 / total) if total > 0 else 0

    data = {
        'course': {
            'courseId': course.course_id,
            'courseName': course.course_name,
            'coverImage': course.cover_image,
            'description': course.description,
            'totalSections': total,
        },
        'sections': section_tree,
        'doneSections': done,
        'progress': progress_pct,
    }
    return ResponseUtil.success(data=data)


# ——— 标记章节完成 ———

@student_controller.put(
    '/section/{section_id}/complete',
    summary='标记章节为已完成',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:course:enroll')],
)
async def complete_section(
    request: Request,
    section_id: Annotated[int, Path(ge=1)],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> Response:
    user_id = current_user.user.user_id

    section_res = await query_db.execute(
        select(VfCourseSection).where(VfCourseSection.section_id == section_id)
    )
    section = section_res.scalar_one_or_none()
    if not section:
        return ResponseUtil.fail(msg='章节不存在')

    progress = await LearningProgressDao.get_or_create_progress(
        query_db, user_id, section.course_id, section_id, None
    )
    await LearningProgressDao.update_progress(
        query_db,
        progress.progress_id,
        UpdateProgressModel(
            course_id=section.course_id,
            section_id=section_id,
            completed='1',
        ),
    )
    await query_db.commit()
    return ResponseUtil.success(msg='章节已完成')
