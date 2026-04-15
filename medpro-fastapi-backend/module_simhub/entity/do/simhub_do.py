"""
SimHub 虚拟仿真实验教学平台 — 所有数据库模型
表前缀: vf_
"""
from datetime import datetime

from sqlalchemy import CHAR, BigInteger, Column, DateTime, Integer, String, Text

from config.database import Base
from config.env import DataBaseConfig
from utils.common_util import SqlalchemyUtil


class VfCenterInfo(Base):
    """实验中心信息表（单条记录）"""

    __tablename__ = 'vf_center_info'
    __table_args__ = {'comment': '实验中心信息表'}

    id = Column(BigInteger, primary_key=True, autoincrement=True, comment='主键')
    center_name = Column(String(100), nullable=True, server_default='虚拟仿真实验中心', comment='中心名称')
    center_slogan = Column(String(200), nullable=True, server_default="''", comment='宣传语')
    description = Column(Text, nullable=True, comment='详细介绍（富文本）')
    logo_url = Column(String(200), nullable=True, server_default="''", comment='Logo图片URL')
    banner_url = Column(String(200), nullable=True, server_default="''", comment='首页Banner图URL')
    org_structure = Column(Text, nullable=True, comment='组织架构（富文本）')
    team_intro = Column(Text, nullable=True, comment='团队介绍（富文本）')
    contact_info = Column(String(500), nullable=True, server_default="''", comment='联系方式')
    update_by = Column(String(64), nullable=True, server_default="''", comment='更新者')
    update_time = Column(DateTime, nullable=True, comment='更新时间', onupdate=datetime.now)


class VfNews(Base):
    """新闻动态表"""

    __tablename__ = 'vf_news'
    __table_args__ = {'comment': '新闻动态表'}

    news_id = Column(BigInteger, primary_key=True, autoincrement=True, comment='新闻ID')
    title = Column(String(200), nullable=False, comment='标题')
    summary = Column(
        String(500),
        nullable=True,
        server_default=SqlalchemyUtil.get_server_default_null(DataBaseConfig.db_type),
        comment='摘要',
    )
    content = Column(Text, nullable=True, comment='正文（富文本）')
    cover_image = Column(String(200), nullable=True, server_default="''", comment='封面图URL')
    author = Column(String(50), nullable=True, server_default="''", comment='作者')
    status = Column(CHAR(1), nullable=True, server_default='0', comment='状态(0=草稿,1=已发布)')
    view_count = Column(Integer, nullable=True, server_default='0', comment='浏览次数')
    publish_time = Column(DateTime, nullable=True, comment='发布时间')
    create_by = Column(String(64), nullable=True, server_default="''", comment='创建者')
    create_time = Column(DateTime, nullable=True, comment='创建时间', default=datetime.now)
    update_by = Column(String(64), nullable=True, server_default="''", comment='更新者')
    update_time = Column(DateTime, nullable=True, comment='更新时间', onupdate=datetime.now)
    del_flag = Column(CHAR(1), nullable=True, server_default='0', comment='删除标志(0=正常,2=删除)')


class VfRegulation(Base):
    """规章制度表"""

    __tablename__ = 'vf_regulation'
    __table_args__ = {'comment': '规章制度表'}

    reg_id = Column(BigInteger, primary_key=True, autoincrement=True, comment='制度ID')
    title = Column(String(200), nullable=False, comment='标题')
    content = Column(Text, nullable=True, comment='正文（富文本）')
    attachment_url = Column(String(200), nullable=True, server_default="''", comment='附件URL')
    category = Column(String(50), nullable=True, server_default="''", comment='类别')
    sort_order = Column(Integer, nullable=True, server_default='0', comment='排序')
    status = Column(CHAR(1), nullable=True, server_default='0', comment='状态(0=正常,1=停用)')
    create_by = Column(String(64), nullable=True, server_default="''", comment='创建者')
    create_time = Column(DateTime, nullable=True, comment='创建时间', default=datetime.now)
    update_by = Column(String(64), nullable=True, server_default="''", comment='更新者')
    update_time = Column(DateTime, nullable=True, comment='更新时间', onupdate=datetime.now)
    del_flag = Column(CHAR(1), nullable=True, server_default='0', comment='删除标志')


