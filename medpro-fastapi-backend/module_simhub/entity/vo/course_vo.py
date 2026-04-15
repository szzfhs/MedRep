"""SimHub 实验课程 VO 模型"""
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


class CourseSectionModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, from_attributes=True, populate_by_name=True)

    section_id: int | None = Field(default=None, description='章节ID')
    course_id: int | None = Field(default=None, description='课程ID')
    parent_id: int | None = Field(default=None, description='父章节ID')
    title: str | None = Field(default=None, description='章节标题')
    sort_order: int | None = Field(default=None, description='排序')
    section_type: str | None = Field(default=None, description='类型(chapter/section)')
    description: str | None = Field(default=None, description='描述')
    children: list['CourseSectionModel'] | None = Field(default=None, description='子章节')


class AddSectionModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    course_id: int = Field(description='课程ID')
    parent_id: int | None = Field(default=0, description='父章节ID')
    title: str = Field(description='标题')
    sort_order: int | None = Field(default=0, description='排序')
    section_type: str | None = Field(default='section', description='类型')
    description: str | None = Field(default=None, description='描述')


class EditSectionModel(AddSectionModel):
    section_id: int = Field(description='章节ID')


class CourseModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, from_attributes=True, populate_by_name=True)

    course_id: int | None = Field(default=None, description='课程ID')
    course_name: str | None = Field(default=None, description='课程名称')
    teacher_id: int | None = Field(default=None, description='主讲教师ID')
    teacher_name: str | None = Field(default=None, description='主讲教师姓名（冗余）')
    cover_image: str | None = Field(default=None, description='封面图URL')
    description: str | None = Field(default=None, description='课程介绍')
    category: str | None = Field(default=None, description='课程分类')
    total_sections: int | None = Field(default=None, description='章节数')
    total_resources: int | None = Field(default=None, description='资源数')
    status: Literal['0', '1'] | None = Field(default=None, description='状态(0=发布,1=草稿)')
    enroll_count: int | None = Field(default=None, description='选课人数')
    sort_order: int | None = Field(default=None, description='排序')
    create_by: str | None = Field(default=None, description='创建者')
    create_time: datetime | None = Field(default=None, description='创建时间')
    update_by: str | None = Field(default=None, description='更新者')
    update_time: datetime | None = Field(default=None, description='更新时间')


class AddCourseModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    course_name: str = Field(description='课程名称')
    teacher_id: int | None = Field(default=None, description='主讲教师ID')
    cover_image: str | None = Field(default=None, description='封面图URL')
    description: str | None = Field(default=None, description='课程介绍')
    category: str | None = Field(default=None, description='课程分类')
    status: Literal['0', '1'] | None = Field(default='1', description='状态')
    sort_order: int | None = Field(default=0, description='排序')


class EditCourseModel(AddCourseModel):
    course_id: int = Field(description='课程ID')


class DeleteCourseModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
    course_ids: str = Field(description='课程ID列表（逗号分隔）')


class CoursePageQueryModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    page_num: int = Field(default=1, description='页码')
    page_size: int = Field(default=10, description='每页条数')
    course_name: str | None = Field(default=None, description='课程名称关键词')
    teacher_id: int | None = Field(default=None, description='教师ID')
    status: str | None = Field(default=None, description='状态')
    category: str | None = Field(default=None, description='分类')


class EnrollmentModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, from_attributes=True)

    enrollment_id: int | None = Field(default=None, description='选课ID')
    user_id: int | None = Field(default=None, description='用户ID')
    course_id: int | None = Field(default=None, description='课程ID')
    enroll_time: datetime | None = Field(default=None, description='选课时间')
    status: str | None = Field(default=None, description='状态')


class LearningProgressModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, from_attributes=True)

    progress_id: int | None = Field(default=None, description='进度ID')
    user_id: int | None = Field(default=None, description='用户ID')
    course_id: int | None = Field(default=None, description='课程ID')
    section_id: int | None = Field(default=None, description='章节ID')
    resource_id: int | None = Field(default=None, description='资源ID')
    last_position: int | None = Field(default=None, description='上次位置（秒）')
    completed: str | None = Field(default=None, description='是否完成')
    update_time: datetime | None = Field(default=None, description='更新时间')


class UpdateProgressModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    course_id: int = Field(description='课程ID')
    section_id: int = Field(description='章节ID')
    resource_id: int | None = Field(default=None, description='资源ID')
    last_position: int | None = Field(default=0, description='当前位置（秒）')
    completed: str | None = Field(default='0', description='是否完成')
