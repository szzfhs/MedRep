"""SimHub 行政班级管理 Controller"""
from typing import Annotated

from fastapi import Body, Path, Query, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession

from common.annotation.log_annotation import Log
from common.aspect.db_seesion import DBSessionDependency
from common.aspect.interface_auth import UserInterfaceAuthDependency
from common.aspect.pre_auth import CurrentUserDependency, PreAuthDependency
from common.enums import BusinessType
from common.router import APIRouterPro
from common.vo import DataResponseModel, PageResponseModel, ResponseBaseModel
from module_admin.entity.vo.user_vo import CurrentUserModel
from module_simhub.entity.vo.class_admin_vo import (
    AddClassAdminModel,
    AddClassStudentModel,
    AddTermConfigModel,
    BatchAddClassStudentModel,
    ClassAdminPageQueryModel,
    ClassStudentPageQueryModel,
    DeleteClassAdminModel,
    DeleteClassStudentModel,
    DeleteTermConfigModel,
    EditClassAdminModel,
    EditTermConfigModel,
    TermConfigPageQueryModel,
)
from module_simhub.service.class_admin_service import ClassAdminService, ClassStudentService, TermConfigService
from utils.response_util import ResponseUtil

class_admin_controller = APIRouterPro(
    prefix='/simhub/class-admin',
    order_num=24,
    tags=['SimHub-行政班级管理'],
    dependencies=[PreAuthDependency()],
)


# ==================== 学年学期配置 ====================
@class_admin_controller.get(
    '/term/list',
    summary='获取学年学期分页列表',
    response_model=PageResponseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:classAdmin:list')],
)
async def get_term_list(
    request: Request,
    query: Annotated[TermConfigPageQueryModel, Query()],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
) -> Response:
    result = await TermConfigService.get_term_list(query_db, query)
    return ResponseUtil.success(model_content=result)


@class_admin_controller.get(
    '/term/options',
    summary='获取所有启用学年学期（下拉选项）',
    response_model=DataResponseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:classAdmin:list')],
)
async def get_term_options(
    request: Request,
    query_db: Annotated[AsyncSession, DBSessionDependency()],
) -> Response:
    result = await TermConfigService.get_all_active(query_db)
    return ResponseUtil.success(data=result)


@class_admin_controller.get(
    '/term/{term_id}',
    summary='获取学年学期详情',
    response_model=DataResponseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:classAdmin:query')],
)
async def get_term_detail(
    request: Request,
    term_id: Annotated[int, Path(description='学期ID')],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
) -> Response:
    result = await TermConfigService.get_term_detail(query_db, term_id)
    if result is None:
        return ResponseUtil.failure(msg='学年学期不存在')
    return ResponseUtil.success(data=result)