class VfExperimentCategory(Base):
    """实验分类表"""

    __tablename__ = 'vf_experiment_category'
    __table_args__ = {'comment': '虚拟实验分类表'}

    category_id = Column(BigInteger, primary_key=True, autoincrement=True, comment='分类ID')
    category_name = Column(String(100), nullable=False, comment='分类名称')
    parent_id = Column(BigInteger, nullable=True, server_default='0', comment='父分类ID(0=根节点)')
    icon = Column(String(100), nullable=True, server_default="''", comment='图标')
    sort_order = Column(Integer, nullable=True, server_default='0', comment='排序')
    status = Column(CHAR(1), nullable=True, server_default='0', comment='状态(0=正常,1=停用)')


class VfExperiment(Base):
    """虚拟仿真实验表"""

    __tablename__ = 'vf_experiment'
    __table_args__ = {'comment': '虚拟仿真实验表'}

    exp_id = Column(BigInteger, primary_key=True, autoincrement=True, comment='实验ID')
    exp_name = Column(String(200), nullable=False, comment='实验名称')
    category_id = Column(
        BigInteger,
        nullable=True,
        server_default=SqlalchemyUtil.get_server_default_null(DataBaseConfig.db_type, False),
        comment='分类ID',
    )
    exp_type = Column(String(10), nullable=True, server_default='web', comment='类型(web/exe)')
    launch_url = Column(String(500), nullable=True, server_default="''", comment='启动地址')
    cover_image = Column(String(200), nullable=True, server_default="''", comment='封面图URL')
    description = Column(Text, nullable=True, comment='实验介绍（富文本）')
    env_requirements = Column(Text, nullable=True, comment='环境要求')
    software_requirements = Column(Text, nullable=True, comment='软件要求')
    attachments = Column(Text, nullable=True, comment='附件JSON数组')
    tags = Column(String(200), nullable=True, server_default="''", comment='标签（逗号分隔）')
    status = Column(CHAR(1), nullable=True, server_default='0', comment='状态(0=发布,1=下线)')
    view_count = Column(Integer, nullable=True, server_default='0', comment='查看次数')
    participate_count = Column(Integer, nullable=True, server_default='0', comment='参与人数')
    sort_order = Column(Integer, nullable=True, server_default='0', comment='排序')
    create_by = Column(String(64), nullable=True, server_default="''", comment='创建者')
    create_time = Column(DateTime, nullable=True, comment='创建时间', default=datetime.now)
    update_by = Column(String(64), nullable=True, server_default="''", comment='更新者')
    update_time = Column(DateTime, nullable=True, comment='更新时间', onupdate=datetime.now)
    del_flag = Column(CHAR(1), nullable=True, server_default='0', comment='删除标志')


class VfExperimentParticipation(Base):
    """实验参与记录表"""

    __tablename__ = 'vf_experiment_participation'
    __table_args__ = {'comment': '实验参与记录表'}

    participation_id = Column(BigInteger, primary_key=True, autoincrement=True, comment='参与ID')
    user_id = Column(BigInteger, nullable=False, comment='用户ID')
    exp_id = Column(BigInteger, nullable=False, comment='实验ID')
    start_time = Column(DateTime, nullable=True, comment='开始时间', default=datetime.now)
    end_time = Column(DateTime, nullable=True, comment='结束时间')
    duration_seconds = Column(Integer, nullable=True, server_default='0', comment='持续秒数')
    status = Column(String(10), nullable=True, server_default='started', comment='状态(started/completed)')


class VfCourse(Base):
    """实验课程表"""

    __tablename__ = 'vf_course'
    __table_args__ = {'comment': '实验课程表'}

    course_id = Column(BigInteger, primary_key=True, autoincrement=True, comment='课程ID')
    course_name = Column(String(200), nullable=False, comment='课程名称')
    teacher_id = Column(
        BigInteger,
        nullable=True,
        server_default=SqlalchemyUtil.get_server_default_null(DataBaseConfig.db_type, False),
        comment='主讲教师ID',
    )
    cover_image = Column(String(200), nullable=True, server_default="''", comment='封面图URL')
    description = Column(Text, nullable=True, comment='课程介绍（富文本）')
    category = Column(String(100), nullable=True, server_default="''", comment='课程分类')
    total_sections = Column(Integer, nullable=True, server_default='0', comment='章节数')
    total_resources = Column(Integer, nullable=True, server_default='0', comment='资源数')
    status = Column(CHAR(1), nullable=True, server_default='1', comment='状态(0=发布,1=草稿)')
    enroll_count = Column(Integer, nullable=True, server_default='0', comment='选课人数')
    sort_order = Column(Integer, nullable=True, server_default='0', comment='排序')
    create_by = Column(String(64), nullable=True, server_default="''", comment='创建者')
    create_time = Column(DateTime, nullable=True, comment='创建时间', default=datetime.now)
    update_by = Column(String(64), nullable=True, server_default="''", comment='更新者')
    update_time = Column(DateTime, nullable=True, comment='更新时间', onupdate=datetime.now)
    del_flag = Column(CHAR(1), nullable=True, server_default='0', comment='删除标志')


