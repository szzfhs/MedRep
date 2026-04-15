"""SimHub 用户档案 Controller"""
from typing import Annotated

from fastapi import Request, Response
from sqlalchemy.ext.asyncio import AsyncSession

from common.annotation.log_annotation import Log
from common.aspect.db_seesion import DBSessionDependency
from common.aspect.interface_auth import UserInterfaceAuthDependency
from common.aspect.pre_auth import CurrentUserDependency, PreAuthDependency
from common.enums import BusinessType
from common.router import APIRouterPro
from common.vo import DataResponseModel, ResponseBaseModel
from module_admin.entity.vo.user_vo import CurrentUserModel
from module_simhub.entity.vo.profile_vo import EditStudentProfileModel, EditTeacherProfileModel
from module_simhub.service.profile_service import StudentProfileService, TeacherProfileService
from utils.log_util import logger
from utils.response_util import ResponseUtil

profile_controller = APIRouterPro(
    prefix='/simhub/profile',
    order_num=27,
    tags=['SimHub-用户档案管理'],
    dependencies=[PreAuthDependency()],
)


@profile_controller.get(
    '/student',
    summary='获取当前学生档案',
    response_model=DataResponseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:profile:query')],
)
async def get_student_profile(
    request: Request,
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> Response:
    result = await StudentProfileService.get_profile(query_db, current_user.user.user_id)
    return ResponseUtil.success(data=result)


@profile_controller.put(
    '/student',
    summary='保存学生档案',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:profile:edit')],
)
@Log(title='学生档案', business_type=BusinessType.UPDATE)
async def save_student_profile(
    request: Request,
    data: EditStudentProfileModel,
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> Response:
    result = await StudentProfileService.save_profile(query_db, current_user.user.user_id, data)
    logger.info(result.message)
    return ResponseUtil.success(msg=result.message)


@profile_controller.get(
    '/teacher',
    summary='获取当前教师档案',
    response_model=DataResponseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:profile:query')],
)
async def get_teacher_profile(
    request: Request,
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> Response:
    result = await TeacherProfileService.get_profile(query_db, current_user.user.user_id)
    return ResponseUtil.success(data=result)


@profile_controller.put(
    '/teacher',
    summary='保存教师档案',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:profile:edit')],
)
@Log(title='教师档案', business_type=BusinessType.UPDATE)
async def save_teacher_profile(
    request: Request,
    data: EditTeacherProfileModel,
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> Response:
    result = await TeacherProfileService.save_profile(query_db, current_user.user.user_id, data)
    logger.info(result.message)
    return ResponseUtil.success(msg=result.message)
