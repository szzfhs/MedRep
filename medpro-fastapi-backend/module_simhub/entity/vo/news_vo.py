"""SimHub 新闻动态 VO 模型"""
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


class NewsModel(BaseModel):
    """新闻模型"""

    model_config = ConfigDict(alias_generator=to_camel, from_attributes=True, populate_by_name=True)

    news_id: int | None = Field(default=None, description='新闻ID')
    title: str | None = Field(default=None, description='标题')
    summary: str | None = Field(default=None, description='摘要')
    content: str | None = Field(default=None, description='正文')
    cover_image: str | None = Field(default=None, description='封面图URL')
    author: str | None = Field(default=None, description='作者')
    status: Literal['0', '1'] | None = Field(default=None, description='状态(0=草稿,1=已发布)')
    view_count: int | None = Field(default=None, description='浏览次数')
    publish_time: datetime | None = Field(default=None, description='发布时间')
    create_by: str | None = Field(default=None, description='创建者')
    create_time: datetime | None = Field(default=None, description='创建时间')
    update_by: str | None = Field(default=None, description='更新者')
    update_time: datetime | None = Field(default=None, description='更新时间')
    del_flag: str | None = Field(default=None, description='删除标志')


class AddNewsModel(BaseModel):
    """新增新闻请求模型"""

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    title: str = Field(description='标题')
    summary: str | None = Field(default=None, description='摘要')
    content: str | None = Field(default=None, description='正文')
    cover_image: str | None = Field(default=None, description='封面图URL')
    author: str | None = Field(default=None, description='作者')
    status: Literal['0', '1'] | None = Field(default='0', description='状态')
    publish_time: datetime | None = Field(default=None, description='发布时间')


class EditNewsModel(AddNewsModel):
    """编辑新闻请求模型"""

    news_id: int = Field(description='新闻ID')


class DeleteNewsModel(BaseModel):
    """删除新闻请求模型"""

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
    news_ids: str = Field(description='新闻ID列表（逗号分隔）')


class NewsPageQueryModel(BaseModel):
    """新闻分页查询参数"""

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    page_num: int = Field(default=1, description='页码')
    page_size: int = Field(default=10, description='每页条数')
    title: str | None = Field(default=None, description='标题关键词')
    status: str | None = Field(default=None, description='状态')
    begin_time: str | None = Field(default=None, description='开始时间')
    end_time: str | None = Field(default=None, description='结束时间')
    tenant_id: int | None = Field(default=None, description='租户ID（None=全部，0=平台数据，N=指定学校）')
