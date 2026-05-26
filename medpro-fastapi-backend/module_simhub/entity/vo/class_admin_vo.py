"""SimHub 行政班级管理 VO 模型"""
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


# =====================================================
# 学年学期配置 VO
# =====================================================

class TermConfigModel(BaseModel):
    """学年学期配置模型"""

    model_config = ConfigDict(alias_generator=to_camel, from_attributes=True, populate_by_name=True)

    term_id: int | None = Field(default=None, description='主键')
    term_name: str | None = Field(default=None, description='学期名称')
    term_code: str | None = Field(default=None, description='学期编号')
    school_year: str | None = Field(default=None, description='学年')
    semester: str | None = Field(default=None, description='学期(1=上学期,2=下学期,3=短学期)')
    start_date: date | None = Field(default=None, description='开始日期')
    end_date: date | None = Field(default=None, description='结束日期')
    is_current: str | None = Field(default='0', description='是否当前学期(0=否,1=是)')
    status: str | None = Field(default='0', description='状态(0=正常,1=停用)')
    sort_order: int | None = Field(default=0, description='排序')
    remark: str | None = Field(default=None, description='备注')
    create_by: str | None = Field(default=None, description='创建者')
    create_time: datetime | None = Field(default=None, description='创建时间')
    update_by: str | None = Field(default=None, description='更新者')
    update_time: datetime | None = Field(default=None, description='更新时间')


class TermConfigPageQueryModel(BaseModel):
    """学年学期分页查询模型"""

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    page_num: int = Field(default=1, description='页码')
    page_size: int = Field(default=10, description='每页数量')
    term_name: str | None = Field(default=None, description='学期名称')
    school_year: str | None = Field(default=None, description='学年')
    is_current: str | None = Field(default=None, description='是否当前学期')
    status: str | None = Field(default=None, description='状态')


class AddTermConfigModel(BaseModel):
    """新增学年学期模型"""

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    term_name: str = Field(description='学期名称')
    term_code: str | None = Field(default=None, description='学期编号')
    school_year: str | None = Field(default=None, description='学年')
    semester: str | None = Field(default=None, description='学期(1=上学期,2=下学期,3=短学期)')
    start_date: date | None = Field(default=None, description='开始日期')
    end_date: date | None = Field(default=None, description='结束日期')
    is_current: str | None = Field(default='0', description='是否当前学期(0=否,1=是)')
    status: str | None = Field(default='0', description='状态')
    sort_order: int | None = Field(default=0, description='排序')
    remark: str | None = Field(default=None, description='备注')


class EditTermConfigModel(AddTermConfigModel):
    """编辑学年学期模型"""
    term_id: int = Field(description='主键')


class DeleteTermConfigModel(BaseModel):
    """删除学年学期模型"""

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    term_ids: str = Field(description='学期ID，多个用逗号分隔')


# =====================================================
# 行政班级 VO
# =====================================================

class ClassAdminModel(BaseModel):
    """行政班级模型"""

    model_config = ConfigDict(alias_generator=to_camel, from_attributes=True, populate_by_name=True)

    class_id: int | None = Field(default=None, description='班级ID')
    class_name: str | None = Field(default=None, description='班级名称')
    class_code: str | None = Field(default=None, description='班级编号')
    dept_id: int | None = Field(default=None, description='院系ID')
    dept_name: str | None = Field(default=None, description='院系名称（冗余）')
    term_id: int | None = Field(default=None, description='学期ID')
    term_name: str | None = Field(default=None, description='学期名称（冗余）')
    major: str | None = Field(default=None, description='专业')
    grade: str | None = Field(default=None, description='年级')
    head_teacher: str | None = Field(default=None, description='班主任')
    student_count: int | None = Field(default=0, description='学生人数')
    status: str | None = Field(default='0', description='状态(0=正常,1=停用)')
    remark: str | None = Field(default=None, description='备注')
    create_by: str | None = Field(default=None, description='创建者')
    create_time: datetime | None = Field(default=None, description='创建时间')
    update_by: str | None = Field(default=None, description='更新者')
    update_time: datetime | None = Field(default=None, description='更新时间')