class VfCourseSection(Base):
    """课程章节表"""

    __tablename__ = 'vf_course_section'
    __table_args__ = {'comment': '课程章节表'}

    section_id = Column(BigInteger, primary_key=True, autoincrement=True, comment='章节ID')
    course_id = Column(BigInteger, nullable=False, comment='课程ID')
    parent_id = Column(BigInteger, nullable=True, server_default='0', comment='父章节ID(0=一级章节)')
    title = Column(String(200), nullable=False, comment='章节标题')
    sort_order = Column(Integer, nullable=True, server_default='0', comment='排序')
    section_type = Column(String(10), nullable=True, server_default='section', comment='类型(chapter/section)')
    description = Column(String(500), nullable=True, server_default="''", comment='描述')


class VfCourseEnrollment(Base):
    """课程选课记录表"""

    __tablename__ = 'vf_course_enrollment'
    __table_args__ = {'comment': '选课记录表'}

    enrollment_id = Column(BigInteger, primary_key=True, autoincrement=True, comment='选课ID')
    user_id = Column(BigInteger, nullable=False, comment='用户ID')
    course_id = Column(BigInteger, nullable=False, comment='课程ID')
    enroll_time = Column(DateTime, nullable=True, comment='选课时间', default=datetime.now)
    status = Column(CHAR(1), nullable=True, server_default='0', comment='状态(0=学习中,1=已完成)')


class VfLearningProgress(Base):
    """学习进度表"""

    __tablename__ = 'vf_learning_progress'
    __table_args__ = {'comment': '学习进度表'}

    progress_id = Column(BigInteger, primary_key=True, autoincrement=True, comment='进度ID')
    user_id = Column(BigInteger, nullable=False, comment='用户ID')
    course_id = Column(BigInteger, nullable=False, comment='课程ID')
    section_id = Column(BigInteger, nullable=False, comment='章节ID')
    resource_id = Column(
        BigInteger,
        nullable=True,
        server_default=SqlalchemyUtil.get_server_default_null(DataBaseConfig.db_type, False),
        comment='资源ID',
    )
    last_position = Column(Integer, nullable=True, server_default='0', comment='上次播放位置（秒）')
    completed = Column(CHAR(1), nullable=True, server_default='0', comment='是否完成(0=否,1=是)')
    update_time = Column(DateTime, nullable=True, comment='更新时间', onupdate=datetime.now, default=datetime.now)


class VfResourceCategory(Base):
    """资源分类表"""

    __tablename__ = 'vf_resource_category'
    __table_args__ = {'comment': '资源分类表'}

    category_id = Column(BigInteger, primary_key=True, autoincrement=True, comment='分类ID')
    category_name = Column(String(100), nullable=False, comment='分类名称')
    parent_id = Column(BigInteger, nullable=True, server_default='0', comment='父分类ID')
    sort_order = Column(Integer, nullable=True, server_default='0', comment='排序')
    status = Column(CHAR(1), nullable=True, server_default='0', comment='状态(0=正常,1=停用)')


