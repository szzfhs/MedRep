import { useState } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen, FlaskConical, Users, BarChart2, User, Edit3,
  Save, X, LogOut, ChevronRight, CheckCircle, Eye,
  TrendingUp, Star, Clock, FileText, Settings,
  Award, Play, Layers,
} from 'lucide-react';
import { courses, experiments } from '../data/mockData';

// ─── Mock teacher data ──────────────────────────────────────────

const TEACHER = {
  name: '李晓华',
  teacherId: 'teacher001',
  title: '副教授',
  department: '生理学教研室',
  college: '基础医学院',
  email: 'lixiaohua@med.edu.cn',
  phone: '139****6666',
  avatar: '李',
  researchArea: '神经生理学、心血管生理学',
};

// Courses this teacher manages
const MY_COURSES = [
  {
    ...courses[1], // 基础生理学实验课程
    enrollCount: 1876,
    completedStudents: 1203,
    avgScore: 87.5,
    pendingReviews: 5,
    status: 'published',
    thisWeekActive: 234,
  },
  {
    ...courses[0], // 人体解剖学虚拟实验课程
    enrollCount: 2341,
    completedStudents: 1890,
    avgScore: 91.2,
    pendingReviews: 2,
    status: 'published',
    thisWeekActive: 312,
  },
  {
    ...courses[2], // 病原微生物学实验
    enrollCount: 1432,
    completedStudents: 876,
    avgScore: 85.3,
    pendingReviews: 8,
    status: 'published',
    thisWeekActive: 178,
  },
];

// Managed experiments (linked to teacher's courses)
const MY_EXPERIMENTS = experiments.slice(0, 5).map((e, i) => ({
  ...e,
  courseTitle: MY_COURSES[i % 3].title,
  participantCount: [456, 389, 512, 298, 423][i],
  avgScore: [88.2, 91.5, 85.4, 93.1, 87.8][i],
  status: 'published',
}));

// Mock students in teacher's courses
const MY_STUDENTS = [
  { id: 1, name: '张小明', studentId: '2022001', college: '基础医学院', enrolledCourses: 2, progress: 82, lastActive: '2025-04-29', avgScore: 91 },
  { id: 2, name: '李雨欣', studentId: '2022045', college: '临床医学院', enrolledCourses: 2, progress: 65, lastActive: '2025-04-28', avgScore: 85 },
  { id: 3, name: '王浩然', studentId: '2022088', college: '基础医学院', enrolledCourses: 1, progress: 93, lastActive: '2025-04-29', avgScore: 94 },
  { id: 4, name: '陈思琪', studentId: '2022103', college: '药学院', enrolledCourses: 2, progress: 40, lastActive: '2025-04-25', avgScore: 78 },
  { id: 5, name: '刘明阳', studentId: '2022156', college: '临床医学院', enrolledCourses: 1, progress: 77, lastActive: '2025-04-27', avgScore: 88 },
  { id: 6, name: '赵静雯', studentId: '2022178', college: '护理学院', enrolledCourses: 3, progress: 55, lastActive: '2025-04-26', avgScore: 82 },
  { id: 7, name: '孙博文', studentId: '2022201', college: '基础医学院', enrolledCourses: 2, progress: 98, lastActive: '2025-04-29', avgScore: 96 },
  { id: 8, name: '周雪梅', studentId: '2022234', college: '临床医学院', enrolledCourses: 1, progress: 30, lastActive: '2025-04-20', avgScore: 72 },
];

const STATS = [
  { label: '主讲课程', value: MY_COURSES.length, icon: BookOpen, color: 'from-[#0B5394] to-[#1E88E5]' },
  { label: '学生总数', value: MY_COURSES.reduce((s, c) => s + c.enrollCount, 0).toLocaleString(), icon: Users, color: 'from-[#00695C] to-[#00897B]' },
  { label: '关联实验', value: MY_EXPERIMENTS.length, icon: FlaskConical, color: 'from-[#6D28D9] to-[#7C3AED]' },
  { label: '本周活跃', value: MY_COURSES.reduce((s, c) => s + c.thisWeekActive, 0), icon: TrendingUp, color: 'from-[#B45309] to-[#D97706]' },
];

const TABS = [
  { key: 'overview', label: '教学概览', icon: BarChart2 },
  { key: 'courses', label: '我的课程', icon: BookOpen },
  { key: 'students', label: '学生管理', icon: Users },
  { key: 'profile', label: '个人中心', icon: User },
];

// ─── Sub-sections ───────────────────────────────────────────────

