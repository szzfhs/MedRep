"""SimHub 实验课程 VO 模型"""
from datetime import datetime
from decimal import Decimal
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
    hours: int | None = Field(default=None, description='章节学时')
    has_resource: str | None = Field(default=None, description='是否有课件资源(0=否,1=是)')
    has_experiment: str | None = Field(default=None, description='是否有虚拟实验(0=否,1=是)')
    has_test: str | None = Field(default=None, description='是否有在线测试(0=否,1=是)')
    description: str | None = Field(default=None, description='描述')
    status: str | None = Field(default=None, description='状态(0=正常,1=停用)')
    create_time: datetime | None = Field(default=None, description='创建时间')
    update_time: datetime | None = Field(default=None, description='更新时间')
    children: list['CourseSectionModel'] | None = Field(default=None, description='子章节')


class AddSectionModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    course_id: int = Field(description='课程ID')
    parent_id: int | None = Field(default=0, description='父章节ID')
    title: str = Field(description='标题')
    sort_order: int | None = Field(default=0, description='排序')
    section_type: str | None = Field(default='section', description='类型')
    hours: int | None = Field(default=0, description='章节学时')
    has_resource: str | None = Field(default='0', description='是否有课件资源(0=否,1=是)')
    has_experiment: str | None = Field(default='0', description='是否有虚拟实验(0=否,1=是)')
    has_test: str | None = Field(default='0', description='是否有在线测试(0=否,1=是)')
    description: str | None = Field(default=None, description='描述')


class EditSectionModel(AddSectionModel):
    section_id: int = Field(description='章节ID')


class CourseModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, from_attributes=True, populate_by_name=True)

    course_id: int | None = Field(default=None, description='课程ID')
    course_name: str | None = Field(default=None, description='课程名称')
    subtitle: str | None = Field(default=None, description='英文副标题')
    teacher_id: int | None = Field(default=None, description='主讲教师ID')
    teacher_name: str | None = Field(default=None, description='主讲教师姓名（冗余）')
    department: str | None = Field(default=None, description='所属院系')
    cover_image: str | None = Field(default=None, description='封面图URL')
    description: str | None = Field(default=None, description='课程介绍')
    course_category: str | None = Field(default=None, description='课程分类(1=理论课,2=实验课,3=理实一体化课)')
    category: str | None = Field(default=None, description='课程分类（旧字段，已废弃）')
    total_sections: int | None = Field(default=None, description='章节数')
    total_resources: int | None = Field(default=None, description='资源数')
    total_hours: int | None = Field(default=None, description='总学时')
    status: Literal['0', '1', '2'] | None = Field(default=None, description='状态(0=新建,1=已审核,2=已发布)')
    enroll_count: int | None = Field(default=None, description='选课人数')
    rating: Decimal | None = Field(default=None, description='课程评分(0.0-5.0)')
    review_count: int | None = Field(default=None, description='评价数')
    publish_date: datetime | None = Field(default=None, description='开课时间')
    sort_order: int | None = Field(default=None, description='排序')
    create_by: str | None = Field(default=None, description='创建者')
    create_time: datetime | None = Field(default=None, description='创建时间')
    update_by: str | None = Field(default=None, description='更新者')
    update_time: datetime | None = Field(default=None, description='更新时间')


class AddCourseModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    course_name: str = Field(description='课程名称')
    subtitle: str | None = Field(default=None, description='英文副标题')
    teacher_id: int | None = Field(default=None, description='主讲教师ID')
    teacher_name: str | None = Field(default=None, description='主讲教师姓名')
    department: str | None = Field(default=None, description='所属院系')
    cover_image: str | None = Field(default=None, description='封面图URL')
    description: str | None = Field(default=None, description='课程介绍')
    course_category: str | None = Field(default='1', description='课程分类(1=理论课,2=实验课,3=理实一体化课)')
    total_hours: int | None = Field(default=0, description='总学时')
    rating: Decimal | None = Field(default=None, description='课程评分')
    review_count: int | None = Field(default=0, description='评价数')
    publish_date: datetime | None = Field(default=None, description='开课时间')
    status: Literal['0', '1', '2'] | None = Field(default='0', description='状态(0=新建,1=已审核,2=已发布)')
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
    course_category: str | None = Field(default=None, description='课程分类')


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


# ——— 章节-实验 / 章节-资源 绑定 VO ———

class AddSectionExperimentModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    section_id: int = Field(description='章节ID')
    course_id: int | None = Field(default=None, description='课程ID（冗余，可选）')
    exp_id: int = Field(description='实验ID')
    sort_order: int | None = Field(default=0, description='排序')


class AddSectionResourceModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    section_id: int = Field(description='章节ID')
    course_id: int | None = Field(default=None, description='课程ID（冗余，可选）')
    resource_id: int = Field(description='资源ID')
    sort_order: int | None = Field(default=0, description='排序')
