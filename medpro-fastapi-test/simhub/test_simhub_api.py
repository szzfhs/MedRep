"""
SimHub 后端接口联调测试
覆盖范围：
  - 门户公开接口（无需认证）
  - 管理员接口（中心/新闻/规章/实验/课程/资源的 CRUD）
  - 认证用户接口（个人档案）

运行方式（在 medpro-fastapi-test 目录下）：
  pytest simhub/test_simhub_api.py -v
"""
from __future__ import annotations

import pytest
import requests

from common.config import Config

BASE = Config.backend_url  # http://localhost:9099
ADMIN_USER = 'admin'
ADMIN_PASS = 'admin123'


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture(scope='module')
def admin_token() -> str:
    """获取 admin 用户 token，整个模块共用一次登录。"""
    resp = requests.post(
        f'{BASE}/login',
        data={'username': ADMIN_USER, 'password': ADMIN_PASS},
        headers={'Content-Type': 'application/x-www-form-urlencoded'},
        timeout=10,
    )
    assert resp.status_code == 200, f'登录失败: {resp.text}'
    body = resp.json()
    # token 在根级别，data 字段可能是字符串而非 dict
    token = body.get('token')
    if not token:
        data_field = body.get('data')
        if isinstance(data_field, dict):
            token = data_field.get('token')
    assert token, f'未获取到 token: {body}'
    return token


@pytest.fixture(scope='module')
def auth_headers(admin_token: str) -> dict[str, str]:
    return {'Authorization': f'Bearer {admin_token}'}


# ---------------------------------------------------------------------------
# 辅助函数
# ---------------------------------------------------------------------------


def _ok(resp: requests.Response) -> dict:
    """断言 HTTP 200 且 code == 200，返回响应数据。"""
    assert resp.status_code == 200, f'HTTP {resp.status_code}: {resp.text[:200]}'
    body = resp.json()
    assert body.get('code') == 200, f'业务错误: {body}'
    return body


# ===========================================================================
# 一、门户公开接口（无需 token）
# ===========================================================================


class TestPortalPublicAPI:
    """GET /simhub/portal/… 均为公开接口，无需登录。"""

    def test_portal_center(self) -> None:
        """获取中心简介。"""
        resp = requests.get(f'{BASE}/simhub/portal/center', timeout=10)
        _ok(resp)

    def test_portal_news_list(self) -> None:
        """新闻列表分页。"""
        resp = requests.get(f'{BASE}/simhub/portal/news', params={'pageNum': 1, 'pageSize': 10}, timeout=10)
        body = _ok(resp)
        # 存在 rows 或 data 字段即可
        assert 'rows' in body or 'data' in body

    def test_portal_news_detail(self) -> None:
        """新闻详情（使用已初始化的 news_id=1）。"""
        resp = requests.get(f'{BASE}/simhub/portal/news/1', timeout=10)
        _ok(resp)

    def test_portal_regulation_list(self) -> None:
        """规章制度列表。"""
        resp = requests.get(f'{BASE}/simhub/portal/regulation', params={'pageNum': 1, 'pageSize': 10}, timeout=10)
        _ok(resp)

    def test_portal_experiment_list(self) -> None:
        """门户实验列表（路径：/simhub/portal/experiment）。"""
        resp = requests.get(f'{BASE}/simhub/portal/experiment', params={'pageNum': 1, 'pageSize': 10}, timeout=10)
        _ok(resp)

    def test_portal_experiment_detail(self) -> None:
        """实验详情（使用已初始化的 exp_id=1）。"""
        resp = requests.get(f'{BASE}/simhub/portal/experiment/1', timeout=10)
        _ok(resp)

    def test_portal_course_list(self) -> None:
        """门户课程列表（路径：/simhub/portal/course）。"""
        resp = requests.get(f'{BASE}/simhub/portal/course', params={'pageNum': 1, 'pageSize': 10}, timeout=10)
        _ok(resp)

    def test_portal_course_detail(self) -> None:
        """课程详情（使用已初始化的 course_id=1）。"""
        resp = requests.get(f'{BASE}/simhub/portal/course/1', timeout=10)
        _ok(resp)

    def test_portal_category_tree(self) -> None:
        """实验分类树（路径：/simhub/portal/experiment/categories）。"""
        resp = requests.get(f'{BASE}/simhub/portal/experiment/categories', timeout=10)
        body = _ok(resp)
        # 分类树不应为空（已初始化 7 个分类）
        data = body.get('data') or []
        assert len(data) >= 1, '分类树应至少有一个根节点'

    def test_portal_resource_list(self) -> None:
        """门户资源列表（路径：/simhub/portal/resource）。"""
        resp = requests.get(f'{BASE}/simhub/portal/resource', params={'pageNum': 1, 'pageSize': 10}, timeout=10)
        _ok(resp)


