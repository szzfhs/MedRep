"""SimHub 租户管理 Controller（仅 admin 超级管理员可用）"""
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
from module_simhub.entity.vo.tenant_vo import (
    AddTenantModel,
    BatchGrantModel,
    DeleteTenantModel,
    EditTenantModel,
    GrantRecordModel,
    TenantModel,
    TenantPageQueryModel,
    TenantStatsModel,
)
from module_simhub.service.tenant_service import TenantService
from utils.log_util import logger
from utils.response_util import ResponseUtil

tenant_controller = APIRouterPro(
    prefix='/simhub/tenant',
    order_num=30,
    tags=['SimHub-租户管理（超管）'],
    dependencies=[PreAuthDependency()],
)


# ======================== 租户 CRUD ========================

@tenant_controller.get(
    '/list',
    summary='获取租户分页列表',
    response_model=PageResponseModel[TenantModel],
    dependencies=[UserInterfaceAuthDependency('simhub:tenant:list')],
)
async def get_tenant_list(
    request: Request,
    query: Annotated[TenantPageQueryModel, Query()],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
) -> Response:
    result = await TenantService.get_tenant_list(query_db, query)
    return ResponseUtil.success(model_content=result)


@tenant_controller.get(
    '/all',
    summary='获取所有启用租户（下拉选择器用）',
    response_model=DataResponseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:tenant:list')],
)
async def get_all_tenants(
    request: Request,
    query_db: Annotated[AsyncSession, DBSessionDependency()],
) -> Response:
    result = await TenantService.get_all_tenants(query_db)
    return ResponseUtil.success(data=result)


@tenant_controller.get(
    '/{tenant_id}',
    summary='获取租户详情',
    response_model=DataResponseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:tenant:query')],
)
async def get_tenant_detail(
    request: Request,
    tenant_id: Annotated[int, Path(ge=1)],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
) -> Response:
    result = await TenantService.get_tenant_detail(query_db, tenant_id)
    if result is None:
        return ResponseUtil.failure(msg='租户不存在')
    return ResponseUtil.success(data=result)


@tenant_controller.post(
    '',
    summary='新增租户',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:tenant:add')],
)
@Log(title='租户管理', business_type=BusinessType.INSERT)
async def add_tenant(
    request: Request,
    data: AddTenantModel,
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> Response:
    result = await TenantService.add_tenant(query_db, current_user.user.user_name, data)
    logger.info(result.message)
    if not result.is_success:
        return ResponseUtil.failure(msg=result.message)
    return ResponseUtil.success(msg=result.message)


@tenant_controller.put(
    '',
    summary='编辑租户',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:tenant:edit')],
)
@Log(title='租户管理', business_type=BusinessType.UPDATE)
async def edit_tenant(
    request: Request,
    data: EditTenantModel,
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> Response:
    result = await TenantService.edit_tenant(query_db, current_user.user.user_name, data)
    logger.info(result.message)
    if not result.is_success:
        return ResponseUtil.failure(msg=result.message)
    return ResponseUtil.success(msg=result.message)


@tenant_controller.delete(
    '/{tenant_ids}',
    summary='删除租户',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:tenant:remove')],
)
@Log(title='租户管理', business_type=BusinessType.DELETE)
async def delete_tenant(
    request: Request,
    tenant_ids: Annotated[str, Path(description='租户ID列表（逗号分隔）')],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> Response:
    data = DeleteTenantModel(tenant_ids=tenant_ids)
    result = await TenantService.delete_tenant(query_db, data)
    logger.info(result.message)
    return ResponseUtil.success(msg=result.message)


# ======================== 统计 ========================

@tenant_controller.get(
    '/{tenant_id}/stats',
    summary='获取租户统计数据',
    response_model=DataResponseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:tenant:query')],
)
async def get_tenant_stats(
    request: Request,
    tenant_id: Annotated[int, Path(ge=1)],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
) -> Response:
    result = await TenantService.get_tenant_stats(query_db, tenant_id)
    if result is None:
        return ResponseUtil.failure(msg='租户不存在')
    return ResponseUtil.success(data=result)


# ======================== 内容授权 ========================

@tenant_controller.get(
    '/{tenant_id}/grants',
    summary='查看租户的已授权内容列表',
    response_model=DataResponseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:tenant:grant')],
)
async def get_grants(
    request: Request,
    tenant_id: Annotated[int, Path(ge=1)],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    content_type: Annotated[
        str | None,
        Query(description='内容类型筛选(course/experiment/resource/sim_system)'),
    ] = None,
) -> Response:
    result = await TenantService.get_grants(query_db, tenant_id, content_type)
    return ResponseUtil.success(data=result)


@tenant_controller.post(
    '/{tenant_id}/grant',
    summary='批量授权内容给租户',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:tenant:grant')],
)
@Log(title='租户内容授权', business_type=BusinessType.GRANT)
async def grant_content(
    request: Request,
    tenant_id: Annotated[int, Path(ge=1)],
    data: BatchGrantModel,
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> Response:
    result = await TenantService.grant_content(query_db, tenant_id, current_user.user.user_name, data)
    logger.info(result.message)
    if not result.is_success:
        return ResponseUtil.failure(msg=result.message)
    return ResponseUtil.success(msg=result.message)


@tenant_controller.delete(
    '/{tenant_id}/grant/{content_type}/{content_id}',
    summary='撤销租户的内容授权',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:tenant:grant')],
)
@Log(title='租户内容授权', business_type=BusinessType.DELETE)
async def revoke_content(
    request: Request,
    tenant_id: Annotated[int, Path(ge=1)],
    content_type: Annotated[str, Path(description='内容类型')],
    content_id: Annotated[int, Path(ge=1, description='内容ID')],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> Response:
    result = await TenantService.revoke_content(query_db, tenant_id, content_type, content_id)
    logger.info(result.message)
    if not result.is_success:
        return ResponseUtil.failure(msg=result.message)
    return ResponseUtil.success(msg=result.message)