class VfResource(Base):
    """教学资源表"""

    __tablename__ = 'vf_resource'
    __table_args__ = {'comment': '教学资源表'}

    resource_id = Column(BigInteger, primary_key=True, autoincrement=True, comment='资源ID')
    resource_name = Column(String(200), nullable=False, comment='资源名称')
    resource_type = Column(String(10), nullable=True, server_default='doc', comment='类型(pdf/video/audio/image/doc)')
    file_url = Column(String(500), nullable=True, server_default="''", comment='文件URL')
    cover_image = Column(String(200), nullable=True, server_default="''", comment='封面图URL')
    description = Column(String(500), nullable=True, server_default="''", comment='描述')
    file_size = Column(BigInteger, nullable=True, server_default='0', comment='文件大小（字节）')
    duration = Column(Integer, nullable=True, server_default='0', comment='时长（秒，视频/音频）')
    category_id = Column(
        BigInteger,
        nullable=True,
        server_default=SqlalchemyUtil.get_server_default_null(DataBaseConfig.db_type, False),
        comment='资源分类ID',
    )
    course_id = Column(
        BigInteger,
        nullable=True,
        server_default=SqlalchemyUtil.get_server_default_null(DataBaseConfig.db_type, False),
        comment='关联课程ID',
    )
    section_id = Column(
        BigInteger,
        nullable=True,
        server_default=SqlalchemyUtil.get_server_default_null(DataBaseConfig.db_type, False),
        comment='关联章节ID',
    )
    allow_download = Column(CHAR(1), nullable=True, server_default='0', comment='允许下载(0=是,1=否)')
    download_count = Column(Integer, nullable=True, server_default='0', comment='下载次数')
    view_count = Column(Integer, nullable=True, server_default='0', comment='查看次数')
    status = Column(CHAR(1), nullable=True, server_default='0', comment='状态(0=正常,1=停用)')
    create_by = Column(String(64), nullable=True, server_default="''", comment='创建者')
    create_time = Column(DateTime, nullable=True, comment='创建时间', default=datetime.now)
    update_by = Column(String(64), nullable=True, server_default="''", comment='更新者')
    update_time = Column(DateTime, nullable=True, comment='更新时间', onupdate=datetime.now)
    del_flag = Column(CHAR(1), nullable=True, server_default='0', comment='删除标志')


class VfSectionExperiment(Base):
    """章节-实验关联表"""

    __tablename__ = 'vf_section_experiment'
    __table_args__ = {'comment': '章节-实验关联表'}

    id = Column(BigInteger, primary_key=True, autoincrement=True, comment='ID')
    section_id = Column(BigInteger, nullable=False, comment='章节ID')
    exp_id = Column(BigInteger, nullable=False, comment='实验ID')
    sort_order = Column(Integer, nullable=True, server_default='0', comment='排序')


class VfSectionResource(Base):
    """章节-资源关联表"""

    __tablename__ = 'vf_section_resource'
    __table_args__ = {'comment': '章节-资源关联表'}

    id = Column(BigInteger, primary_key=True, autoincrement=True, comment='ID')
    section_id = Column(BigInteger, nullable=False, comment='章节ID')
    resource_id = Column(BigInteger, nullable=False, comment='资源ID')
    sort_order = Column(Integer, nullable=True, server_default='0', comment='排序')


class VfStudentProfile(Base):
    """学生扩展信息表"""

    __tablename__ = 'vf_student_profile'
    __table_args__ = {'comment': '学生扩展信息表'}

    profile_id = Column(BigInteger, primary_key=True, autoincrement=True, comment='ID')
    user_id = Column(BigInteger, nullable=False, unique=True, comment='sys_user.user_id')
    student_no = Column(String(30), nullable=True, server_default="''", comment='学号')
    class_name = Column(String(100), nullable=True, server_default="''", comment='班级')
    major = Column(String(100), nullable=True, server_default="''", comment='专业')
    college = Column(String(100), nullable=True, server_default="''", comment='学院')
    grade = Column(String(20), nullable=True, server_default="''", comment='年级')
    enroll_year = Column(Integer, nullable=True, comment='入学年份')


class VfTeacherProfile(Base):
    """教师扩展信息表"""

    __tablename__ = 'vf_teacher_profile'
    __table_args__ = {'comment': '教师扩展信息表'}

    profile_id = Column(BigInteger, primary_key=True, autoincrement=True, comment='ID')
    user_id = Column(BigInteger, nullable=False, unique=True, comment='sys_user.user_id')
    teacher_no = Column(String(30), nullable=True, server_default="''", comment='工号')
    college = Column(String(100), nullable=True, server_default="''", comment='学院')
    department = Column(String(100), nullable=True, server_default="''", comment='系部/教研室')
    title = Column(String(50), nullable=True, server_default="''", comment='职称')
    introduction = Column(Text, nullable=True, comment='简介')
    avatar_url = Column(String(200), nullable=True, server_default="''", comment='头像URL')
