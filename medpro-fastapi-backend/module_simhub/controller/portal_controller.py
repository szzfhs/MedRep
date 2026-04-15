"""SimHub 门户公开接口 Controller（无需登录）"""
from typing import Annotated

from fastapi import Path, Query, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession

from common.aspect.db_seesion import DBSessionDependency
from common.aspect.interface_auth import UserInterfaceAuthDependency
from common.aspect.pre_auth import CurrentUserDependency, PreAuthDependency
from common.router import APIRouterPro
from common.vo import DataResponseModel, PageResponseModel
from module_admin.entity.vo.user_vo import CurrentUserModel
from module_simhub.entity.vo.course_vo import CoursePageQueryModel
from module_simhub.entity.vo.experiment_vo import ExperimentPageQueryModel
from module_simhub.entity.vo.news_vo import NewsPageQueryModel
from module_simhub.entity.vo.regulation_vo import RegulationPageQueryModel
from module_simhub.entity.vo.resource_vo import ResourcePageQueryModel
from module_simhub.service.center_service import CenterService
from module_simhub.service.course_service import CourseService
from module_simhub.service.experiment_service import ExperimentService
from module_simhub.service.news_service import NewsService
from module_simhub.service.regulation_service import RegulationService
from module_simhub.service.resource_service import ResourceService
from utils.response_util import ResponseUtil

# 门户路由无 PreAuthDependency —— 公开接口
portal_controller = APIRouterPro(
    prefix='/simhub/portal',
    order_num=20,
    tags=['SimHub-门户公开接口'],
)


# ——— 中心简介 ———

@portal_controller.get(
    '/center',
    summary='门户-获取中心简介',
    response_model=DataResponseModel,
)
async def portal_center_info(
    request: Request,
    query_db: Annotated[AsyncSession, DBSessionDependency()],
) -> Response:
    result = await CenterService.get_center_info(query_db)
    return ResponseUtil.success(data=result)


# ——— 新闻动态 ———

@portal_controller.get(
    '/news',
    summary='门户-新闻列表',
    response_model=PageResponseModel,
)
async def portal_news_list(
    request: Request,
    query: Annotated[NewsPageQueryModel, Query()],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
) -> Response:
    result = await NewsService.get_news_list(query_db, query)
    return ResponseUtil.success(model_content=result)


@portal_controller.get(
    '/news/{news_id}',
    summary='门户-新闻详情',
    response_model=DataResponseModel,
)
async def portal_news_detail(
    request: Request,
    news_id: Annotated[int, Path(ge=1)],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
) -> Response:
    result = await NewsService.get_news_detail(query_db, news_id)
    return ResponseUtil.success(data=result)


# ——— 规章制度 ———

@portal_controller.get(
    '/regulation',
    summary='门户-规章制度列表',
    response_model=PageResponseModel,
)
async def portal_regulation_list(
    request: Request,
    query: Annotated[RegulationPageQueryModel, Query()],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
) -> Response:
    result = await RegulationService.get_regulation_list(query_db, query)
    return ResponseUtil.success(model_content=result)


# ——— 虚拟实验 ———

@portal_controller.get(
    '/experiment/categories',
    summary='门户-实验分类树',
    response_model=DataResponseModel,
)
async def portal_experiment_categories(
    request: Request,
    query_db: Annotated[AsyncSession, DBSessionDependency()],
) -> Response:
    result = await ExperimentService.get_category_tree(query_db)
    return ResponseUtil.success(data=result)


@portal_controller.get(
    '/experiment',
    summary='门户-实验列表',
    response_model=PageResponseModel,
)
async def portal_experiment_list(
    request: Request,
    query: Annotated[ExperimentPageQueryModel, Query()],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
) -> Response:
    result = await ExperimentService.get_experiment_list(query_db, query)
    return ResponseUtil.success(model_content=result)


@portal_controller.get(
    '/experiment/{exp_id}',
    summary='门户-实验详情',
    response_model=DataResponseModel,
)
async def portal_experiment_detail(
    request: Request,
    exp_id: Annotated[int, Path(ge=1)],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
) -> Response:
    result = await ExperimentService.get_experiment_detail(query_db, exp_id, incr_view=True)
    return ResponseUtil.success(data=result)


@portal_controller.post(
    '/experiment/{exp_id}/participate',
    summary='门户-参与实验（需登录）',
    response_model=DataResponseModel,
    dependencies=[PreAuthDependency()],
)
async def portal_participate_experiment(
    request: Request,
    exp_id: Annotated[int, Path(ge=1)],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> Response:
    result = await ExperimentService.participate(query_db, current_user.user.user_id, exp_id)
    return ResponseUtil.success(data=result)


# ——— 课程 ———

@portal_controller.get(
    '/course',
    summary='门户-课程列表',
    response_model=PageResponseModel,
)
async def portal_course_list(
    request: Request,
    query: Annotated[CoursePageQueryModel, Query()],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
) -> Response:
    result = await CourseService.get_course_list(query_db, query)
    return ResponseUtil.success(model_content=result)


@portal_controller.get(
    '/course/{course_id}',
    summary='门户-课程详情（含章节）',
    response_model=DataResponseModel,
)
async def portal_course_detail(
    request: Request,
    course_id: Annotated[int, Path(ge=1)],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
) -> Response:
    course = await CourseService.get_course_detail(query_db, course_id)
    sections = await CourseService.get_sections(query_db, course_id)
    return ResponseUtil.success(data={'course': course, 'sections': sections})


# ——— 资源 ———

@portal_controller.get(
    '/resource/categories',
    summary='门户-资源分类树',
    response_model=DataResponseModel,
)
async def portal_resource_categories(
    request: Request,
    query_db: Annotated[AsyncSession, DBSessionDependency()],
) -> Response:
    result = await ResourceService.get_category_tree(query_db)
    return ResponseUtil.success(data=result)


@portal_controller.get(
    '/resource',
    summary='门户-资源列表',
    response_model=PageResponseModel,
)
async def portal_resource_list(
    request: Request,
    query: Annotated[ResourcePageQueryModel, Query()],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
) -> Response:
    result = await ResourceService.get_resource_list(query_db, query)
    return ResponseUtil.success(model_content=result)


@portal_controller.get(
    '/resource/{resource_id}',
    summary='门户-资源详情',
    response_model=DataResponseModel,
)
async def portal_resource_detail(
    request: Request,
    resource_id: Annotated[int, Path(ge=1)],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
) -> Response:
    await ResourceService.increment_view(query_db, resource_id)
    result = await ResourceService.get_resource_by_id(query_db, resource_id)
    return ResponseUtil.success(data=result)
