"""SimHub 实验系统 VO 模型"""
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


class SimSystemModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, from_attributes=True, populate_by_name=True)

    sim_system_id: int | None = Field(default=None, description='实验系统ID')
    system_name: str | None = Field(default=None, description='系统名称')
    system_detail: str | None = Field(default=None, description='系统详情（富文本）')
    cover_image: str | None = Field(default=None, description='封面图URL')
    hw_recommend: str | None = Field(default=None, description='推荐硬件配置描述')
    hw_support: str | None = Field(default=None, description='支持的硬件设备（逗号分隔）')
    sys_category: str | None = Field(default=None, description='系统分类')
    view_count: int | None = Field(default=None, description='查看次数')
    status: Literal['0', '1'] | None = Field(default=None, description='状态(0=正常,1=停用)')
    create_by: str | None = Field(default=None, description='创建者')
    create_time: datetime | None = Field(default=None, description='创建时间')
    update_by: str | None = Field(default=None, description='更新者')
    update_time: datetime | None = Field(default=None, description='更新时间')


class SimSystemImageModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, from_attributes=True, populate_by_name=True)

    image_id: int | None = Field(default=None, description='图片ID')
    sim_system_id: int | None = Field(default=None, description='实验系统ID')
    image_url: str | None = Field(default=None, description='图片URL')
    sort_order: int | None = Field(default=None, description='排序')
    status: str | None = Field(default=None, description='状态')


class AddSimSystemModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    system_name: str = Field(description='系统名称')
    system_detail: str | None = Field(default=None, description='系统详情（富文本）')
    cover_image: str | None = Field(default=None, description='封面图URL')
    hw_recommend: str | None = Field(default=None, description='推荐硬件配置描述')
    hw_support: str | None = Field(default=None, description='支持的硬件设备（逗号分隔）')
    sys_category: str | None = Field(default=None, description='系统分类')
    status: Literal['0', '1'] | None = Field(default='0', description='状态')
    images: list[str] | None = Field(default=None, description='图集URL列表')


class EditSimSystemModel(AddSimSystemModel):
    sim_system_id: int = Field(description='实验系统ID')


class DeleteSimSystemModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
    sim_system_ids: str = Field(description='实验系统ID列表（逗号分隔）')


class SimSystemPageQueryModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    page_num: int = Field(default=1, description='页码')
    page_size: int = Field(default=10, description='每页条数')
    system_name: str | None = Field(default=None, description='系统名称关键词')
    sys_category: str | None = Field(default=None, description='系统分类')
    hw_support: str | None = Field(default=None, description='支持硬件设备')
    status: str | None = Field(default=None, description='状态')
