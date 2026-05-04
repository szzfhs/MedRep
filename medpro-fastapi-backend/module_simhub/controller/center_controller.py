"""SimHub 中心简介 Controller"""
from typing import Annotated

from fastapi import Path, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession

from common.annotation.log_annotation import Log
from common.aspect.db_seesion import DBSessionDependency
from common.aspect.interface_auth import UserInterfaceAuthDependency
from common.aspect.pre_auth import CurrentUserDependency, PreAuthDependency
from common.enums import BusinessType
from common.router import APIRouterPro
from common.vo import DataResponseModel, ResponseBaseModel
from module_admin.entity.vo.user_vo import CurrentUserModel
from module_simhub.entity.vo.center_vo import EditCenterInfoModel, EditOrgMemberModel, EditTeamMemberModel
from module_simhub.service.center_service import CenterService
from utils.log_util import logger
from utils.response_util import ResponseUtil

center_controller = APIRouterPro(
    prefix='/simhub/center',
    order_num=21,
    tags=['SimHub-中心简介管理'],
    dependencies=[PreAuthDependency()],
)


# ===== 中心基本信息 =====

@center_controller.get(
    '',
    summary='获取中心简介',
    response_model=DataResponseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:center:query')],
)
async def get_center_info(
    request: Request,
    query_db: Annotated[AsyncSession, DBSessionDependency()],
) -> Response:
    result = await CenterService.get_center_info(query_db)
    return ResponseUtil.success(data=result or {})


@center_controller.put(
    '',
    summary='更新中心简介',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:center:edit')],
)
@Log(title='中心简介', business_type=BusinessType.UPDATE)
async def update_center_info(
    request: Request,
    data: EditCenterInfoModel,
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> Response:
    result = await CenterService.update_center_info(query_db, current_user.user.user_name, data)
    logger.info(result.message)
    return ResponseUtil.success(msg=result.message)


# ===== 组织架构成员 =====

@center_controller.get(
    '/org',
    summary='获取组织架构成员列表',
    response_model=DataResponseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:center:query')],
)
async def list_org_members(
    request: Request,
    query_db: Annotated[AsyncSession, DBSessionDependency()],
) -> Response:
    result = await CenterService.get_org_members(query_db)
    return ResponseUtil.success(data=result)


@center_controller.post(
    '/org',
    summary='新增组织架构成员',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:center:edit')],
)
@Log(title='组织架构', business_type=BusinessType.INSERT)
async def add_org_member(
    request: Request,
    data: EditOrgMemberModel,
    query_db: Annotated[AsyncSession, DBSessionDependency()],
) -> Response:
    result = await CenterService.create_org_member(query_db, data)
    return ResponseUtil.success(msg=result.message)


@center_controller.put(
    '/org/{member_id}',
    summary='修改组织架构成员',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:center:edit')],
)
@Log(title='组织架构', business_type=BusinessType.UPDATE)
async def update_org_member(
    request: Request,
    member_id: Annotated[int, Path(ge=1)],
    data: EditOrgMemberModel,
    query_db: Annotated[AsyncSession, DBSessionDependency()],
) -> Response:
    result = await CenterService.update_org_member(query_db, member_id, data)
    return ResponseUtil.success(msg=result.message) if result.is_success else ResponseUtil.fail(msg=result.message)


@center_controller.delete(
    '/org/{member_id}',
    summary='删除组织架构成员',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:center:edit')],
)
@Log(title='组织架构', business_type=BusinessType.DELETE)
async def delete_org_member(
    request: Request,
    member_id: Annotated[int, Path(ge=1)],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
) -> Response:
    result = await CenterService.delete_org_member(query_db, member_id)
    return ResponseUtil.success(msg=result.message) if result.is_success else ResponseUtil.fail(msg=result.message)


# ===== 核心团队成员 =====

@center_controller.get(
    '/team',
    summary='获取核心团队成员列表',
    response_model=DataResponseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:center:query')],
)
async def list_team_members(
    request: Request,
    query_db: Annotated[AsyncSession, DBSessionDependency()],
) -> Response:
    result = await CenterService.get_team_members(query_db, include_disabled=True)
    return ResponseUtil.success(data=result)


@center_controller.post(
    '/team',
    summary='新增核心团队成员',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:center:edit')],
)
@Log(title='核心团队', business_type=BusinessType.INSERT)
async def add_team_member(
    request: Request,
    data: EditTeamMemberModel,
    query_db: Annotated[AsyncSession, DBSessionDependency()],
) -> Response:
    result = await CenterService.create_team_member(query_db, data)
    return ResponseUtil.success(msg=result.message)


@center_controller.put(
    '/team/{member_id}',
    summary='修改核心团队成员',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:center:edit')],
)
@Log(title='核心团队', business_type=BusinessType.UPDATE)
async def update_team_member(
    request: Request,
    member_id: Annotated[int, Path(ge=1)],
    data: EditTeamMemberModel,
    query_db: Annotated[AsyncSession, DBSessionDependency()],
) -> Response:
    result = await CenterService.update_team_member(query_db, member_id, data)
    return ResponseUtil.success(msg=result.message) if result.is_success else ResponseUtil.fail(msg=result.message)


@center_controller.delete(
    '/team/{member_id}',
    summary='删除核心团队成员',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:center:edit')],
)
@Log(title='核心团队', business_type=BusinessType.DELETE)
async def delete_team_member(
    request: Request,
    member_id: Annotated[int, Path(ge=1)],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
) -> Response:
    result = await CenterService.delete_team_member(query_db, member_id)
    return ResponseUtil.success(msg=result.message) if result.is_success else ResponseUtil.fail(msg=result.message)

