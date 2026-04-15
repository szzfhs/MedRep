"""SimHub 虚拟实验 Controller"""
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
from module_simhub.entity.vo.experiment_vo import (
    AddExperimentCategoryModel,
    AddExperimentModel,
    DeleteExperimentModel,
    EditExperimentCategoryModel,
    EditExperimentModel,
    ExperimentPageQueryModel,
)
from module_simhub.service.experiment_service import ExperimentService
from utils.log_util import logger
from utils.response_util import ResponseUtil

experiment_controller = APIRouterPro(
    prefix='/simhub/experiment',
    order_num=24,
    tags=['SimHub-虚拟实验管理'],
    dependencies=[PreAuthDependency()],
)


# ——— 分类管理 ———

@experiment_controller.get(
    '/category/tree',
    summary='获取实验分类树',
    response_model=DataResponseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:experiment:list')],
)
async def get_category_tree(
    request: Request,
    query_db: Annotated[AsyncSession, DBSessionDependency()],
) -> Response:
    result = await ExperimentService.get_category_tree(query_db)
    return ResponseUtil.success(data=result)


@experiment_controller.post(
    '/category',
    summary='新增实验分类',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:experiment:add')],
)
@Log(title='实验分类', business_type=BusinessType.INSERT)
async def add_category(
    request: Request,
    data: AddExperimentCategoryModel,
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> Response:
    result = await ExperimentService.add_category(query_db, data)
    logger.info(result.message)
    return ResponseUtil.success(msg=result.message)


@experiment_controller.put(
    '/category',
    summary='编辑实验分类',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:experiment:edit')],
)
@Log(title='实验分类', business_type=BusinessType.UPDATE)
async def edit_category(
    request: Request,
    data: EditExperimentCategoryModel,
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> Response:
    result = await ExperimentService.edit_category(query_db, current_user.user.user_name, data)
    logger.info(result.message)
    return ResponseUtil.success(msg=result.message)


@experiment_controller.delete(
    '/category/{category_id}',
    summary='删除实验分类',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:experiment:remove')],
)
@Log(title='实验分类', business_type=BusinessType.DELETE)
async def delete_category(
    request: Request,
    category_id: Annotated[int, Path(ge=1)],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> Response:
    result = await ExperimentService.delete_category(query_db, category_id)
    logger.info(result.message)
    return ResponseUtil.success(msg=result.message)


# ——— 实验管理 ———

@experiment_controller.get(
    '/list',
    summary='获取实验分页列表',
    response_model=PageResponseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:experiment:list')],
)
async def get_experiment_list(
    request: Request,
    query: Annotated[ExperimentPageQueryModel, Query()],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
) -> Response:
    result = await ExperimentService.get_experiment_list(query_db, query)
    return ResponseUtil.success(model_content=result)


@experiment_controller.get(
    '/{exp_id}',
    summary='获取实验详情',
    response_model=DataResponseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:experiment:query')],
)
async def get_experiment_detail(
    request: Request,
    exp_id: Annotated[int, Path(ge=1)],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
) -> Response:
    result = await ExperimentService.get_experiment_detail(query_db, exp_id)
    return ResponseUtil.success(data=result)


@experiment_controller.post(
    '',
    summary='新增实验',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:experiment:add')],
)
@Log(title='虚拟实验', business_type=BusinessType.INSERT)
async def add_experiment(
    request: Request,
    data: AddExperimentModel,
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> Response:
    result = await ExperimentService.add_experiment(query_db, current_user.user.user_name, data)
    logger.info(result.message)
    return ResponseUtil.success(msg=result.message)


@experiment_controller.put(
    '',
    summary='编辑实验',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:experiment:edit')],
)
@Log(title='虚拟实验', business_type=BusinessType.UPDATE)
async def edit_experiment(
    request: Request,
    data: EditExperimentModel,
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> Response:
    result = await ExperimentService.edit_experiment(query_db, current_user.user.user_name, data)
    logger.info(result.message)
    return ResponseUtil.success(msg=result.message)


@experiment_controller.delete(
    '/{exp_ids}',
    summary='删除实验',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:experiment:remove')],
)
@Log(title='虚拟实验', business_type=BusinessType.DELETE)
async def delete_experiment(
    request: Request,
    exp_ids: Annotated[str, Path()],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> Response:
    result = await ExperimentService.delete_experiment(query_db, DeleteExperimentModel(exp_ids=exp_ids))
    logger.info(result.message)
    return ResponseUtil.success(msg=result.message)
