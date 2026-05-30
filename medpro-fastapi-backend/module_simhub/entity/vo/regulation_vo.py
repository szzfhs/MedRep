"""SimHub 规章制度 VO 模型"""
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


class RegulationModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, from_attributes=True, populate_by_name=True)

    reg_id: int | None = Field(default=None, description='制度ID')
    title: str | None = Field(default=None, description='标题')
    content: str | None = Field(default=None, description='正文')
    attachment_url: str | None = Field(default=None, description='附件URL')
    category: str | None = Field(default=None, description='类别')
    sort_order: int | None = Field(default=None, description='排序')
    status: Literal['0', '1'] | None = Field(default=None, description='状态(0=正常,1=停用)')
    create_by: str | None = Field(default=None, description='创建者')
    create_time: datetime | None = Field(default=None, description='创建时间')
    update_by: str | None = Field(default=None, description='更新者')
    update_time: datetime | None = Field(default=None, description='更新时间')
    del_flag: str | None = Field(default=None, description='删除标志')


class AddRegulationModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    title: str = Field(description='标题')
    content: str | None = Field(default=None, description='正文')
    attachment_url: str | None = Field(default=None, description='附件URL')
    category: str | None = Field(default=None, description='类别')
    sort_order: int | None = Field(default=0, description='排序')
    status: Literal['0', '1'] | None = Field(default='0', description='状态')


class EditRegulationModel(AddRegulationModel):
    reg_id: int = Field(description='制度ID')


class DeleteRegulationModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
    reg_ids: str = Field(description='制度ID列表（逗号分隔）')


class RegulationPageQueryModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    page_num: int = Field(default=1, description='页码')
    page_size: int = Field(default=10, description='每页条数')
    title: str | None = Field(default=None, description='标题关键词')
    category: str | None = Field(default=None, description='类别')
    status: str | None = Field(default=None, description='状态')
    tenant_id: int | None = Field(default=None, description='租户ID（None=全部，0=平台数据，N=指定学校）')