class ClassAdminPageQueryModel(BaseModel):
    """行政班级分页查询模型"""

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    page_num: int = Field(default=1, description='页码')
    page_size: int = Field(default=10, description='每页数量')
    class_name: str | None = Field(default=None, description='班级名称')
    class_code: str | None = Field(default=None, description='班级编号')
    dept_id: int | None = Field(default=None, description='院系ID')
    term_id: int | None = Field(default=None, description='学期ID')
    grade: str | None = Field(default=None, description='年级')
    status: str | None = Field(default=None, description='状态')


class AddClassAdminModel(BaseModel):
    """新增行政班级模型"""

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    class_name: str = Field(description='班级名称')
    class_code: str | None = Field(default=None, description='班级编号')
    dept_id: int | None = Field(default=None, description='院系ID')
    dept_name: str | None = Field(default=None, description='院系名称')
    term_id: int | None = Field(default=None, description='学期ID')
    term_name: str | None = Field(default=None, description='学期名称')
    major: str | None = Field(default=None, description='专业')
    grade: str | None = Field(default=None, description='年级')
    head_teacher: str | None = Field(default=None, description='班主任')
    status: str | None = Field(default='0', description='状态')
    remark: str | None = Field(default=None, description='备注')


class EditClassAdminModel(AddClassAdminModel):
    """编辑行政班级模型"""
    class_id: int = Field(description='班级ID')


class DeleteClassAdminModel(BaseModel):
    """删除行政班级模型"""

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    class_ids: str = Field(description='班级ID，多个用逗号分隔')


# =====================================================
# 班级学生 VO
# =====================================================

class ClassStudentModel(BaseModel):
    """班级学生模型"""

    model_config = ConfigDict(alias_generator=to_camel, from_attributes=True, populate_by_name=True)

    id: int | None = Field(default=None, description='主键')
    class_id: int | None = Field(default=None, description='班级ID')
    user_id: int | None = Field(default=None, description='用户ID')
    student_no: str | None = Field(default=None, description='学号')
    student_name: str | None = Field(default=None, description='学生姓名')
    join_date: date | None = Field(default=None, description='入班日期')
    position: str | None = Field(default=None, description='班级职务')
    status: str | None = Field(default='0', description='状态(0=正常,1=休学,2=退学)')
    remark: str | None = Field(default=None, description='备注')
    create_by: str | None = Field(default=None, description='创建者')
    create_time: datetime | None = Field(default=None, description='创建时间')
    update_by: str | None = Field(default=None, description='更新者')
    update_time: datetime | None = Field(default=None, description='更新时间')


class ClassStudentPageQueryModel(BaseModel):
    """班级学生分页查询模型"""

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    page_num: int = Field(default=1, description='页码')
    page_size: int = Field(default=10, description='每页数量')
    class_id: int | None = Field(default=None, description='班级ID')
    student_name: str | None = Field(default=None, description='学生姓名')
    student_no: str | None = Field(default=None, description='学号')
    status: str | None = Field(default=None, description='状态')


class AddClassStudentModel(BaseModel):
    """添加班级学生模型"""

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    class_id: int = Field(description='班级ID')
    user_id: int = Field(description='用户ID')
    student_no: str | None = Field(default=None, description='学号')
    student_name: str | None = Field(default=None, description='学生姓名')
    join_date: date | None = Field(default=None, description='入班日期')
    position: str | None = Field(default=None, description='班级职务')
    status: str | None = Field(default='0', description='状态')
    remark: str | None = Field(default=None, description='备注')


class BatchAddClassStudentModel(BaseModel):
    """批量添加班级学生模型"""

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    class_id: int = Field(description='班级ID')
    user_ids: list[int] = Field(description='用户ID列表')


class DeleteClassStudentModel(BaseModel):
    """删除班级学生模型"""

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    ids: str = Field(description='记录ID，多个用逗号分隔')
