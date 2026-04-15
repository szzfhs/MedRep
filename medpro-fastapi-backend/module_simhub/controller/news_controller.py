"""SimHub 新闻动态 Controller"""
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
from module_simhub.entity.vo.news_vo import (
    AddNewsModel,
    DeleteNewsModel,
    EditNewsModel,
    NewsModel,
    NewsPageQueryModel,
)
from module_simhub.service.news_service import NewsService
from utils.log_util import logger
from utils.response_util import ResponseUtil

news_controller = APIRouterPro(
    prefix='/simhub/news',
    order_num=22,
    tags=['SimHub-新闻动态管理'],
    dependencies=[PreAuthDependency()],
)


@news_controller.get(
    '/list',
    summary='获取新闻分页列表',
    response_model=PageResponseModel[NewsModel],
    dependencies=[UserInterfaceAuthDependency('simhub:news:list')],
)
async def get_news_list(
    request: Request,
    query: Annotated[NewsPageQueryModel, Query()],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
) -> Response:
    result = await NewsService.get_news_list(query_db, query)
    return ResponseUtil.success(model_content=result)


@news_controller.get(
    '/{news_id}',
    summary='获取新闻详情',
    response_model=DataResponseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:news:query')],
)
async def get_news_detail(
    request: Request,
    news_id: Annotated[int, Path(ge=1)],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
) -> Response:
    result = await NewsService.get_news_detail(query_db, news_id)
    return ResponseUtil.success(data=result)


@news_controller.post(
    '',
    summary='新增新闻',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:news:add')],
)
@Log(title='新闻动态', business_type=BusinessType.INSERT)
async def add_news(
    request: Request,
    data: AddNewsModel,
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> Response:
    result = await NewsService.add_news(query_db, current_user.user.user_name, data)
    logger.info(result.message)
    return ResponseUtil.success(msg=result.message)


@news_controller.put(
    '',
    summary='编辑新闻',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:news:edit')],
)
@Log(title='新闻动态', business_type=BusinessType.UPDATE)
async def edit_news(
    request: Request,
    data: EditNewsModel,
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> Response:
    result = await NewsService.edit_news(query_db, current_user.user.user_name, data)
    logger.info(result.message)
    return ResponseUtil.success(msg=result.message)


@news_controller.delete(
    '/{news_ids}',
    summary='删除新闻',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:news:remove')],
)
@Log(title='新闻动态', business_type=BusinessType.DELETE)
async def delete_news(
    request: Request,
    news_ids: Annotated[str, Path()],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> Response:
    result = await NewsService.delete_news(query_db, DeleteNewsModel(news_ids=news_ids))
    logger.info(result.message)
    return ResponseUtil.success(msg=result.message)
