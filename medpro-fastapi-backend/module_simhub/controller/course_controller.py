"""SimHub 课程管理 Controller"""
from typing import Annotated

from fastapi import Path, Query, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession

from common.annotation.log_annotation import Log
from common.aspect.db_seesion import DBSessionDependency
from common.aspect.interface_auth import UserInterfaceAuthDependency
from common.aspect.pre_auth import CurrentUserDependency, PreAuthDependency
from common.enums import BusinessType
from common.router import APIRouterPro
from common.vo import DataResponseModel, PageResponseModel, ResponseBaseModel
from module_admin.entity.vo.user_vo import CurrentUserModel
from module_simhub.entity.vo.course_vo import (
    AddCourseModel,
    AddSectionModel,
    CoursePageQueryModel,
    DeleteCourseModel,
    EditCourseModel,
    EditSectionModel,
    UpdateProgressModel,
)
from module_simhub.service.course_service import CourseService
from utils.log_util import logger
from utils.response_util import ResponseUtil

course_controller = APIRouterPro(
    prefix='/simhub/course',
    order_num=25,
    tags=['SimHub-课程管理'],
    dependencies=[PreAuthDependency()],
)


# ——— 课程 CRUD ———

@course_controller.get(
    '/list',
    summary='获取课程分页列表',
    response_model=PageResponseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:course:list')],
)
async def get_course_list(
    request: Request,
    query: Annotated[CoursePageQueryModel, Query()],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
) -> Response:
    result = await CourseService.get_course_list(query_db, query)
    return ResponseUtil.success(model_content=result)


@course_controller.get(
    '/{course_id}',
    summary='获取课程详情（含章节）',
    response_model=DataResponseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:course:query')],
)
async def get_course_detail(
    request: Request,
    course_id: Annotated[int, Path(ge=1)],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
) -> Response:
    course = await CourseService.get_course_detail(query_db, course_id)
    sections = await CourseService.get_sections(query_db, course_id)
    return ResponseUtil.success(data={'course': course, 'sections': sections})


@course_controller.post(
    '',
    summary='新增课程',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:course:add')],
)
@Log(title='课程', business_type=BusinessType.INSERT)
async def add_course(
    request: Request,
    data: AddCourseModel,
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> Response:
    result = await CourseService.add_course(query_db, current_user.user.user_name, data)
    logger.info(result.message)
    return ResponseUtil.success(msg=result.message)


@course_controller.put(
    '',
    summary='编辑课程',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:course:edit')],
)
@Log(title='课程', business_type=BusinessType.UPDATE)
async def edit_course(
    request: Request,
    data: EditCourseModel,
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> Response:
    result = await CourseService.edit_course(query_db, current_user.user.user_name, data)
    logger.info(result.message)
    return ResponseUtil.success(msg=result.message)


@course_controller.delete(
    '/{course_ids}',
    summary='删除课程',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:course:remove')],
)
@Log(title='课程', business_type=BusinessType.DELETE)
async def delete_course(
    request: Request,
    course_ids: Annotated[str, Path()],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> Response:
    result = await CourseService.delete_course(query_db, DeleteCourseModel(course_ids=course_ids))
    logger.info(result.message)
    return ResponseUtil.success(msg=result.message)


# ——— 章节管理 ———

@course_controller.post(
    '/section',
    summary='新增章节',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:course:edit')],
)
@Log(title='课程章节', business_type=BusinessType.INSERT)
async def add_section(
    request: Request,
    data: AddSectionModel,
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> Response:
    result = await CourseService.add_section(query_db, data)
    logger.info(result.message)
    return ResponseUtil.success(msg=result.message)


@course_controller.put(
    '/section',
    summary='编辑章节',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:course:edit')],
)
@Log(title='课程章节', business_type=BusinessType.UPDATE)
async def edit_section(
    request: Request,
    data: EditSectionModel,
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> Response:
    result = await CourseService.edit_section(query_db, data)
    logger.info(result.message)
    return ResponseUtil.success(msg=result.message)


@course_controller.delete(
    '/section/{section_id}',
    summary='删除章节',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:course:edit')],
)
@Log(title='课程章节', business_type=BusinessType.DELETE)
async def delete_section(
    request: Request,
    section_id: Annotated[int, Path(ge=1)],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> Response:
    result = await CourseService.delete_section(query_db, section_id)
    logger.info(result.message)
    return ResponseUtil.success(msg=result.message)


# ——— 选课 & 学习进度 ———

@course_controller.post(
    '/enroll/{course_id}',
    summary='选课（学生）',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:course:enroll')],
)
async def enroll_course(
    request: Request,
    course_id: Annotated[int, Path(ge=1)],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> Response:
    result = await CourseService.enroll(query_db, current_user.user.user_id, course_id)
    return ResponseUtil.success(msg=result.message)


@course_controller.get(
    '/my/courses',
    summary='我的课程列表（学生）',
    response_model=DataResponseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:course:enroll')],
)
async def my_courses(
    request: Request,
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> Response:
    result = await CourseService.get_enrolled_courses(query_db, current_user.user.user_id)
    return ResponseUtil.success(data=result)


@course_controller.put(
    '/progress',
    summary='更新学习进度',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:course:enroll')],
)
async def update_progress(
    request: Request,
    data: UpdateProgressModel,
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> Response:
    result = await CourseService.update_learning_progress(query_db, current_user.user.user_id, data)
    return ResponseUtil.success(msg=result.message)


@course_controller.get(
    '/progress/{course_id}',
    summary='获取课程学习进度',
    response_model=DataResponseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:course:enroll')],
)
async def get_progress(
    request: Request,
    course_id: Annotated[int, Path(ge=1)],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> Response:
    result = await CourseService.get_course_progress(query_db, current_user.user.user_id, course_id)
    return ResponseUtil.success(data=result)
