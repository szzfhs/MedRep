"""SimHub 学生/教师扩展信息 VO 模型"""
from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


class StudentProfileModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, from_attributes=True, populate_by_name=True)

    profile_id: int | None = Field(default=None, description='ID')
    user_id: int | None = Field(default=None, description='用户ID')
    student_no: str | None = Field(default=None, description='学号')
    class_name: str | None = Field(default=None, description='班级')
    major: str | None = Field(default=None, description='专业')
    college: str | None = Field(default=None, description='学院')
    grade: str | None = Field(default=None, description='年级')
    enroll_year: int | None = Field(default=None, description='入学年份')
    # 来自 sys_user 的联合查询字段
    nick_name: str | None = Field(default=None, description='姓名')
    email: str | None = Field(default=None, description='邮箱')
    phonenumber: str | None = Field(default=None, description='手机号')
    avatar: str | None = Field(default=None, description='头像')


class EditStudentProfileModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    student_no: str | None = Field(default=None, description='学号')
    class_name: str | None = Field(default=None, description='班级')
    major: str | None = Field(default=None, description='专业')
    college: str | None = Field(default=None, description='学院')
    grade: str | None = Field(default=None, description='年级')
    enroll_year: int | None = Field(default=None, description='入学年份')


class TeacherProfileModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, from_attributes=True, populate_by_name=True)

    profile_id: int | None = Field(default=None, description='ID')
    user_id: int | None = Field(default=None, description='用户ID')
    teacher_no: str | None = Field(default=None, description='工号')
    college: str | None = Field(default=None, description='学院')
    department: str | None = Field(default=None, description='系部/教研室')
    title: str | None = Field(default=None, description='职称')
    introduction: str | None = Field(default=None, description='简介')
    avatar_url: str | None = Field(default=None, description='头像URL')
    # 来自 sys_user 的联合查询字段
    nick_name: str | None = Field(default=None, description='姓名')
    email: str | None = Field(default=None, description='邮箱')
    phonenumber: str | None = Field(default=None, description='手机号')


class EditTeacherProfileModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    teacher_no: str | None = Field(default=None, description='工号')
    college: str | None = Field(default=None, description='学院')
    department: str | None = Field(default=None, description='系部/教研室')
    title: str | None = Field(default=None, description='职称')
    introduction: str | None = Field(default=None, description='简介')
    avatar_url: str | None = Field(default=None, description='头像URL')
