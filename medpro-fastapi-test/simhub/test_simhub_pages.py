"""
SimHub 管理后台 — 页面功能冒烟测试（Phase 2 闭环验收）

测试策略：
  - 通过 API 直接完整走通每个页面的增删改查流程（与页面调用的 API 完全一致）
  - 同时验证 Vite 前端代理 /dev-api → 9099 后端可正常转发
  - 额外验证后端 /getRouters 返回 SimHub 菜单（证明菜单注册正确）

前置条件：
  1. 后端运行在 http://localhost:9099
  2. 管理后台前端运行在 http://localhost:3003（vite dev）
  3. 验证码已禁用
"""

import requests
import pytest

BACKEND = 'http://localhost:9099'
FRONTEND = 'http://localhost:3003'  # vite dev server (proxy /dev-api -> BACKEND)


# ─────────────────────────────────────────────
# 登录工具
# ─────────────────────────────────────────────

def _do_login(base: str = BACKEND) -> str:
    resp = requests.post(
        f'{base}/login',
        data={'username': 'admin', 'password': 'admin123'},
        headers={'Content-Type': 'application/x-www-form-urlencoded'},
        timeout=10,
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body.get('code') == 200, f'Login failed: {body}'
    data = body.get('data') or {}
    token = data.get('token') if isinstance(data, dict) else None
    if not token:
        token = body.get('token')
    assert token, f'Token not found: {body}'
    return token


@pytest.fixture(scope='module')
def admin_token():
    return _do_login()


@pytest.fixture(scope='module')
def hdr(admin_token):
    return {'Authorization': f'Bearer {admin_token}'}


# ─────────────────────────────────────────────
# 旧的 Playwright make_authed_page 占位（保留签名 供后续引用）
# ─────────────────────────────────────────────

async def make_authed_page(playwright, token):
    """占位：Playwright 方式创建页面（需要 Chromium）"""
    raise NotImplementedError("Chromium not yet installed; use API smoke tests instead")
    pass  # placeholder


# ─────────────────────────────────────────────────────
#  T1  Vite 前端代理验证（页面宿主环境）
# ─────────────────────────────────────────────────────

class TestFrontendProxy:
    def test_frontend_serves_html(self):
        """管理后台前端 HTTP 200 且返回 HTML"""
        resp = requests.get(FRONTEND, timeout=10)
        assert resp.status_code == 200
        assert 'text/html' in resp.headers.get('content-type', '')

    def test_proxy_login(self):
        """通过 /dev-api 代理登录 → 验证代理链路正常"""
        resp = requests.post(
            f'{FRONTEND}/dev-api/login',
            data={'username': 'admin', 'password': 'admin123'},
            headers={'Content-Type': 'application/x-www-form-urlencoded'},
            timeout=10,
        )
        assert resp.status_code == 200
        assert resp.json().get('code') == 200

    def test_proxy_getrouters_has_simhub(self, hdr):
        """通过 /dev-api 代理获取路由表 → 含 simhub 菜单"""
        resp = requests.get(f'{FRONTEND}/dev-api/getRouters', headers=hdr, timeout=10)
        assert resp.status_code == 200
        body = resp.json()
        assert body.get('code') == 200
        routes_str = str(body.get('data', []))
        assert 'simhub' in routes_str.lower(), 'SimHub 路由未出现在动态路由表'


# ─────────────────────────────────────────────────────
#  T2  菜单接口确认
# ─────────────────────────────────────────────────────

class TestMenuSmoke:
    def test_simhub_menus_registered(self, hdr):
        """sys_menu 中包含足够的 SimHub 菜单条目"""
        resp = requests.get(f'{BACKEND}/system/menu/list', headers=hdr, timeout=10)
        assert resp.status_code == 200
        names = [m.get('menuName', '') for m in resp.json().get('data', [])]
        simhub = [n for n in names if any(k in n for k in ('SimHub', 'simhub', '中心简介', '新闻动态', '规章制度', '实验管理', '课程管理', '资源管理'))]
        assert len(simhub) >= 7, f'SimHub 菜单条目不足，当前: {simhub}'


# ─────────────────────────────────────────────────────
#  T3  中心简介：查 / 改
# ─────────────────────────────────────────────────────

class TestCenterSmoke:
    def test_read(self, hdr):
        resp = requests.get(f'{BACKEND}/simhub/center', headers=hdr, timeout=10)
        assert resp.status_code == 200
        assert resp.json().get('code') == 200

    def test_update(self, hdr):
        payload = {'centerName': '虚拟仿真实验中心（冒烟测试）', 'centerSlogan': '赋能医学教育'}
        resp = requests.put(f'{BACKEND}/simhub/center', json=payload, headers=hdr, timeout=10)
        assert resp.status_code == 200
        assert resp.json().get('code') == 200


# ─────────────────────────────────────────────────────
#  T4  新闻动态：CRUD 完整流程
# ─────────────────────────────────────────────────────

class TestNewsSmoke:
    _news_id = None

    def test_list(self, hdr):
        resp = requests.get(f'{BACKEND}/simhub/news/list', params={'pageNum': 1, 'pageSize': 10}, headers=hdr, timeout=10)
        assert resp.status_code == 200
        assert resp.json().get('code') == 200

    def test_add(self, hdr):
        payload = {'title': '冒烟新闻', 'summary': 'smoke', 'content': '<p>test</p>', 'status': '0'}
        assert requests.post(f'{BACKEND}/simhub/news', json=payload, headers=hdr, timeout=10).json().get('code') == 200
        # rows 在响应根级（非 data.rows）
        body = requests.get(f'{BACKEND}/simhub/news/list', params={'pageNum': 1, 'pageSize': 100}, headers=hdr, timeout=10).json()
        rows = body.get('rows', [])
        matched = [r for r in rows if '冒烟新闻' in r.get('title', '')]
        assert matched, f'新增后在列表中找不到记录，全量rows: {[r.get("title") for r in rows]}'
        TestNewsSmoke._news_id = matched[-1]['news_id']

    def test_edit(self, hdr):
        if not TestNewsSmoke._news_id:
            pytest.skip('news_id not set')
        resp = requests.put(f'{BACKEND}/simhub/news', json={'newsId': TestNewsSmoke._news_id, 'title': '冒烟新闻（改）', 'status': '1'}, headers=hdr, timeout=10)
        assert resp.json().get('code') == 200

    def test_delete(self, hdr):
        if not TestNewsSmoke._news_id:
            pytest.skip('news_id not set')
        resp = requests.delete(f'{BACKEND}/simhub/news/{TestNewsSmoke._news_id}', headers=hdr, timeout=10)
        assert resp.json().get('code') == 200


# ─────────────────────────────────────────────────────
#  T5  规章制度：CRUD
# ─────────────────────────────────────────────────────

class TestRegulationSmoke:
    _reg_id = None

    def test_list(self, hdr):
        resp = requests.get(f'{BACKEND}/simhub/regulation/list', params={'pageNum': 1, 'pageSize': 10}, headers=hdr, timeout=10)
        assert resp.json().get('code') == 200

    def test_add(self, hdr):
        payload = {'title': '冒烟制度', 'content': '<p>test</p>', 'category': '管理规定', 'publishDate': '2026-04-04', 'status': '0'}
        assert requests.post(f'{BACKEND}/simhub/regulation', json=payload, headers=hdr, timeout=10).json().get('code') == 200
        body = requests.get(f'{BACKEND}/simhub/regulation/list', params={'pageNum': 1, 'pageSize': 100}, headers=hdr, timeout=10).json()
        rows = body.get('rows', [])
        matched = [r for r in rows if '冒烟制度' in r.get('title', '')]
        assert matched, f'新增后找不到记录，全量: {[r.get("title") for r in rows]}'
        r = matched[-1]
        TestRegulationSmoke._reg_id = r.get('reg_id')

    def test_delete(self, hdr):
        if not TestRegulationSmoke._reg_id:
            pytest.skip('reg_id not set')
        assert requests.delete(f'{BACKEND}/simhub/regulation/{TestRegulationSmoke._reg_id}', headers=hdr, timeout=10).json().get('code') == 200


# ─────────────────────────────────────────────────────
#  T6  实验管理：CRUD
# ─────────────────────────────────────────────────────

class TestExperimentSmoke:
    _exp_id = None

    def test_category_tree(self, hdr):
        assert requests.get(f'{BACKEND}/simhub/experiment/category/tree', headers=hdr, timeout=10).json().get('code') == 200

    def test_list(self, hdr):
        assert requests.get(f'{BACKEND}/simhub/experiment/list', params={'pageNum': 1, 'pageSize': 10}, headers=hdr, timeout=10).json().get('code') == 200

    def test_add(self, hdr):
        payload = {'expName': '冒烟实验', 'categoryId': 1, 'expType': 'web', 'description': '<p>test</p>', 'status': '0', 'sortOrder': 99}
        assert requests.post(f'{BACKEND}/simhub/experiment', json=payload, headers=hdr, timeout=10).json().get('code') == 200
        body = requests.get(f'{BACKEND}/simhub/experiment/list', params={'pageNum': 1, 'pageSize': 100}, headers=hdr, timeout=10).json()
        rows = body.get('rows', [])
        matched = [r for r in rows if '冒烟实验' in r.get('exp_name', '')]
        assert matched, f'新增后找不到记录，全量: {[r.get("exp_name") for r in rows]}'
        TestExperimentSmoke._exp_id = matched[-1]['exp_id']

    def test_edit(self, hdr):
        if not TestExperimentSmoke._exp_id:
            pytest.skip('exp_id not set')
        assert requests.put(f'{BACKEND}/simhub/experiment', json={'expId': TestExperimentSmoke._exp_id, 'expName': '冒烟实验（改）', 'status': '1'}, headers=hdr, timeout=10).json().get('code') == 200

    def test_delete(self, hdr):
        if not TestExperimentSmoke._exp_id:
            pytest.skip('exp_id not set')
        assert requests.delete(f'{BACKEND}/simhub/experiment/{TestExperimentSmoke._exp_id}', headers=hdr, timeout=10).json().get('code') == 200


# ─────────────────────────────────────────────────────
#  T7  课程管理：CRUD
# ─────────────────────────────────────────────────────

class TestCourseSmoke:
    _course_id = None

    def test_list(self, hdr):
        assert requests.get(f'{BACKEND}/simhub/course/list', params={'pageNum': 1, 'pageSize': 10}, headers=hdr, timeout=10).json().get('code') == 200

    def test_add(self, hdr):
        payload = {'courseName': '冒烟课程', 'description': '<p>test</p>', 'category': '临床技能', 'status': '0', 'sortOrder': 99}
        assert requests.post(f'{BACKEND}/simhub/course', json=payload, headers=hdr, timeout=10).json().get('code') == 200
        body = requests.get(f'{BACKEND}/simhub/course/list', params={'pageNum': 1, 'pageSize': 100}, headers=hdr, timeout=10).json()
        rows = body.get('rows', [])
        matched = [r for r in rows if '冒烟课程' in r.get('course_name', '')]
        assert matched, f'新增后找不到记录，全量: {[r.get("course_name") for r in rows]}'
        TestCourseSmoke._course_id = matched[-1]['course_id']

    def test_edit(self, hdr):
        if not TestCourseSmoke._course_id:
            pytest.skip('course_id not set')
        assert requests.put(f'{BACKEND}/simhub/course', json={'courseId': TestCourseSmoke._course_id, 'courseName': '冒烟课程（改）'}, headers=hdr, timeout=10).json().get('code') == 200

    def test_delete(self, hdr):
        if not TestCourseSmoke._course_id:
            pytest.skip('course_id not set')
        assert requests.delete(f'{BACKEND}/simhub/course/{TestCourseSmoke._course_id}', headers=hdr, timeout=10).json().get('code') == 200


# ─────────────────────────────────────────────────────
#  T8  资源管理：CRUD
# ─────────────────────────────────────────────────────

class TestResourceSmoke:
    _resource_id = None

    def test_category_tree(self, hdr):
        assert requests.get(f'{BACKEND}/simhub/resource/category/tree', headers=hdr, timeout=10).json().get('code') == 200

    def test_list(self, hdr):
        assert requests.get(f'{BACKEND}/simhub/resource/list', params={'pageNum': 1, 'pageSize': 10}, headers=hdr, timeout=10).json().get('code') == 200

    def test_add(self, hdr):
        payload = {'resourceName': '冒烟资源', 'resourceType': 'video', 'resourceUrl': 'https://example.com/smoke.mp4', 'status': '0', 'sortOrder': 99}
        assert requests.post(f'{BACKEND}/simhub/resource', json=payload, headers=hdr, timeout=10).json().get('code') == 200
        body = requests.get(f'{BACKEND}/simhub/resource/list', params={'pageNum': 1, 'pageSize': 100}, headers=hdr, timeout=10).json()
        rows = body.get('rows', [])
        matched = [r for r in rows if '冒烟资源' in r.get('resource_name', '')]
        assert matched, f'新增后找不到记录，全量: {[r.get("resource_name") for r in rows]}'
        TestResourceSmoke._resource_id = matched[-1]['resource_id']

    def test_edit(self, hdr):
        if not TestResourceSmoke._resource_id:
            pytest.skip('resource_id not set')
        assert requests.put(f'{BACKEND}/simhub/resource', json={'resourceId': TestResourceSmoke._resource_id, 'resourceName': '冒烟资源（改）'}, headers=hdr, timeout=10).json().get('code') == 200

    def test_delete(self, hdr):
        if not TestResourceSmoke._resource_id:
            pytest.skip('resource_id not set')
        assert requests.delete(f'{BACKEND}/simhub/resource/{TestResourceSmoke._resource_id}', headers=hdr, timeout=10).json().get('code') == 200
