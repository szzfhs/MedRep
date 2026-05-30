"""SimHub 多租户管理 VO 模型"""
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


class TenantModel(BaseModel):
    """租户详情模型（响应）"""

    model_config = ConfigDict(alias_generator=to_camel, from_attributes=True, populate_by_name=True)

    tenant_id: int | None = Field(default=None, description='租户ID')
    tenant_code: str | None = Field(default=None, description='租户编码')
    tenant_name: str | None = Field(default=None, description='机构名称')
    subdomain: str | None = Field(default=None, description='子域名前缀')
    logo_url: str | None = Field(default=None, description='Logo URL')
    theme_config: str | None = Field(default=None, description='主题配置JSON')
    contact_email: str | None = Field(default=None, description='联系邮箱')
    contact_phone: str | None = Field(default=None, description='联系电话')
    address: str | None = Field(default=None, description='学校地址')
    status: Literal['0', '1'] | None = Field(default=None, description='状态(0=正常,1=停用)')
    remark: str | None = Field(default=None, description='备注')
    create_by: str | None = Field(default=None, description='创建者')
    create_time: datetime | None = Field(default=None, description='创建时间')
    update_by: str | None = Field(default=None, description='更新者')
    update_time: datetime | None = Field(default=None, description='更新时间')


class AddTenantModel(BaseModel):
    """新增租户请求模型"""

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    tenant_code: str = Field(description='租户编码（唯一，如：hzsf）')
    tenant_name: str = Field(description='机构名称（如：杭州师范大学）')
    subdomain: str | None = Field(default=None, description='子域名前缀')
    logo_url: str | None = Field(default=None, description='Logo URL')
    theme_config: str | None = Field(default=None, description='主题配置JSON')
    contact_email: str | None = Field(default=None, description='联系邮箱')
    contact_phone: str | None = Field(default=None, description='联系电话')
    address: str | None = Field(default=None, description='学校地址')
    status: Literal['0', '1'] | None = Field(default='0', description='状态')
    remark: str | None = Field(default=None, description='备注')


class EditTenantModel(AddTenantModel):
    """编辑租户请求模型"""

    tenant_id: int = Field(description='租户ID')


class DeleteTenantModel(BaseModel):
    """删除租户请求模型"""

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    tenant_ids: str = Field(description='租户ID列表（逗号分隔）')


class TenantPageQueryModel(BaseModel):
    """租户分页查询参数"""

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    page_num: int = Field(default=1, ge=1, description='页码')
    page_size: int = Field(default=10, ge=1, le=100, description='每页条数')
    tenant_code: str | None = Field(default=None, description='租户编码（模糊匹配）')
    tenant_name: str | None = Field(default=None, description='机构名称（模糊匹配）')
    status: Literal['0', '1'] | None = Field(default=None, description='状态筛选')


class TenantStatsModel(BaseModel):
    """租户统计数据模型"""

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    tenant_id: int = Field(description='租户ID')
    tenant_name: str = Field(description='租户名称')
    user_count: int = Field(default=0, description='用户数量')
    course_count: int = Field(default=0, description='课程数量（含平台授权+自建）')
    experiment_count: int = Field(default=0, description='实验数量')
    resource_count: int = Field(default=0, description='资源数量')
    news_count: int = Field(default=0, description='新闻数量')
    grant_count: int = Field(default=0, description='平台授权内容数量')


# ---------- 内容授权 VO ----------

class GrantContentModel(BaseModel):
    """授权内容请求模型"""

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    content_type: Literal['course', 'experiment', 'resource', 'sim_system'] = Field(
        description='内容类型(course/experiment/resource/sim_system)'
    )
    content_id: int = Field(description='内容ID')


class BatchGrantModel(BaseModel):
    """批量授权内容请求模型"""

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    grants: list[GrantContentModel] = Field(description='授权项列表')


class GrantRecordModel(BaseModel):
    """授权记录模型（响应）"""

    model_config = ConfigDict(alias_generator=to_camel, from_attributes=True, populate_by_name=True)

    grant_id: int | None = Field(default=None, description='授权ID')
    tenant_id: int | None = Field(default=None, description='租户ID')
    content_type: str | None = Field(default=None, description='内容类型')
    content_id: int | None = Field(default=None, description='内容ID')
    granted_by: str | None = Field(default=None, description='授权操作者')
    grant_time: datetime | None = Field(default=None, description='授权时间')
    status: str | None = Field(default=None, description='状态(0=有效,1=已撤销)')