# ===========================================================================
# 二、中心简介管理（需要 simhub:center:query / edit）
# ===========================================================================


class TestCenterAPI:
    def test_get_center_info(self, auth_headers: dict) -> None:
        """GET /simhub/center 获取中心简介。"""
        resp = requests.get(f'{BASE}/simhub/center', headers=auth_headers, timeout=10)
        _ok(resp)

    def test_update_center_info(self, auth_headers: dict) -> None:
        """PUT /simhub/center 更新中心简介。"""
        payload = {
            'centerName': '虚拟仿真实验中心（测试更新）',
            'centerSlogan': '测试宣传语',
        }
        resp = requests.put(f'{BASE}/simhub/center', json=payload, headers=auth_headers, timeout=10)
        _ok(resp)


# ===========================================================================
# 三、新闻动态管理 CRUD
# ===========================================================================


class TestNewsAPI:
    created_news_id: int | None = None

    def test_list_news(self, auth_headers: dict) -> None:
        """GET /simhub/news/list 查询新闻列表。"""
        resp = requests.get(f'{BASE}/simhub/news/list', params={'pageNum': 1, 'pageSize': 10},
                            headers=auth_headers, timeout=10)
        _ok(resp)

    def test_add_news(self, auth_headers: dict) -> None:
        """POST /simhub/news 新增新闻。"""
        payload = {
            'title': 'pytest 自动化测试新闻',
            'summary': '接口联调测试用',
            'content': '<p>接口联调验收</p>',
            'status': '0',
        }
        resp = requests.post(f'{BASE}/simhub/news', json=payload, headers=auth_headers, timeout=10)
        _ok(resp)

    def test_get_news_detail(self, auth_headers: dict) -> None:
        """GET /simhub/news/{id} 查询新闻详情（已初始化 id=1）。"""
        resp = requests.get(f'{BASE}/simhub/news/1', headers=auth_headers, timeout=10)
        _ok(resp)

    def test_edit_news(self, auth_headers: dict) -> None:
        """PUT /simhub/news 修改新闻。"""
        payload = {'newsId': 1, 'title': '修改后的标题', 'status': '1'}
        resp = requests.put(f'{BASE}/simhub/news', json=payload, headers=auth_headers, timeout=10)
        _ok(resp)


# ===========================================================================
# 四、规章制度管理 CRUD
# ===========================================================================


class TestRegulationAPI:
    def test_list_regulation(self, auth_headers: dict) -> None:
        resp = requests.get(f'{BASE}/simhub/regulation/list',
                            params={'pageNum': 1, 'pageSize': 10}, headers=auth_headers, timeout=10)
        _ok(resp)

    def test_add_regulation(self, auth_headers: dict) -> None:
        payload = {'title': '测试制度', 'content': '<p>pytest 测试内容</p>', 'status': '0'}
        resp = requests.post(f'{BASE}/simhub/regulation', json=payload, headers=auth_headers, timeout=10)
        _ok(resp)


# ===========================================================================
# 五、实验管理 CRUD
# ===========================================================================


