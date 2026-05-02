"""SimHub 虚拟仿真实验 VO 模型"""
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


class ExperimentCategoryModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, from_attributes=True, populate_by_name=True)

    category_id: int | None = Field(default=None, description='分类ID')
    category_name: str | None = Field(default=None, description='分类名称')
    parent_id: int | None = Field(default=None, description='父分类ID')
    icon: str | None = Field(default=None, description='图标')
    sort_order: int | None = Field(default=None, description='排序')
    status: str | None = Field(default=None, description='状态')
    children: list['ExperimentCategoryModel'] | None = Field(default=None, description='子分类')


class AddExperimentCategoryModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    category_name: str = Field(description='分类名称')
    parent_id: int | None = Field(default=0, description='父分类ID')
    icon: str | None = Field(default=None, description='图标')
    sort_order: int | None = Field(default=0, description='排序')
    status: str | None = Field(default='0', description='状态')


class EditExperimentCategoryModel(AddExperimentCategoryModel):
    category_id: int = Field(description='分类ID')


class ExperimentModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, from_attributes=True, populate_by_name=True)

    exp_id: int | None = Field(default=None, description='实验ID')
    exp_name: str | None = Field(default=None, description='实验名称')
    category_id: int | None = Field(default=None, description='分类ID')
    category_name: str | None = Field(default=None, description='分类名称（冗余）')
    sim_system_id: int | None = Field(default=None, description='关联实验系统ID')
    exp_type: Literal['web', 'exe'] | None = Field(default=None, description='类型(web/exe)')
    launch_url: str | None = Field(default=None, description='启动地址')
    cover_image: str | None = Field(default=None, description='封面图URL')
    description: str | None = Field(default=None, description='实验介绍')
    exp_duration: int | None = Field(default=None, description='实验时长（分钟）')
    exp_guide: str | None = Field(default=None, description='实验指导书（HTML）')
    env_requirements: str | None = Field(default=None, description='环境要求')
    software_requirements: str | None = Field(default=None, description='软件要求')
    attachments: str | None = Field(default=None, description='附件JSON数组')
    tags: str | None = Field(default=None, description='标签')
    status: Literal['0', '1'] | None = Field(default=None, description='状态(0=正常,1=停用)')
    view_count: int | None = Field(default=None, description='查看次数')
    participate_count: int | None = Field(default=None, description='参与人数')
    sort_order: int | None = Field(default=None, description='排序')
    create_by: str | None = Field(default=None, description='创建者')
    create_time: datetime | None = Field(default=None, description='创建时间')
    update_by: str | None = Field(default=None, description='更新者')
    update_time: datetime | None = Field(default=None, description='更新时间')


class AddExperimentModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    exp_name: str = Field(description='实验名称')
    category_id: int | None = Field(default=None, description='分类ID')
    sim_system_id: int | None = Field(default=None, description='关联实验系统ID')
    exp_type: Literal['web', 'exe'] | None = Field(default='web', description='类型')
    launch_url: str | None = Field(default=None, description='启动地址')
    cover_image: str | None = Field(default=None, description='封面图URL')
    description: str | None = Field(default=None, description='实验介绍')
    exp_duration: int | None = Field(default=0, description='实验时长（分钟）')
    exp_guide: str | None = Field(default=None, description='实验指导书（HTML）')
    env_requirements: str | None = Field(default=None, description='环境要求')
    software_requirements: str | None = Field(default=None, description='软件要求')
    attachments: str | None = Field(default=None, description='附件JSON数组')
    tags: str | None = Field(default=None, description='标签')
    status: Literal['0', '1'] | None = Field(default='0', description='状态')
    sort_order: int | None = Field(default=0, description='排序')


class EditExperimentModel(AddExperimentModel):
    exp_id: int = Field(description='实验ID')


class DeleteExperimentModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
    exp_ids: str = Field(description='实验ID列表（逗号分隔）')


class ExperimentPageQueryModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    page_num: int = Field(default=1, description='页码')
    page_size: int = Field(default=10, description='每页条数')
    exp_name: str | None = Field(default=None, description='实验名称关键词')
    category_id: int | None = Field(default=None, description='分类ID')
    sim_system_id: int | None = Field(default=None, description='实验系统ID')
    exp_type: str | None = Field(default=None, description='类型')
    status: str | None = Field(default=None, description='状态')
