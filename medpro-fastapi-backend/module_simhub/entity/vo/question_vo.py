"""SimHub 习题 VO 模型"""
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


class QuestionModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, from_attributes=True, populate_by_name=True)

    question_id: int | None = Field(default=None, description='习题ID')
    question_name: str | None = Field(default=None, description='习题名称/标题')
    stem: str | None = Field(default=None, description='题干内容（富文本）')
    options: str | None = Field(default=None, description='选项JSON数组')
    question_type: Literal['single', 'multiple', 'fill', 'essay'] | None = Field(
        default=None, description='题型(single/multiple/fill/essay)'
    )
    answer: str | None = Field(default=None, description='正确答案')
    explanation: str | None = Field(default=None, description='答案释义/解析')
    difficulty: int | None = Field(default=None, description='难度(1=易,2=中,3=难)')
    status: Literal['0', '1'] | None = Field(default=None, description='状态(0=正常,1=停用)')
    create_by: str | None = Field(default=None, description='创建者')
    create_time: datetime | None = Field(default=None, description='创建时间')
    update_by: str | None = Field(default=None, description='更新者')
    update_time: datetime | None = Field(default=None, description='更新时间')


class AddQuestionModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    question_name: str | None = Field(default=None, description='习题名称/标题')
    stem: str = Field(description='题干内容（富文本）')
    options: str | None = Field(default=None, description='选项JSON数组（单/多选题）')
    question_type: Literal['single', 'multiple', 'fill', 'essay'] = Field(
        default='single', description='题型'
    )
    answer: str | None = Field(default=None, description='正确答案')
    explanation: str | None = Field(default=None, description='答案释义/解析')
    difficulty: int | None = Field(default=1, description='难度(1=易,2=中,3=难)')
    status: Literal['0', '1'] | None = Field(default='0', description='状态')


class EditQuestionModel(AddQuestionModel):
    question_id: int = Field(description='习题ID')


class DeleteQuestionModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
    question_ids: str = Field(description='习题ID列表（逗号分隔）')


class QuestionPageQueryModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    page_num: int = Field(default=1, description='页码')
    page_size: int = Field(default=10, description='每页条数')
    question_name: str | None = Field(default=None, description='习题名称关键词')
    question_type: str | None = Field(default=None, description='题型')
    difficulty: int | None = Field(default=None, description='难度')
    status: str | None = Field(default=None, description='状态')


class SectionQuestionModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, from_attributes=True, populate_by_name=True)

    id: int | None = Field(default=None, description='主键')
    section_id: int | None = Field(default=None, description='章节ID')
    course_id: int | None = Field(default=None, description='课程ID')
    question_id: int | None = Field(default=None, description='习题ID')
    sort_order: int | None = Field(default=None, description='排序')
    status: str | None = Field(default=None, description='状态')
    question: QuestionModel | None = Field(default=None, description='习题详情')


class AddSectionQuestionModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    section_id: int = Field(description='章节ID')
    question_id: int = Field(description='习题ID')
    sort_order: int | None = Field(default=0, description='排序')
