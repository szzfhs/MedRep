"""SimHub 规章制度 Controller"""
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
from module_simhub.entity.vo.regulation_vo import (
    AddRegulationModel,
    DeleteRegulationModel,
    EditRegulationModel,
    RegulationModel,
    RegulationPageQueryModel,
)
from module_simhub.service.regulation_service import RegulationService
from utils.log_util import logger
from utils.response_util import ResponseUtil

regulation_controller = APIRouterPro(
    prefix='/simhub/regulation',
    order_num=23,
    tags=['SimHub-规章制度管理'],
    dependencies=[PreAuthDependency()],
)


@regulation_controller.get(
    '/list',
    summary='获取规章制度分页列表',
    response_model=PageResponseModel[RegulationModel],
    dependencies=[UserInterfaceAuthDependency('simhub:regulation:list')],
)
async def get_regulation_list(
    request: Request,
    query: Annotated[RegulationPageQueryModel, Query()],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
) -> Response:
    result = await RegulationService.get_regulation_list(query_db, query)
    return ResponseUtil.success(model_content=result)


@regulation_controller.get(
    '/{reg_id}',
    summary='获取规章制度详情',
    response_model=DataResponseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:regulation:query')],
)
async def get_regulation_detail(
    request: Request,
    reg_id: Annotated[int, Path(ge=1)],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
) -> Response:
    result = await RegulationService.get_regulation_detail(query_db, reg_id)
    return ResponseUtil.success(data=result)


@regulation_controller.post(
    '',
    summary='新增规章制度',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:regulation:add')],
)
@Log(title='规章制度', business_type=BusinessType.INSERT)
async def add_regulation(
    request: Request,
    data: AddRegulationModel,
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> Response:
    result = await RegulationService.add_regulation(query_db, current_user.user.user_name, data)
    logger.info(result.message)
    return ResponseUtil.success(msg=result.message)


@regulation_controller.put(
    '',
    summary='编辑规章制度',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:regulation:edit')],
)
@Log(title='规章制度', business_type=BusinessType.UPDATE)
async def edit_regulation(
    request: Request,
    data: EditRegulationModel,
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> Response:
    result = await RegulationService.edit_regulation(query_db, current_user.user.user_name, data)
    logger.info(result.message)
    return ResponseUtil.success(msg=result.message)


@regulation_controller.delete(
    '/{reg_ids}',
    summary='删除规章制度',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:regulation:remove')],
)
@Log(title='规章制度', business_type=BusinessType.DELETE)
async def delete_regulation(
    request: Request,
    reg_ids: Annotated[str, Path()],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> Response:
    result = await RegulationService.delete_regulation(query_db, DeleteRegulationModel(reg_ids=reg_ids))
    logger.info(result.message)
    return ResponseUtil.success(msg=result.message)
