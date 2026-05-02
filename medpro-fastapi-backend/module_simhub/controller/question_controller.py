"""SimHub 习题管理 Controller"""
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
from module_simhub.entity.vo.question_vo import (
    AddQuestionModel,
    AddSectionQuestionModel,
    DeleteQuestionModel,
    EditQuestionModel,
    QuestionPageQueryModel,
)
from module_simhub.service.question_service import QuestionService, SectionQuestionService
from utils.log_util import logger
from utils.response_util import ResponseUtil

question_controller = APIRouterPro(
    prefix='/simhub/question',
    order_num=26,
    tags=['SimHub-习题管理'],
    dependencies=[PreAuthDependency()],
)


# ——— 习题 CRUD ———

@question_controller.get(
    '/list',
    summary='获取习题分页列表',
    response_model=PageResponseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:question:list')],
)
async def get_question_list(
    request: Request,
    query: Annotated[QuestionPageQueryModel, Query()],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
) -> Response:
    result = await QuestionService.get_question_list(query_db, query)
    return ResponseUtil.success(model_content=result)


@question_controller.get(
    '/{question_id}',
    summary='获取习题详情',
    response_model=DataResponseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:question:query')],
)
async def get_question_detail(
    request: Request,
    question_id: Annotated[int, Path(description='习题ID')],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
) -> Response:
    result = await QuestionService.get_question_detail(query_db, question_id)
    if result is None:
        return ResponseUtil.failure(msg='习题不存在')
    return ResponseUtil.success(data=result)


@question_controller.post(
    '',
    summary='新增习题',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:question:add')],
)
@Log(title='习题管理', business_type=BusinessType.INSERT)
async def add_question(
    request: Request,
    data: Annotated[AddQuestionModel, Body()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
) -> Response:
    result = await QuestionService.add_question(query_db, current_user.user.user_name, data)
    return ResponseUtil.success(data=result) if result.is_success else ResponseUtil.failure(msg=result.message)


@question_controller.put(
    '',
    summary='修改习题',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:question:edit')],
)
@Log(title='习题管理', business_type=BusinessType.UPDATE)
async def edit_question(
    request: Request,
    data: Annotated[EditQuestionModel, Body()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
) -> Response:
    result = await QuestionService.edit_question(query_db, current_user.user.user_name, data)
    return ResponseUtil.success(data=result) if result.is_success else ResponseUtil.failure(msg=result.message)


@question_controller.delete(
    '/{question_ids}',
    summary='删除习题（支持批量）',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:question:remove')],
)
@Log(title='习题管理', business_type=BusinessType.DELETE)
async def delete_question(
    request: Request,
    question_ids: Annotated[str, Path(description='习题ID，多个逗号分隔')],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
) -> Response:
    result = await QuestionService.delete_question(query_db, DeleteQuestionModel(question_ids=question_ids))
    return ResponseUtil.success(data=result) if result.is_success else ResponseUtil.failure(msg=result.message)


# ——— 章节-习题关联 ———

@question_controller.get(
    '/section/{section_id}',
    summary='获取章节下的习题列表',
    response_model=DataResponseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:question:list')],
)
async def get_section_questions(
    request: Request,
    section_id: Annotated[int, Path(description='章节ID')],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
) -> Response:
    result = await SectionQuestionService.get_section_questions(query_db, section_id)
    return ResponseUtil.success(data=result)


@question_controller.post(
    '/section',
    summary='向章节关联习题',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:question:add')],
)
@Log(title='章节习题关联', business_type=BusinessType.INSERT)
async def add_section_question(
    request: Request,
    data: Annotated[AddSectionQuestionModel, Body()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
) -> Response:
    result = await SectionQuestionService.add_section_question(query_db, data)
    return ResponseUtil.success(data=result) if result.is_success else ResponseUtil.failure(msg=result.message)


@question_controller.delete(
    '/section/{section_id}/{question_id}',
    summary='从章节移除习题',
    response_model=ResponseBaseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:question:remove')],
)
@Log(title='章节习题关联', business_type=BusinessType.DELETE)
async def remove_section_question(
    request: Request,
    section_id: Annotated[int, Path(description='章节ID')],
    question_id: Annotated[int, Path(description='习题ID')],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
    query_db: Annotated[AsyncSession, DBSessionDependency()],
) -> Response:
    result = await SectionQuestionService.remove_section_question(query_db, section_id, question_id)
    return ResponseUtil.success(data=result) if result.is_success else ResponseUtil.failure(msg=result.message)
