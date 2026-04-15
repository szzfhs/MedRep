"""SimHub 教学资源 VO 模型"""
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


class ResourceCategoryModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, from_attributes=True, populate_by_name=True)

    category_id: int | None = Field(default=None, description='分类ID')
    category_name: str | None = Field(default=None, description='分类名称')
    parent_id: int | None = Field(default=None, description='父分类ID')
    sort_order: int | None = Field(default=None, description='排序')
    status: str | None = Field(default=None, description='状态')
    children: list['ResourceCategoryModel'] | None = Field(default=None, description='子分类')


class AddResourceCategoryModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    category_name: str = Field(description='分类名称')
    parent_id: int | None = Field(default=0, description='父分类ID')
    sort_order: int | None = Field(default=0, description='排序')
    status: str | None = Field(default='0', description='状态')


class EditResourceCategoryModel(AddResourceCategoryModel):
    category_id: int = Field(description='分类ID')


class ResourceModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, from_attributes=True, populate_by_name=True)

    resource_id: int | None = Field(default=None, description='资源ID')
    resource_name: str | None = Field(default=None, description='资源名称')
    resource_type: str | None = Field(default=None, description='类型(pdf/video/audio/image/doc)')
    file_url: str | None = Field(default=None, description='文件URL')
    cover_image: str | None = Field(default=None, description='封面图URL')
    description: str | None = Field(default=None, description='描述')
    file_size: int | None = Field(default=None, description='文件大小（字节）')
    duration: int | None = Field(default=None, description='时长（秒）')
    category_id: int | None = Field(default=None, description='资源分类ID')
    course_id: int | None = Field(default=None, description='关联课程ID')
    section_id: int | None = Field(default=None, description='关联章节ID')
    allow_download: str | None = Field(default=None, description='允许下载')
    download_count: int | None = Field(default=None, description='下载次数')
    view_count: int | None = Field(default=None, description='查看次数')
    status: Literal['0', '1'] | None = Field(default=None, description='状态')
    create_by: str | None = Field(default=None, description='创建者')
    create_time: datetime | None = Field(default=None, description='创建时间')
    update_by: str | None = Field(default=None, description='更新者')
    update_time: datetime | None = Field(default=None, description='更新时间')


class AddResourceModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    resource_name: str = Field(description='资源名称')
    resource_type: str | None = Field(default='doc', description='类型')
    file_url: str | None = Field(default=None, description='文件URL')
    cover_image: str | None = Field(default=None, description='封面图URL')
    description: str | None = Field(default=None, description='描述')
    file_size: int | None = Field(default=0, description='文件大小')
    duration: int | None = Field(default=0, description='时长（秒）')
    category_id: int | None = Field(default=None, description='资源分类ID')
    course_id: int | None = Field(default=None, description='关联课程ID')
    section_id: int | None = Field(default=None, description='关联章节ID')
    allow_download: str | None = Field(default='0', description='允许下载(0=是,1=否)')
    status: Literal['0', '1'] | None = Field(default='0', description='状态')


class EditResourceModel(AddResourceModel):
    resource_id: int = Field(description='资源ID')


class DeleteResourceModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
    resource_ids: str = Field(description='资源ID列表（逗号分隔）')


class ResourcePageQueryModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    page_num: int = Field(default=1, description='页码')
    page_size: int = Field(default=10, description='每页条数')
    resource_name: str | None = Field(default=None, description='资源名称关键词')
    resource_type: str | None = Field(default=None, description='资源类型')
    category_id: int | None = Field(default=None, description='分类ID')
    course_id: int | None = Field(default=None, description='课程ID')
    section_id: int | None = Field(default=None, description='章节ID')
    status: str | None = Field(default=None, description='状态')
