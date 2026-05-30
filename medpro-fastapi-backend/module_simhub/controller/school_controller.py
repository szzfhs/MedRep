"""
SimHub 校级管理员专属 Controller
角色：simhub_admin（已绑定 tenant_id 的学校管理员）
所有接口自动按登录用户的 tenant_id 进行数据隔离。
"""
from typing import Annotated

from fastapi import Query, Request, Response
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from common.aspect.db_seesion import DBSessionDependency
from common.aspect.interface_auth import UserInterfaceAuthDependency
from common.aspect.pre_auth import CurrentUserDependency, PreAuthDependency
from common.router import APIRouterPro
from common.vo import DataResponseModel
from exceptions.exception import ServiceException
from module_admin.entity.do.user_do import SysUser
from module_admin.entity.vo.user_vo import CurrentUserModel
from module_simhub.dao.tenant_dao import TenantDao
from module_simhub.entity.do.simhub_do import (
    VfCourse,
    VfExperiment,
    VfNews,
    VfResource,
    VfSimSystem,
)
from module_simhub.entity.do.tenant_do import VfTenantContentGrant
from module_simhub.entity.vo.tenant_vo import TenantModel, TenantStatsModel
from utils.response_util import ResponseUtil

school_controller = APIRouterPro(
    prefix='/simhub/school',
    order_num=31,
    tags=['SimHub-校级管理员'],
    dependencies=[PreAuthDependency()],
)


def _require_tenant_id(current_user: CurrentUserModel) -> int:
    """从当前登录用户提取 tenant_id，若为平台超管则拒绝访问"""
    tid = getattr(current_user.user, 'tenant_id', None)
    if tid is None:
        raise ServiceException(message='该接口仅限学校管理员访问，平台超管请使用管理后台')
    return tid


# ======================== 学校 Dashboard 总览 ========================

@school_controller.get(
    '/dashboard',
    summary='校级管理员-学校数据总览',
    response_model=DataResponseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:school:dashboard')],
)
async def school_dashboard(
    request: Request,
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
) -> Response:
    """
    返回当前学校的核心统计数据：
    - 用户数（学生+教师）
    - 课程数（平台授权+学校自建）
    - 实验数（平台授权+学校自建）
    - 资源数（学校自建）
    - 新闻数（学校自建）
    - 平台授权总数
    """
    tenant_id = _require_tenant_id(current_user)

    # 获取租户基本信息
    tenant = await TenantDao.get_tenant_by_id(query_db, tenant_id)
    if not tenant:
        return ResponseUtil.failure(msg='所属学校信息未找到，请联系平台管理员')

    # 汇总统计
    stats = await TenantDao.get_tenant_stats(query_db, tenant_id)
    stats['tenant_name'] = tenant.tenant_name

    # 最近新闻（5条）
    recent_news_result = await query_db.execute(
        select(VfNews.news_id, VfNews.title, VfNews.create_time, VfNews.view_count)
        .where(VfNews.tenant_id == tenant_id, VfNews.del_flag == '0')
        .order_by(VfNews.create_time.desc())
        .limit(5)
    )
    recent_news = [
        {'newsId': row.news_id, 'title': row.title,
         'createTime': row.create_time.isoformat() if row.create_time else None,
         'viewCount': row.view_count}
        for row in recent_news_result.fetchall()
    ]

    # 最近授权的平台内容（5条）
    recent_grants_result = await query_db.execute(
        select(
            VfTenantContentGrant.grant_id,
            VfTenantContentGrant.content_type,
            VfTenantContentGrant.content_id,
            VfTenantContentGrant.grant_time,
        )
        .where(VfTenantContentGrant.tenant_id == tenant_id, VfTenantContentGrant.status == '0')
        .order_by(VfTenantContentGrant.grant_time.desc())
        .limit(5)
    )
    recent_grants = [
        {'grantId': row.grant_id, 'contentType': row.content_type,
         'contentId': row.content_id,
         'grantTime': row.grant_time.isoformat() if row.grant_time else None}
        for row in recent_grants_result.fetchall()
    ]

    return ResponseUtil.success(data={
        'tenantInfo': TenantModel.model_validate(tenant).model_dump(by_alias=True),
        'stats': TenantStatsModel(**stats).model_dump(by_alias=True),
        'recentNews': recent_news,
        'recentGrants': recent_grants,
    })


