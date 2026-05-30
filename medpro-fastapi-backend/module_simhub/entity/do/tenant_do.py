"""
多租户 SAAS — 租户相关数据库模型
表前缀: vf_tenant*
"""
from datetime import datetime

from sqlalchemy import CHAR, BigInteger, Column, DateTime, String, Text, UniqueConstraint

from config.database import Base


class VfTenant(Base):
    """学校/机构租户表"""

    __tablename__ = 'vf_tenant'
    __table_args__ = {'comment': '学校/机构租户表'}

    tenant_id = Column(BigInteger, primary_key=True, autoincrement=True, comment='租户ID')
    tenant_code = Column(String(50), nullable=False, unique=True, comment='租户编码（如：hzsf，用于子域名等）')
    tenant_name = Column(String(200), nullable=False, comment='机构名称（如：杭州师范大学）')
    subdomain = Column(String(100), nullable=True, comment='子域名前缀（如：hzsf），NULL 表示未配置')
    logo_url = Column(String(200), nullable=True, server_default="''", comment='Logo 图片 URL')
    theme_config = Column(Text, nullable=True, comment='主题配置 JSON（颜色/字体等）')
    contact_email = Column(String(100), nullable=True, server_default="''", comment='联系邮箱')
    contact_phone = Column(String(50), nullable=True, server_default="''", comment='联系电话')
    address = Column(String(300), nullable=True, server_default="''", comment='学校地址')
    status = Column(CHAR(1), nullable=True, server_default='0', comment='状态(0=正常,1=停用)')
    create_by = Column(String(64), nullable=True, server_default="''", comment='创建者')
    create_time = Column(DateTime, nullable=True, comment='创建时间', default=datetime.now)
    update_by = Column(String(64), nullable=True, server_default="''", comment='更新者')
    update_time = Column(DateTime, nullable=True, comment='更新时间', onupdate=datetime.now)
    remark = Column(String(500), nullable=True, server_default="''", comment='备注')


class VfTenantContentGrant(Base):
    """平台内容授权给学校使用的关联表"""

    __tablename__ = 'vf_tenant_content_grant'
    __table_args__ = (
        UniqueConstraint('tenant_id', 'content_type', 'content_id', name='uq_tenant_content'),
        {'comment': '平台内容授权给学校表'},
    )

    grant_id = Column(BigInteger, primary_key=True, autoincrement=True, comment='授权ID')
    tenant_id = Column(BigInteger, nullable=False, comment='被授权学校租户ID')
    content_type = Column(
        String(20),
        nullable=False,
        comment='内容类型(course/experiment/resource/sim_system)',
    )
    content_id = Column(BigInteger, nullable=False, comment='内容ID（对应各业务表主键）')
    granted_by = Column(String(64), nullable=True, server_default="''", comment='授权操作者（admin账号）')
    grant_time = Column(DateTime, nullable=True, comment='授权时间', default=datetime.now)
    status = Column(CHAR(1), nullable=True, server_default='0', comment='状态(0=有效,1=已撤销)')