class TestExperimentAPI:
    def test_get_category_tree(self, auth_headers: dict) -> None:
        """GET /simhub/experiment/category/tree。"""
        resp = requests.get(f'{BASE}/simhub/experiment/category/tree', headers=auth_headers, timeout=10)
        body = _ok(resp)
        data = body.get('data') or []
        assert len(data) >= 1

    def test_list_experiments(self, auth_headers: dict) -> None:
        resp = requests.get(f'{BASE}/simhub/experiment/list',
                            params={'pageNum': 1, 'pageSize': 10}, headers=auth_headers, timeout=10)
        _ok(resp)

    def test_add_experiment(self, auth_headers: dict) -> None:
        payload = {
            'expName': 'pytest 测试实验',
            'categoryId': 1,
            'expType': 'web',
            'status': '0',
        }
        resp = requests.post(f'{BASE}/simhub/experiment', json=payload, headers=auth_headers, timeout=10)
        _ok(resp)

    def test_get_experiment_detail(self, auth_headers: dict) -> None:
        resp = requests.get(f'{BASE}/simhub/experiment/1', headers=auth_headers, timeout=10)
        _ok(resp)

    def test_edit_experiment(self, auth_headers: dict) -> None:
        payload = {'expId': 1, 'expName': '心肺复苏（CPR）—已修改'}
        resp = requests.put(f'{BASE}/simhub/experiment', json=payload, headers=auth_headers, timeout=10)
        _ok(resp)


# ===========================================================================
# 六、课程管理 CRUD
# ===========================================================================


class TestCourseAPI:
    def test_list_courses(self, auth_headers: dict) -> None:
        resp = requests.get(f'{BASE}/simhub/course/list',
                            params={'pageNum': 1, 'pageSize': 10}, headers=auth_headers, timeout=10)
        _ok(resp)

    def test_get_course_detail(self, auth_headers: dict) -> None:
        # GET /{course_id} — 需要在 /list 路由之后注册，id=1 已存在
        resp = requests.get(f'{BASE}/simhub/course/1', headers=auth_headers, timeout=10)
        _ok(resp)

    def test_add_course(self, auth_headers: dict) -> None:
        payload = {
            'courseName': 'pytest 测试课程',
            'description': '<p>接口联调测试课程</p>',
            'category': '临床技能',
            'status': '1',
        }
        resp = requests.post(f'{BASE}/simhub/course', json=payload, headers=auth_headers, timeout=10)
        _ok(resp)

    def test_edit_course(self, auth_headers: dict) -> None:
        payload = {'courseId': 1, 'courseName': '外科基本技能训练（更新）', 'status': '0'}
        resp = requests.put(f'{BASE}/simhub/course', json=payload, headers=auth_headers, timeout=10)
        _ok(resp)


# ===========================================================================
# 七、资源管理 CRUD
# ===========================================================================


class TestResourceAPI:
    def test_list_resources(self, auth_headers: dict) -> None:
        resp = requests.get(f'{BASE}/simhub/resource/list',
                            params={'pageNum': 1, 'pageSize': 10}, headers=auth_headers, timeout=10)
        _ok(resp)

    def test_add_resource(self, auth_headers: dict) -> None:
        payload = {
            'resourceName': 'pytest 测试资源',
            'resourceType': 'doc',
            'status': '0',
        }
        resp = requests.post(f'{BASE}/simhub/resource', json=payload, headers=auth_headers, timeout=10)
        _ok(resp)


# ===========================================================================
# 八、个人档案（认证用户接口）
# ===========================================================================


class TestProfileAPI:
    def test_get_student_profile(self, auth_headers: dict) -> None:
        """GET /simhub/profile/student 查询学生档案（admin 可能无记录，返回 200 即可）。"""
        resp = requests.get(f'{BASE}/simhub/profile/student', headers=auth_headers, timeout=10)
        # 无档案记录时返回 200 + data=null 也属合法
        assert resp.status_code == 200

    def test_get_teacher_profile(self, auth_headers: dict) -> None:
        """GET /simhub/profile/teacher。"""
        resp = requests.get(f'{BASE}/simhub/profile/teacher', headers=auth_headers, timeout=10)
        assert resp.status_code == 200


# ===========================================================================
# 九、认证边界检查
# ===========================================================================


class TestAuthGuard:
    def test_center_api_requires_auth(self) -> None:
        """未携带 token 访问受认证接口，HTTP=200 但业务 code=401。"""
        resp = requests.get(f'{BASE}/simhub/center', timeout=10)
        assert resp.status_code == 200
        body = resp.json()
        assert body.get('code') == 401, f'期望业务 code=401，实际: {body}'

    def test_news_list_requires_auth(self) -> None:
        """未携带 token 访问新闻管理接口，HTTP=200 但业务 code=401。"""
        resp = requests.get(f'{BASE}/simhub/news/list', timeout=10)
        assert resp.status_code == 200
        body = resp.json()
        assert body.get('code') == 401, f'期望业务 code=401，实际: {body}'
