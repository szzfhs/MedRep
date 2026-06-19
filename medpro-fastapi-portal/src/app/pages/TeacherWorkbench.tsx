import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen, FlaskConical, Users, BarChart2, User, Edit3,
  Save, X, LogOut, ChevronRight, CheckCircle, Eye,
  TrendingUp, Star, Clock, FileText, Settings,
  Award, Play, Layers, NotebookPen,
} from 'lucide-react';
import { getTeacherCourses, getTeacherDashboard, type Course } from '../../api/course';
import { LessonPrepManager } from './teacher/LessonPrepManager';

// ─── Types ──────────────────────────────────────────────────────

interface DashboardData {
  courseCount: number;
  studentCount: number;
  expCount: number;
  recentCourses: Array<{
    courseId: number;
    courseName: string;
    status: string;
    enrollCount: number;
    createTime: string | null;
  }>;
}



const TABS = [
  { key: 'overview', label: '教学概览', icon: BarChart2 },
  { key: 'courses', label: '我的课程', icon: BookOpen },
  { key: 'students', label: '学生管理', icon: Users },
  { key: 'lesson-prep', label: '备课管理', icon: NotebookPen },
  { key: 'profile', label: '个人中心', icon: User },
];

// ─── Sub-sections ───────────────────────────────────────────────