function Overview() {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(s => (
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

      {/* Course performance + student activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Course enrollment summary */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#F0F4F8] flex items-center justify-between">
            <h3 className="text-[#1A2332] font-semibold text-sm flex items-center gap-2">
              <BookOpen size={15} className="text-[#0B5394]" /> 课程选课情况
            </h3>
          </div>
          <div className="p-4 space-y-4">
            {MY_COURSES.map(c => (
              <div key={c.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[#1A2332] text-sm truncate pr-3">{c.title.substring(0, 16)}…</span>
                  <span className="text-[#0B5394] text-sm font-semibold flex-shrink-0">{c.enrollCount.toLocaleString()}人</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round((c.completedStudents / c.enrollCount) * 100)}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-[#0B5394] to-[#1E88E5] rounded-full"
                    />
                  </div>
                  <span className="text-[#94A3B8] text-xs flex-shrink-0">
                    完成率 {Math.round((c.completedStudents / c.enrollCount) * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top students this week */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#F0F4F8]">
            <h3 className="text-[#1A2332] font-semibold text-sm flex items-center gap-2">
              <Award size={15} className="text-[#D97706]" /> 本周学习活跃学生
            </h3>
          </div>
          <div className="p-4 space-y-2.5">
            {MY_STUDENTS.sort((a, b) => b.progress - a.progress).slice(0, 5).map((s, i) => (
              <div key={s.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#F8FAFC] transition-colors">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  i === 0 ? 'bg-[#FEF3C7] text-[#B45309]' :
                  i === 1 ? 'bg-[#F0F4F8] text-[#475569]' :
                  i === 2 ? 'bg-[#FFF0E6] text-[#C2410C]' :
                  'bg-[#F8FAFC] text-[#94A3B8]'
                }`}>
                  {i + 1}
                </div>
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0B5394] to-[#1E88E5] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {s.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[#1A2332] text-sm">{s.name}</div>
                  <div className="text-[#94A3B8] text-xs">{s.studentId}</div>
                </div>
                <div className="text-right">
                  <div className="text-[#0B5394] text-sm font-semibold">{s.progress}%</div>
                  <div className="text-[#94A3B8] text-xs">完成度</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending items */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
        <h3 className="text-[#1A2332] font-semibold text-sm flex items-center gap-2 mb-4">
          <FileText size={15} className="text-[#E53935]" /> 待处理事项
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {MY_COURSES.map(c => (
            <div key={c.id} className="flex items-center gap-3 bg-[#FFF8E1] border border-[#FDE68A] rounded-xl p-3">
              <div className="w-2 h-2 bg-[#F59E0B] rounded-full flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-[#1A2332] text-sm truncate">{c.title.substring(0, 10)}…</div>
                <div className="text-[#B45309] text-xs">{c.pendingReviews} 份作业待批改</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TeacherCourses() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[#1A2332] font-semibold">主讲课程</h3>
        <Link to="/courses" className="text-xs text-[#0B5394] hover:underline flex items-center gap-1">
          查看全部课程 <ChevronRight size={13} />
        </Link>
      </div>
      <div className="space-y-4">
        {MY_COURSES.map(c => (
          <div key={c.id} className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row">
              {/* Cover */}
              <div className="sm:w-40 h-36 sm:h-auto flex-shrink-0 overflow-hidden">
                <img src={c.image} alt={c.title} className="w-full h-full object-cover" />
              </div>
              {/* Info */}
              <div className="flex-1 p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h4 className="text-[#1A2332] font-semibold">{c.title}</h4>
                    <p className="text-[#64748B] text-xs mt-0.5">{c.department} · {c.chapters} 章节 · {c.totalHours}学时</p>
                  </div>
                  <span className="flex-shrink-0 px-2.5 py-1 bg-[#E8F5E9] text-[#2E7D32] text-xs rounded-full font-medium flex items-center gap-1">
                    <CheckCircle size={10} /> 已发布
                  </span>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {[
                    { label: '选课人数', value: c.enrollCount.toLocaleString() },
                    { label: '完成人数', value: c.completedStudents.toLocaleString() },
                    { label: '平均得分', value: `${c.avgScore}` },
                    { label: '评分', value: `${c.rating}★` },
                  ].map(s => (
                    <div key={s.label} className="text-center bg-[#F8FAFC] rounded-xl py-2">
                      <div className="text-[#1A2332] font-semibold text-sm">{s.value}</div>
                      <div className="text-[#94A3B8] text-xs">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Completion bar */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[#64748B] text-xs flex-shrink-0">完成率</span>
                  <div className="flex-1 h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#00897B] to-[#43A047] rounded-full"
                      style={{ width: `${Math.round((c.completedStudents / c.enrollCount) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[#00897B] text-xs font-medium flex-shrink-0">
                    {Math.round((c.completedStudents / c.enrollCount) * 100)}%
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    to={`/courses/${c.id}`}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs border border-[#E2E8F0] text-[#64748B] rounded-xl hover:bg-[#F0F4F8] transition-colors"
                  >
                    <Eye size={13} /> 查看详情
                  </Link>
                  {c.pendingReviews > 0 && (
                    <button className="flex items-center gap-1.5 px-3 py-2 text-xs bg-[#FFF8E1] text-[#B45309] border border-[#FDE68A] rounded-xl hover:bg-[#FEF3C7] transition-colors">
                      <FileText size={13} /> {c.pendingReviews} 份待批改
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Managed experiments */}
      <div className="mt-6">
        <h3 className="text-[#1A2332] font-semibold mb-4 flex items-center gap-2">
          <FlaskConical size={16} className="text-[#00897B]" /> 关联实验项目
        </h3>
        <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                {['实验名称', '所属课程', '类型', '参与人数', '平均得分', '操作'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[#64748B] whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MY_EXPERIMENTS.map((e, i) => (
                <tr key={e.id} className={`border-b border-[#F0F4F8] hover:bg-[#F8FAFC] transition-colors ${i % 2 ? 'bg-[#FAFBFD]' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="text-[#1A2332] text-sm font-medium max-w-[160px] line-clamp-1">{e.title}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-[#64748B] text-xs max-w-[140px] line-clamp-1">{e.courseTitle}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${e.type === 'WebGL' ? 'bg-[#E3F2FD] text-[#0B5394]' : 'bg-[#EDE9FE] text-[#6D28D9]'}`}>
                      {e.typeLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#1A2332] text-sm font-medium">{e.participantCount}</td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-semibold ${e.avgScore >= 90 ? 'text-[#2E7D32]' : 'text-[#0B5394]'}`}>{e.avgScore}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Link to={`/experiments/${e.id}`} className="text-xs text-[#0B5394] hover:underline flex items-center gap-1">
                      <Eye size={12} /> 查看
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StudentManagement() {
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');

  const filtered = MY_STUDENTS.filter(s =>
    (!search || s.name.includes(search) || s.studentId.includes(search)) &&
    (courseFilter === 'all')
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[#1A2332] font-semibold">学生管理</h3>
        <span className="text-[#64748B] text-xs bg-[#F0F4F8] px-3 py-1.5 rounded-full">
          共 {MY_COURSES.reduce((s, c) => s + c.enrollCount, 0).toLocaleString()} 位学生
        </span>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-xs">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索学生姓名/学号..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#0B5394]"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </div>
        <select
          value={courseFilter}
          onChange={e => setCourseFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#0B5394]"
        >
          <option value="all">所有课程</option>
          {MY_COURSES.map(c => (
            <option key={c.id} value={c.id}>{c.title.substring(0, 12)}…</option>
          ))}
        </select>
      </div>

      {/* Student table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
              {['学生信息', '学院', '选课数', '学习进度', '平均得分', '最近活跃', '状态'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[#64748B] whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => (
              <tr key={s.id} className={`border-b border-[#F0F4F8] hover:bg-[#F8FAFC] transition-colors ${i % 2 ? 'bg-[#FAFBFD]' : ''}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0B5394] to-[#1E88E5] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {s.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-[#1A2332] text-sm font-medium">{s.name}</div>
                      <div className="text-[#94A3B8] text-xs">{s.studentId}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-[#64748B] text-sm">{s.college}</td>
                <td className="px-4 py-3 text-center">
                  <span className="w-6 h-6 rounded-full bg-[#E3F2FD] text-[#0B5394] text-xs font-semibold flex items-center justify-center mx-auto">{s.enrolledCourses}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${s.progress >= 80 ? 'bg-[#43A047]' : s.progress >= 50 ? 'bg-[#1E88E5]' : 'bg-[#FB8C00]'}`}
                        style={{ width: `${s.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-[#64748B]">{s.progress}%</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-sm font-semibold ${s.avgScore >= 90 ? 'text-[#2E7D32]' : s.avgScore >= 80 ? 'text-[#0B5394]' : 'text-[#FB8C00]'}`}>
                    {s.avgScore}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#94A3B8] text-xs">{s.lastActive}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    s.progress >= 80 ? 'bg-[#E8F5E9] text-[#2E7D32]' :
                    s.progress >= 40 ? 'bg-[#E3F2FD] text-[#0B5394]' :
                    'bg-[#FFF8E1] text-[#B45309]'
                  }`}>
                    {s.progress >= 80 ? '良好' : s.progress >= 40 ? '学习中' : '待跟进'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TeacherProfile() {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: TEACHER.name,
    email: TEACHER.email,
    phone: TEACHER.phone,
    department: TEACHER.department,
    researchArea: TEACHER.researchArea,
  });

  return (
    <div className="max-w-xl space-y-5">
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00695C] to-[#00897B] flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {TEACHER.avatar}
          </div>
          <div>
            <h3 className="text-[#1A2332] font-bold text-lg">{TEACHER.name}</h3>
            <p className="text-[#64748B] text-sm">{TEACHER.teacherId}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 bg-[#E0F2F1] text-[#00695C] text-xs rounded-full font-medium">{TEACHER.title}</span>
              <span className="px-2 py-0.5 bg-[#E3F2FD] text-[#0B5394] text-xs rounded-full font-medium">教师</span>
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
            { label: '教研室', key: 'department' },
            { label: '研究方向', key: 'researchArea' },
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
                <span className="col-span-2 text-[#1A2332] text-sm">{form[f.key as keyof typeof form]}</span>
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

      {/* Teaching stats */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
        <h4 className="text-[#1A2332] font-semibold text-sm mb-4">教学统计</h4>
        <div className="space-y-3">
          {[
            { label: '主讲课程', value: `${MY_COURSES.length} 门`, icon: BookOpen },
            { label: '学生总数', value: `${MY_COURSES.reduce((s, c) => s + c.enrollCount, 0).toLocaleString()} 人`, icon: Users },
            { label: '关联实验', value: `${MY_EXPERIMENTS.length} 个`, icon: FlaskConical },
            { label: '课程平均评分', value: `${(MY_COURSES.reduce((s, c) => s + c.rating, 0) / MY_COURSES.length).toFixed(1)} ★`, icon: Star },
          ].map(s => (
            <div key={s.label} className="flex items-center justify-between py-2 border-b border-[#F0F4F8] last:border-0">
              <div className="flex items-center gap-2 text-[#64748B] text-sm">
                <s.icon size={14} className="text-[#94A3B8]" /> {s.label}
              </div>
              <span className="text-[#1A2332] font-medium text-sm">{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main workbench ─────────────────────────────────────────────

export function TeacherWorkbench() {
  const [activeTab, setActiveTab] = useState('overview');

  const tabContent: Record<string, React.ReactNode> = {
    overview: <Overview />,
    courses: <TeacherCourses />,
    students: <StudentManagement />,
    profile: <TeacherProfile />,
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
                  {TEACHER.avatar}
                </div>
                <h3 className="text-[#1A2332] font-semibold">{TEACHER.name}</h3>
                <p className="text-[#64748B] text-xs mt-0.5">{TEACHER.teacherId}</p>
                <div className="flex justify-center gap-2 mt-2">
                  <span className="px-2 py-0.5 bg-[#E0F2F1] text-[#00695C] text-xs rounded-full">{TEACHER.title}</span>
                  <span className="px-2 py-0.5 bg-[#E3F2FD] text-[#0B5394] text-xs rounded-full">教师</span>
                </div>
                <div className="mt-3 pt-3 border-t border-[#F0F4F8] grid grid-cols-2 gap-2 text-center">
                  <div>
                    <div className="text-[#1A2332] font-semibold text-base">{MY_COURSES.length}</div>
                    <div className="text-[#94A3B8] text-xs">课程</div>
                  </div>
                  <div>
                    <div className="text-[#1A2332] font-semibold text-base">{MY_COURSES.reduce((s, c) => s + c.enrollCount, 0).toLocaleString()}</div>
                    <div className="text-[#94A3B8] text-xs">学生</div>
                  </div>
                </div>
              </div>

              {/* Nav */}
              <nav className="bg-white rounded-2xl border border-[#E2E8F0] p-2">
                {TABS.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
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
                  <Link
                    to="/"
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-[#94A3B8] hover:bg-[#FFF5F5] hover:text-[#E53935] transition-all"
                  >
                    <LogOut size={16} /> 退出登录
                  </Link>
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
                  onClick={() => setActiveTab(tab.key)}
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