# ======================== 学校用户列表 ========================

@school_controller.get(
    '/users',
    summary='校级管理员-本校用户列表',
    response_model=DataResponseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:school:user:list')],
)
async def school_user_list(
    request: Request,
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
    page_num: Annotated[int, Query(ge=1, description='页码')] = 1,
    page_size: Annotated[int, Query(ge=1, le=100, description='每页条数')] = 20,
    nick_name: Annotated[str | None, Query(description='姓名模糊搜索')] = None,
) -> Response:
    """获取本校所有用户（不含超管账户）"""
    tenant_id = _require_tenant_id(current_user)

    conditions = [SysUser.tenant_id == tenant_id, SysUser.del_flag == '0']
    if nick_name:
        conditions.append(SysUser.nick_name.like(f'%{nick_name}%'))

    total = (await query_db.execute(select(func.count()).where(*conditions))).scalar() or 0

    offset = (page_num - 1) * page_size
    users_result = await query_db.execute(
        select(
            SysUser.user_id,
            SysUser.user_name,
            SysUser.nick_name,
            SysUser.email,
            SysUser.phonenumber,
            SysUser.status,
            SysUser.create_time,
        )
        .where(*conditions)
        .order_by(SysUser.create_time.desc())
        .offset(offset)
        .limit(page_size)
    )
    users = [
        {
            'userId': row.user_id,
            'userName': row.user_name,
            'nickName': row.nick_name,
            'email': row.email,
            'phonenumber': row.phonenumber,
            'status': row.status,
            'createTime': row.create_time.isoformat() if row.create_time else None,
        }
        for row in users_result.fetchall()
    ]

    return ResponseUtil.success(data={
        'total': total,
        'pageNum': page_num,
        'pageSize': page_size,
        'rows': users,
    })


# ======================== 学校可用内容（平台授权+自建）========================

@school_controller.get(
    '/available-courses',
    summary='校级管理员-可用课程（平台授权+自建）',
    response_model=DataResponseModel,
    dependencies=[UserInterfaceAuthDependency('simhub:school:content:list')],
)
async def school_available_courses(
    request: Request,
    query_db: Annotated[AsyncSession, DBSessionDependency()],
    current_user: Annotated[CurrentUserModel, CurrentUserDependency()],
    page_num: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
) -> Response:
    """
    获取本校可用的课程列表：
    1. 平台授权给本校的课程（source_type='platform', 存在 grant 记录）
    2. 本校自建课程（tenant_id = 当前 tenant_id）
    """
    tenant_id = _require_tenant_id(current_user)

    # 本校授权的平台课程 IDs
    granted_ids_result = await query_db.execute(
        select(VfTenantContentGrant.content_id)
        .where(
            VfTenantContentGrant.tenant_id == tenant_id,
            VfTenantContentGrant.content_type == 'course',
            VfTenantContentGrant.status == '0',
        )
    )
    granted_course_ids = [row[0] for row in granted_ids_result.fetchall()]

    from sqlalchemy import or_
    conditions = [
        VfCourse.del_flag == '0',
        or_(
            VfCourse.tenant_id == tenant_id,
            VfCourse.course_id.in_(granted_course_ids) if granted_course_ids else False,
        ),
    ]

    total = (await query_db.execute(select(func.count()).where(*conditions))).scalar() or 0
    offset = (page_num - 1) * page_size
    courses_result = await query_db.execute(
        select(
            VfCourse.course_id,
            VfCourse.course_name,
            VfCourse.cover_image,
            VfCourse.status,
            VfCourse.source_type,
            VfCourse.tenant_id,
        )
        .where(*conditions)
        .order_by(VfCourse.course_id.desc())
        .offset(offset)
        .limit(page_size)
    )
    courses = [
        {
            'courseId': row.course_id,
            'courseName': row.course_name,
            'coverImage': row.cover_image,
            'status': row.status,
            'sourceType': row.source_type,
            'isOwned': row.tenant_id == tenant_id,
        }
        for row in courses_result.fetchall()
    ]

    return ResponseUtil.success(data={
        'total': total,
        'pageNum': page_num,
        'pageSize': page_size,
        'rows': courses,
    })
