"""SimHub 中心简介 Controller"""
from typing import Annotated

from fastapi import Request, Response
from sqlalchemy.ext.asyncio import AsyncSession

from common.annotation.log_annotation import Log
from common.aspect.db_seesion import DBSessionDependency
from common.aspect.interface_auth import UserInterfaceAuthDependency
from common.aspect.pre_auth import CurrentUserDependency, PreAuthDependency
from common.enums import BusinessType
from common.router import APIRouterPro
from common.vo import DataResponseModel, ResponseBaseModel
from module_admin.entity.vo.user_vo import CurrentUserModel
from module_simhub.entity.vo.center_vo import EditCenterInfoModel
from module_simhub.service.center_service import CenterService
from utils.log_util import logger
from utils.response_util import ResponseUtil

center_controller = APIRouterPro(
    prefix='/simhub/center',
    order_num=21,
    tags=['SimHub-中心简介管理'],
    dependencies=[PreAuthDependency()],
)


@center_controller.get(
    '',
    summary='获取中心简介',
    description='获取虚拟仿真实验教学中心简介信息',
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
    description='更新虚拟仿真实验教学中心简介信息',
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
