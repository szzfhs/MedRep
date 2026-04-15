"""SimHub 资源管理 Controller"""
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
from module_simhub.entity.vo.resource_vo import (
    AddResourceCategoryModel,
    AddResourceModel,
    DeleteResourceModel,
    EditResourceCategoryModel,
    EditResourceModel,
    ResourcePageQueryModel,
)
from module_simhub.service.resource_service import ResourceService
from utils.log_util import logger
from utils.response_util import ResponseUtil

resource_controller = APIRouterPro(
    prefix='/simhub/resource',
    order_num=26,
    tags=['SimHub-资源管理'],
    dependencies=[PreAuthDependency()],
)


# ——— 分类管理 ———

@resource_controller.get(
    '/category/tree',
    summary='获取资源分类树',
    response_model=DataResponseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:resource:list')],
)
async def get_category_tree(
    request: Request,
    query_db: Annotated[AsyncSession, DBSessionDependency()],
) -> Response:
    result = await ResourceService.get_category_tree(query_db)
    return ResponseUtil.success(data=result)


@resource_controller.post(
    '/category',
    summary='新增资源分类',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:resource:add')],
)
@Log(title='资源分类', business_type=BusinessType.INSERT)
async def add_category(
    request: Request,
    data: AddResourceCategoryModel,
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> Response:
    result = await ResourceService.add_category(
        query_db, current_user.user.user_name, data.model_dump(exclude_none=True)
    )
    logger.info(result.message)
    return ResponseUtil.success(msg=result.message)


@resource_controller.put(
    '/category',
    summary='编辑资源分类',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:resource:edit')],
)
@Log(title='资源分类', business_type=BusinessType.UPDATE)
async def edit_category(
    request: Request,
    data: EditResourceCategoryModel,
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> Response:
    category_id = data.category_id
    update_data = data.model_dump(exclude={'category_id'}, exclude_none=True)
    result = await ResourceService.edit_category(query_db, current_user.user.user_name, category_id, update_data)
    logger.info(result.message)
    return ResponseUtil.success(msg=result.message)


@resource_controller.delete(
    '/category/{category_id}',
    summary='删除资源分类',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:resource:remove')],
)
@Log(title='资源分类', business_type=BusinessType.DELETE)
async def delete_category(
    request: Request,
    category_id: Annotated[int, Path(ge=1)],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> Response:
    result = await ResourceService.delete_category(query_db, category_id)
    logger.info(result.message)
    return ResponseUtil.success(msg=result.message)


# ——— 资源 CRUD ———

@resource_controller.get(
    '/list',
    summary='获取资源分页列表',
    response_model=PageResponseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:resource:list')],
)
async def get_resource_list(
    request: Request,
    query: Annotated[ResourcePageQueryModel, Query()],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
) -> Response:
    result = await ResourceService.get_resource_list(query_db, query)
    return ResponseUtil.success(model_content=result)


@resource_controller.get(
    '/{resource_id}',
    summary='获取资源详情',
    response_model=DataResponseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:resource:query')],
)
async def get_resource_detail(
    request: Request,
    resource_id: Annotated[int, Path(ge=1)],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
) -> Response:
    result = await ResourceService.get_resource_by_id(query_db, resource_id)
    return ResponseUtil.success(data=result)


@resource_controller.post(
    '',
    summary='新增资源',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:resource:add')],
)
@Log(title='资源', business_type=BusinessType.INSERT)
async def add_resource(
    request: Request,
    data: AddResourceModel,
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> Response:
    result = await ResourceService.add_resource(query_db, current_user.user.user_name, data)
    logger.info(result.message)
    return ResponseUtil.success(msg=result.message)


@resource_controller.put(
    '',
    summary='编辑资源',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:resource:edit')],
)
@Log(title='资源', business_type=BusinessType.UPDATE)
async def edit_resource(
    request: Request,
    data: EditResourceModel,
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> Response:
    result = await ResourceService.edit_resource(query_db, current_user.user.user_name, data)
    logger.info(result.message)
    return ResponseUtil.success(msg=result.message)


@resource_controller.delete(
    '/{resource_ids}',
    summary='删除资源',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:resource:remove')],
)
@Log(title='资源', business_type=BusinessType.DELETE)
async def delete_resource(
    request: Request,
    resource_ids: Annotated[str, Path()],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> Response:
    result = await ResourceService.delete_resource(query_db, DeleteResourceModel(resource_ids=resource_ids))
    logger.info(result.message)
    return ResponseUtil.success(msg=result.message)