function Overview({ dashboard, courses }: { dashboard: DashboardData | null; courses: Course[] }) {
  const stats = [
    { label: '主讲课程', value: dashboard?.courseCount ?? courses.length, icon: BookOpen, color: 'from-[#0B5394] to-[#1E88E5]' },
    { label: '学生总数', value: (dashboard?.studentCount ?? 0).toLocaleString(), icon: Users, color: 'from-[#00695C] to-[#00897B]' },
    { label: '关联实验', value: dashboard?.expCount ?? 0, icon: FlaskConical, color: 'from-[#6D28D9] to-[#7C3AED]' },
    { label: '我的课程', value: dashboard?.courseCount ?? courses.length, icon: TrendingUp, color: 'from-[#B45309] to-[#D97706]' },
  ];
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-[#E2E8F0] flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center flex-shrink-0 shadow-md`}>
              <s.icon size={20} className="text-white" />
            </div>
            <div>
              <div className="text-[#1A2332] font-bold text-xl leading-none">{s.value}</div>
              <div className="text-[#64748B] text-xs mt-0.5">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Course enrollment summary + recent courses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#F0F4F8] flex items-center justify-between">
            <h3 className="text-[#1A2332] font-semibold text-sm flex items-center gap-2">
              <BookOpen size={15} className="text-[#0B5394]" /> 课程选课情况
            </h3>
          </div>
          <div className="p-4 space-y-4">
            {courses.length === 0 ? (
              <p className="text-[#94A3B8] text-sm text-center py-4">暂无课程</p>
            ) : courses.slice(0, 4).map(c => (
              <div key={c.courseId} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[#1A2332] text-sm truncate pr-3">{c.courseName}</span>
                  <span className="text-[#0B5394] text-sm font-semibold flex-shrink-0">{(c.enrollCount ?? 0).toLocaleString()}人</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#0B5394] to-[#1E88E5] rounded-full" style={{ width: `${Math.min(100, (c.enrollCount ?? 0) / 10)}%` }} />
                  </div>
                  <span className="text-[#94A3B8] text-xs flex-shrink-0">{c.status === '0' ? '已发布' : '草稿'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent courses */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#F0F4F8]">
            <h3 className="text-[#1A2332] font-semibold text-sm flex items-center gap-2">
              <Award size={15} className="text-[#D97706]" /> 最近更新的课程
            </h3>
          </div>
          <div className="p-4 space-y-2.5">
            {(dashboard?.recentCourses ?? []).slice(0, 5).map((c, i) => (
              <div key={c.courseId} className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#F8FAFC] transition-colors">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  i === 0 ? 'bg-[#FEF3C7] text-[#B45309]' : i === 1 ? 'bg-[#F0F4F8] text-[#475569]' : 'bg-[#F8FAFC] text-[#94A3B8]'
                }`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[#1A2332] text-sm truncate">{c.courseName}</div>
                  <div className="text-[#94A3B8] text-xs">{c.createTime?.slice(0, 10)}</div>
                </div>
                <div className="text-right">
                  <div className="text-[#0B5394] text-sm font-semibold">{c.enrollCount ?? 0}</div>
                  <div className="text-[#94A3B8] text-xs">选课</div>
                </div>
              </div>
            ))}
            {(dashboard?.recentCourses?.length ?? 0) === 0 && (
              <p className="text-[#94A3B8] text-sm text-center py-4">暂无数据</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TeacherCourses({ courses }: { courses: Course[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[#1A2332] font-semibold">主讲课程</h3>
        <Link to="/courses" className="text-xs text-[#0B5394] hover:underline flex items-center gap-1">
          查看全部课程 <ChevronRight size={13} />
        </Link>
      </div>
      {courses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-10 text-center">
          <BookOpen size={32} className="text-[#CBD5E1] mx-auto mb-3" />
          <p className="text-[#94A3B8] text-sm">暂无课程，可通过备课管理新建课程</p>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map(c => (
            <div key={c.courseId} className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row">
                {/* Cover */}
                <div className="sm:w-40 h-36 sm:h-auto flex-shrink-0 overflow-hidden bg-gradient-to-br from-[#0B5394] to-[#1E88E5] flex items-center justify-center">
                  {c.coverImage ? (
                    <img src={c.coverImage} alt={c.courseName} className="w-full h-full object-cover" />
                  ) : (
                    <BookOpen size={40} className="text-white/60" />
                  )}
                </div>
                {/* Info */}
                <div className="flex-1 p-5">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h4 className="text-[#1A2332] font-semibold">{c.courseName}</h4>
                      <p className="text-[#64748B] text-xs mt-0.5">
                        {c.department ?? '—'} · {c.totalSections ?? 0} 章节 · {c.totalHours ?? 0}学时
                      </p>
                    </div>
                    <span className={`flex-shrink-0 px-2.5 py-1 text-xs rounded-full font-medium flex items-center gap-1 ${
                      c.status === '0' ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-[#FFF8E1] text-[#B45309]'
                    }`}>
                      {c.status === '0' ? <><CheckCircle size={10} /> 已发布</> : '草稿'}
                    </span>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { label: '选课人数', value: (c.enrollCount ?? 0).toLocaleString() },
                      { label: '总学时', value: `${c.totalHours ?? 0}` },
                      { label: '评分', value: c.rating ? `${c.rating}★` : '—' },
                    ].map(s => (
                      <div key={s.label} className="text-center bg-[#F8FAFC] rounded-xl py-2">
                        <div className="text-[#1A2332] font-semibold text-sm">{s.value}</div>
                        <div className="text-[#94A3B8] text-xs">{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      to={`/courses/${c.courseId}`}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs border border-[#E2E8F0] text-[#64748B] rounded-xl hover:bg-[#F0F4F8] transition-colors"
                    >
                      <Eye size={13} /> 查看详情
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StudentManagement({ courses }: { courses: Course[] }) {
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const id = selectedCourseId ?? courses[0]?.courseId;
    if (!id) return;
    setLoading(true);
    import('../../api/course').then(({ getTeacherStudents }) => {
      getTeacherStudents(id)
        .then(data => setStudents(data?.list ?? []))
        .catch(() => setStudents([]))
        .finally(() => setLoading(false));
    });
  }, [selectedCourseId, courses]);

  const filtered = students.filter(s =>
    !search || (s.nickName ?? s.userName ?? '').includes(search)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[#1A2332] font-semibold">学生管理</h3>
        <span className="text-[#64748B] text-xs bg-[#F0F4F8] px-3 py-1.5 rounded-full">
          共 {students.length} 位学生
        </span>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索学生姓名..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#0B5394]"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </div>
        <select
          value={selectedCourseId ?? ''}
          onChange={e => setSelectedCourseId(e.target.value ? Number(e.target.value) : null)}
          className="px-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#0B5394]"
        >
          {courses.map(c => (
            <option key={c.courseId} value={c.courseId}>{c.courseName}</option>
          ))}
        </select>
      </div>

      {/* Student table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-[#94A3B8] text-sm">加载中…</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-[#94A3B8] text-sm">暂无学生数据</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                {['学生信息', '选课时间', '状态'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[#64748B] whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={s.enrollmentId} className={`border-b border-[#F0F4F8] hover:bg-[#F8FAFC] transition-colors ${i % 2 ? 'bg-[#FAFBFD]' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0B5394] to-[#1E88E5] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {(s.nickName || s.userName || '?').charAt(0)}
                      </div>
                      <div>
                        <div className="text-[#1A2332] text-sm font-medium">{s.nickName || s.userName}</div>
                        <div className="text-[#94A3B8] text-xs">{s.userName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#94A3B8] text-xs">{s.enrollTime?.slice(0, 10)}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#E8F5E9] text-[#2E7D32]">已选课</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function TeacherProfile({ currentUser }: { currentUser: any }) {
  const [editing, setEditing] = useState(false);
  const displayName = currentUser?.user?.nickName || currentUser?.user?.userName || '教师';
  const [form, setForm] = useState({
    name: displayName,
    email: currentUser?.user?.email || '',
    phone: currentUser?.user?.phonenumber || '',
    department: currentUser?.user?.dept?.deptName || '',
  });

  return (
    <div className="max-w-xl space-y-5">
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00695C] to-[#00897B] flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {displayName.charAt(0)}
          </div>
          <div>
            <h3 className="text-[#1A2332] font-bold text-lg">{displayName}</h3>
            <p className="text-[#64748B] text-sm">{currentUser?.user?.userName}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 bg-[#E0F2F1] text-[#00695C] text-xs rounded-full font-medium">教师</span>
            </div>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className={`ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-colors ${editing ? 'bg-[#F0F4F8] text-[#64748B]' : 'bg-[#E0F2F1] text-[#00695C] hover:bg-[#B2DFDB]'}`}
          >
            {editing ? <><X size={14} /> 取消</> : <><Edit3 size={14} /> 编辑</>}
          </button>
        </div>

        <div className="space-y-4">
          {[
            { label: '姓名', key: 'name' },
            { label: '邮箱', key: 'email' },
            { label: '手机', key: 'phone' },
            { label: '所属部门', key: 'department' },
          ].map(f => (
            <div key={f.key} className="grid grid-cols-3 gap-4 items-center">
              <label className="text-[#64748B] text-sm col-span-1">{f.label}</label>
              {editing ? (
                <input
                  value={form[f.key as keyof typeof form]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  className="col-span-2 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#00897B]"
                />
              ) : (
                <span className="col-span-2 text-[#1A2332] text-sm">{form[f.key as keyof typeof form] || '—'}</span>
              )}
            </div>
          ))}
        </div>

        {editing && (
          <div className="flex gap-3 mt-6">
            <button onClick={() => setEditing(false)} className="flex-1 py-2.5 border border-[#E2E8F0] text-[#64748B] rounded-xl text-sm">取消</button>
            <button
              onClick={() => setEditing(false)}
              className="flex-1 py-2.5 bg-[#00897B] text-white rounded-xl text-sm font-medium hover:bg-[#00796B] flex items-center justify-center gap-2"
            >
              <Save size={14} /> 保存修改
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main workbench ─────────────────────────────────────────────

export function TeacherWorkbench() {
  const [activeTab, setActiveTab] = useState('overview');
  const [courses, setCourses] = useState<Course[]>([]);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    Promise.allSettled([
      getTeacherDashboard().then(setDashboard).catch(() => {}),
      getTeacherCourses({ pageSize: 50 }).then(r => setCourses(r.rows ?? [])).catch(() => {}),
    ]).finally(() => setLoading(false));
  };

  useEffect(() => {
    // Load current user from store
    try {
      const raw = localStorage.getItem('user') || sessionStorage.getItem('user') || '';
      if (raw) setCurrentUser(JSON.parse(raw));
    } catch { /* ignore */ }

    loadData();
  }, []);

  // 切换到概览或课程 tab 时重新拉取数据
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    if (key === 'overview' || key === 'courses') loadData();
  };

  const displayName = currentUser?.user?.nickName || currentUser?.user?.userName || '教师';
  const courseCount = dashboard?.courseCount ?? courses.length;
  const studentCount = dashboard?.studentCount ?? 0;

  const tabContent: Record<string, React.ReactNode> = {
    overview: <Overview dashboard={dashboard} courses={courses} />,
    courses: <TeacherCourses courses={courses} />,
    students: <StudentManagement courses={courses} />,
    'lesson-prep': <LessonPrepManager onPublish={loadData} />,
    profile: <TeacherProfile currentUser={currentUser} />,
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-56 flex-shrink-0 hidden lg:block">
            <div className="sticky top-[80px] space-y-4">
              {/* Profile card */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00695C] to-[#00897B] flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3 shadow-lg">
                  {displayName.charAt(0)}
                </div>
                <h3 className="text-[#1A2332] font-semibold">{displayName}</h3>
                <p className="text-[#64748B] text-xs mt-0.5">{currentUser?.user?.userName}</p>
                <div className="flex justify-center gap-2 mt-2">
                  <span className="px-2 py-0.5 bg-[#E0F2F1] text-[#00695C] text-xs rounded-full">教师</span>
                </div>
                <div className="mt-3 pt-3 border-t border-[#F0F4F8] grid grid-cols-2 gap-2 text-center">
                  <div>
                    <div className="text-[#1A2332] font-semibold text-base">{courseCount}</div>
                    <div className="text-[#94A3B8] text-xs">课程</div>
                  </div>
                  <div>
                    <div className="text-[#1A2332] font-semibold text-base">{studentCount.toLocaleString()}</div>
                    <div className="text-[#94A3B8] text-xs">学生</div>
                  </div>
                </div>
              </div>

              {/* Nav */}
              <nav className="bg-white rounded-2xl border border-[#E2E8F0] p-2">
                {TABS.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => handleTabChange(tab.key)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all mb-0.5 ${
                      activeTab === tab.key
                        ? 'bg-[#00897B] text-white'
                        : 'text-[#475569] hover:bg-[#F0F4F8] hover:text-[#00897B]'
                    }`}
                  >
                    <tab.icon size={16} className="flex-shrink-0" />
                    {tab.label}
                  </button>
                ))}
                <div className="border-t border-[#F0F4F8] mt-2 pt-2">
                  <a
                    href="/"
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-[#94A3B8] hover:bg-[#FFF5F5] hover:text-[#E53935] transition-all"
                  >
                    <LogOut size={16} /> 退出登录
                  </a>
                </div>
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Mobile tabs */}
            <div className="lg:hidden bg-white rounded-2xl border border-[#E2E8F0] p-1 flex gap-1 mb-5 overflow-x-auto">
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    activeTab === tab.key ? 'bg-[#00897B] text-white' : 'text-[#64748B] hover:bg-[#F0F4F8]'
                  }`}
                >
                  <tab.icon size={13} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Page header */}
            <div className="flex items-center gap-2 mb-5">
              <div className="h-5 w-1 rounded-full bg-[#00897B]" />
              <h2 className="text-[#1A2332] font-bold text-lg">
                {TABS.find(t => t.key === activeTab)?.label}
              </h2>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {tabContent[activeTab]}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