@class_admin_controller.post(
    '/term',
    summary='新增学年学期',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:classAdmin:add')],
)
@Log(title='学年学期管理', business_type=BusinessType.INSERT)
async def add_term(
    request: Request,
    data: Annotated[AddTermConfigModel, Body()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
) -> Response:
    result = await TermConfigService.add_term(query_db, current_user.user.user_name, data)
    return ResponseUtil.success(data=result) if result.is_success else ResponseUtil.failure(msg=result.message)


@class_admin_controller.put(
    '/term',
    summary='修改学年学期',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:classAdmin:edit')],
)
@Log(title='学年学期管理', business_type=BusinessType.UPDATE)
async def edit_term(
    request: Request,
    data: Annotated[EditTermConfigModel, Body()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
) -> Response:
    result = await TermConfigService.edit_term(query_db, current_user.user.user_name, data)
    return ResponseUtil.success(data=result) if result.is_success else ResponseUtil.failure(msg=result.message)


@class_admin_controller.delete(
    '/term/{term_ids}',
    summary='删除学年学期',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:classAdmin:remove')],
)
@Log(title='学年学期管理', business_type=BusinessType.DELETE)
async def delete_term(
    request: Request,
    term_ids: Annotated[str, Path(description='学期IDs，逗号分隔')],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
) -> Response:
    result = await TermConfigService.delete_term(query_db, DeleteTermConfigModel(term_ids=term_ids))
    return ResponseUtil.success(data=result) if result.is_success else ResponseUtil.failure(msg=result.message)


# ==================== 行政班级 ====================
@class_admin_controller.get(
    '/list',
    summary='获取行政班级分页列表',
    response_model=PageResponseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:classAdmin:list')],
)
async def get_class_list(
    request: Request,
    query: Annotated[ClassAdminPageQueryModel, Query()],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
) -> Response:
    result = await ClassAdminService.get_class_list(query_db, query)
    return ResponseUtil.success(model_content=result)


@class_admin_controller.get(
    '/options',
    summary='获取所有启用班级（下拉选项）',
    response_model=DataResponseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:classAdmin:list')],
)
async def get_class_options(
    request: Request,
    query_db: Annotated[AsyncSession, DBSessionDependency()],
) -> Response:
    result = await ClassAdminService.get_all_active(query_db)
    return ResponseUtil.success(data=result)


@class_admin_controller.get(
    '/{class_id}',
    summary='获取行政班级详情',
    response_model=DataResponseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:classAdmin:query')],
)
async def get_class_detail(
    request: Request,
    class_id: Annotated[int, Path(description='班级ID')],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
) -> Response:
    result = await ClassAdminService.get_class_detail(query_db, class_id)
    if result is None:
        return ResponseUtil.failure(msg='行政班级不存在')
    return ResponseUtil.success(data=result)


@class_admin_controller.post(
    '',
    summary='新增行政班级',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:classAdmin:add')],
)
@Log(title='行政班级管理', business_type=BusinessType.INSERT)
async def add_class(
    request: Request,
    data: Annotated[AddClassAdminModel, Body()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
) -> Response:
    result = await ClassAdminService.add_class(query_db, current_user.user.user_name, data)
    return ResponseUtil.success(data=result) if result.is_success else ResponseUtil.failure(msg=result.message)


@class_admin_controller.put(
    '',
    summary='修改行政班级',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:classAdmin:edit')],
)
@Log(title='行政班级管理', business_type=BusinessType.UPDATE)
async def edit_class(
    request: Request,
    data: Annotated[EditClassAdminModel, Body()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
) -> Response:
    result = await ClassAdminService.edit_class(query_db, current_user.user.user_name, data)
    return ResponseUtil.success(data=result) if result.is_success else ResponseUtil.failure(msg=result.message)


@class_admin_controller.delete(
    '/{class_ids}',
    summary='删除行政班级',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:classAdmin:remove')],
)
@Log(title='行政班级管理', business_type=BusinessType.DELETE)
async def delete_class(
    request: Request,
    class_ids: Annotated[str, Path(description='班级IDs，逗号分隔')],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
) -> Response:
    result = await ClassAdminService.delete_class(query_db, DeleteClassAdminModel(class_ids=class_ids))
    return ResponseUtil.success(data=result) if result.is_success else ResponseUtil.failure(msg=result.message)


# ==================== 班级学生管理 ====================
@class_admin_controller.get(
    '/student/list',
    summary='获取班级学生分页列表',
    response_model=PageResponseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:classAdmin:list')],
)
async def get_class_student_list(
    request: Request,
    query: Annotated[ClassStudentPageQueryModel, Query()],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
) -> Response:
    result = await ClassStudentService.get_student_list(query_db, query)
    return ResponseUtil.success(model_content=result)


@class_admin_controller.post(
    '/student',
    summary='添加班级学生',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:classAdmin:add')],
)
@Log(title='班级学生管理', business_type=BusinessType.INSERT)
async def add_class_student(
    request: Request,
    data: Annotated[AddClassStudentModel, Body()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
) -> Response:
    result = await ClassStudentService.add_student(query_db, current_user.user.user_name, data)
    return ResponseUtil.success(data=result) if result.is_success else ResponseUtil.failure(msg=result.message)


@class_admin_controller.post(
    '/student/batch',
    summary='批量添加班级学生',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:classAdmin:add')],
)
@Log(title='班级学生管理', business_type=BusinessType.INSERT)
async def batch_add_class_students(
    request: Request,
    data: Annotated[BatchAddClassStudentModel, Body()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
) -> Response:
    result = await ClassStudentService.batch_add_students(query_db, current_user.user.user_name, data)
    return ResponseUtil.success(data=result) if result.is_success else ResponseUtil.failure(msg=result.message)


@class_admin_controller.delete(
    '/student/{ids}',
    summary='删除班级学生',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:classAdmin:remove')],
)
@Log(title='班级学生管理', business_type=BusinessType.DELETE)
async def delete_class_student(
    request: Request,
    ids: Annotated[str, Path(description='班级学生关联IDs，逗号分隔')],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
) -> Response:
    result = await ClassStudentService.delete_student(query_db, DeleteClassStudentModel(ids=ids))
    return ResponseUtil.success(data=result) if result.is_success else ResponseUtil.failure(msg=result.message)
