"""SimHub 实验系统管理 Controller"""
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
from module_simhub.entity.vo.sim_system_vo import (
    AddSimSystemModel,
    DeleteSimSystemModel,
    EditSimSystemModel,
    SimSystemPageQueryModel,
)
from module_simhub.service.sim_system_service import SimSystemService
from utils.log_util import logger
from utils.response_util import ResponseUtil

sim_system_controller = APIRouterPro(
    prefix='/simhub/sim-system',
    order_num=23,
    tags=['SimHub-实验系统管理'],
    dependencies=[PreAuthDependency()],
)


@sim_system_controller.get(
    '/list',
    summary='获取实验系统分页列表',
    response_model=PageResponseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:simSystem:list')],
)
async def get_sim_system_list(
    request: Request,
    query: Annotated[SimSystemPageQueryModel, Query()],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
) -> Response:
    result = await SimSystemService.get_sim_system_list(query_db, query)
    return ResponseUtil.success(model_content=result)


@sim_system_controller.get(
    '/options',
    summary='获取所有启用实验系统（下拉选项）',
    response_model=DataResponseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:simSystem:list')],
)
async def get_sim_system_options(
    request: Request,
    query_db: Annotated[AsyncSession, DBSessionDependency()],
) -> Response:
    result = await SimSystemService.get_all_active(query_db)
    return ResponseUtil.success(data=result)


@sim_system_controller.get(
    '/{sim_system_id}',
    summary='获取实验系统详情（含图集）',
    response_model=DataResponseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:simSystem:query')],
)
async def get_sim_system_detail(
    request: Request,
    sim_system_id: Annotated[int, Path(description='实验系统ID')],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
) -> Response:
    result = await SimSystemService.get_sim_system_detail(query_db, sim_system_id, incr_view=True)
    if result is None:
        return ResponseUtil.failure(msg='实验系统不存在')
    return ResponseUtil.success(data=result)


@sim_system_controller.post(
    '',
    summary='新增实验系统',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:simSystem:add')],
)
@Log(title='实验系统管理', business_type=BusinessType.INSERT)
async def add_sim_system(
    request: Request,
    data: Annotated[AddSimSystemModel, Body()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
) -> Response:
    result = await SimSystemService.add_sim_system(query_db, current_user.user.user_name, data)
    return ResponseUtil.success(data=result) if result.is_success else ResponseUtil.failure(msg=result.message)


@sim_system_controller.put(
    '',
    summary='修改实验系统',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:simSystem:edit')],
)
@Log(title='实验系统管理', business_type=BusinessType.UPDATE)
async def edit_sim_system(
    request: Request,
    data: Annotated[EditSimSystemModel, Body()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
) -> Response:
    result = await SimSystemService.edit_sim_system(query_db, current_user.user.user_name, data)
    return ResponseUtil.success(data=result) if result.is_success else ResponseUtil.failure(msg=result.message)


@sim_system_controller.delete(
    '/{sim_system_ids}',
    summary='删除实验系统（支持批量）',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:simSystem:remove')],
)
@Log(title='实验系统管理', business_type=BusinessType.DELETE)
async def delete_sim_system(
    request: Request,
    sim_system_ids: Annotated[str, Path(description='实验系统ID，多个逗号分隔')],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
) -> Response:
    result = await SimSystemService.delete_sim_system(query_db, DeleteSimSystemModel(sim_system_ids=sim_system_ids))
    return ResponseUtil.success(data=result) if result.is_success else ResponseUtil.failure(msg=result.message)
