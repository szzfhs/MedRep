"""SimHub 实验中心介绍 VO 模型"""
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


class CenterInfoModel(BaseModel):
    """实验中心信息模型"""

    model_config = ConfigDict(alias_generator=to_camel, from_attributes=True, populate_by_name=True)

    id: int | None = Field(default=None, description='主键')
    center_name: str | None = Field(default=None, description='中心名称')
    center_slogan: str | None = Field(default=None, description='宣传语')
    description: str | None = Field(default=None, description='详细介绍')
    logo_url: str | None = Field(default=None, description='Logo图片URL')
    banner_url: str | None = Field(default=None, description='首页Banner图URL')
    org_structure: str | None = Field(default=None, description='组织架构')
    team_intro: str | None = Field(default=None, description='团队介绍')
    contact_info: str | None = Field(default=None, description='联系方式')
    update_by: str | None = Field(default=None, description='更新者')
    update_time: datetime | None = Field(default=None, description='更新时间')


class EditCenterInfoModel(BaseModel):
    """编辑实验中心信息请求模型"""

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    center_name: str | None = Field(default=None, description='中心名称')
    center_slogan: str | None = Field(default=None, description='宣传语')
    description: str | None = Field(default=None, description='详细介绍')
    logo_url: str | None = Field(default=None, description='Logo图片URL')
    banner_url: str | None = Field(default=None, description='首页Banner图URL')
    org_structure: str | None = Field(default=None, description='组织架构')
    team_intro: str | None = Field(default=None, description='团队介绍')
    contact_info: str | None = Field(default=None, description='联系方式')
