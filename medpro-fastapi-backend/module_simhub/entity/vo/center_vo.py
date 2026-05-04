"""SimHub 实验中心介绍 VO 模型"""
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


class OrgMemberModel(BaseModel):
    """组织架构成员模型"""

    model_config = ConfigDict(alias_generator=to_camel, from_attributes=True, populate_by_name=True)

    id: int | None = Field(default=None, description='主键')
    name: str = Field(description='姓名及职称')
    title_text: str | None = Field(default=None, description='职务名称')
    dept: str | None = Field(default=None, description='职责描述')
    color: str | None = Field(default='#0B5394', description='显示颜色')
    sort_order: int | None = Field(default=0, description='排序')


class EditOrgMemberModel(BaseModel):
    """编辑组织架构成员请求模型"""

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    name: str = Field(description='姓名及职称')
    title_text: str | None = Field(default=None, description='职务名称')
    dept: str | None = Field(default=None, description='职责描述')
    color: str | None = Field(default='#0B5394', description='显示颜色')
    sort_order: int | None = Field(default=0, description='排序')


class TeamMemberModel(BaseModel):
    """核心团队成员模型"""

    model_config = ConfigDict(alias_generator=to_camel, from_attributes=True, populate_by_name=True)

    id: int | None = Field(default=None, description='主键')
    name: str = Field(description='姓名')
    title_role: str | None = Field(default=None, description='职位职称')
    specialty: str | None = Field(default=None, description='研究专长')
    bio: str | None = Field(default=None, description='个人简介')
    image_url: str | None = Field(default=None, description='头像URL')
    sort_order: int | None = Field(default=0, description='排序')
    status: str | None = Field(default='0', description='状态')


class EditTeamMemberModel(BaseModel):
    """编辑核心团队成员请求模型"""

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    name: str = Field(description='姓名')
    title_role: str | None = Field(default=None, description='职位职称')
    specialty: str | None = Field(default=None, description='研究专长')
    bio: str | None = Field(default=None, description='个人简介')
    image_url: str | None = Field(default=None, description='头像URL')
    sort_order: int | None = Field(default=0, description='排序')
    status: str | None = Field(default='0', description='状态')


class CenterInfoModel(BaseModel):
    """实验中心信息模型"""

    model_config = ConfigDict(alias_generator=to_camel, from_attributes=True, populate_by_name=True)

    id: int | None = Field(default=None, description='主键')
    center_name: str | None = Field(default=None, description='中心名称')
    center_slogan: str | None = Field(default=None, description='宣传语/副标题')
    hero_badge: str | None = Field(default=None, description='英雄区徽章文字')
    description: str | None = Field(default=None, description='中心简介正文')
    logo_url: str | None = Field(default=None, description='Logo图片URL')
    banner_url: str | None = Field(default=None, description='首页Banner图URL')
    stat_founded_year: str | None = Field(default=None, description='中心成立年份')
    stat_experiments: str | None = Field(default=None, description='虚拟仿真实验项目数')
    stat_students: str | None = Field(default=None, description='年服务学生数')
    stat_courses: str | None = Field(default=None, description='实验课程数')
    achievements_json: str | None = Field(default=None, description='荣誉成就JSON')
    functions_json: str | None = Field(default=None, description='基本职能JSON')
    contact_address: str | None = Field(default=None, description='联系地址')
    contact_phone: str | None = Field(default=None, description='联系电话')
    contact_email: str | None = Field(default=None, description='联系邮箱')
    update_by: str | None = Field(default=None, description='更新者')
    update_time: datetime | None = Field(default=None, description='更新时间')


class EditCenterInfoModel(BaseModel):
    """编辑实验中心信息请求模型"""

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    center_name: str | None = Field(default=None, description='中心名称')
    center_slogan: str | None = Field(default=None, description='宣传语/副标题')
    hero_badge: str | None = Field(default=None, description='英雄区徽章文字')
    description: str | None = Field(default=None, description='中心简介正文')
    logo_url: str | None = Field(default=None, description='Logo图片URL')
    banner_url: str | None = Field(default=None, description='首页Banner图URL')
    stat_founded_year: str | None = Field(default=None, description='中心成立年份')
    stat_experiments: str | None = Field(default=None, description='虚拟仿真实验项目数')
    stat_students: str | None = Field(default=None, description='年服务学生数')
    stat_courses: str | None = Field(default=None, description='实验课程数')
    achievements_json: str | None = Field(default=None, description='荣誉成就JSON')
    functions_json: str | None = Field(default=None, description='基本职能JSON')
    contact_address: str | None = Field(default=None, description='联系地址')
    contact_phone: str | None = Field(default=None, description='联系电话')
    contact_email: str | None = Field(default=None, description='联系邮箱')
