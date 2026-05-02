import { useState } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen, FlaskConical, Clock, Award, User, Settings,
  TrendingUp, Play, CheckCircle, ChevronRight, Target,
  Edit3, Save, X, BarChart2, Calendar, Star, LogOut,
  Layers, FileText, Eye,
} from 'lucide-react';
import { courses, experiments } from '../data/mockData';

// ─── Mock student data ──────────────────────────────────────────

const STUDENT = {
  name: '张同学',
  studentId: 'student001',
  college: '基础医学院',
  major: '临床医学',
  grade: '2022级',
  email: 'student001@med.edu.cn',
  phone: '138****8888',
  avatar: '张',
};

const ENROLLED_COURSES = [
  { ...courses[0], progress: 75, lastStudy: '2025-04-29', completedSections: 9, status: 'learning' },
  { ...courses[1], progress: 40, lastStudy: '2025-04-25', completedSections: 4, status: 'learning' },
  { ...courses[2], progress: 100, lastStudy: '2025-04-10', completedSections: 8, status: 'completed' },
  { ...courses[3], progress: 10, lastStudy: '2025-04-20', completedSections: 2, status: 'learning' },
];

const MY_EXPERIMENTS = [
  { ...experiments[0], startTime: '2025-04-28 14:30', duration: '1h 45min', score: 92, status: 'completed' },
  { ...experiments[1], startTime: '2025-04-25 10:00', duration: '1h 20min', score: 88, status: 'completed' },
  { ...experiments[3], startTime: '2025-04-22 15:00', duration: '2h 10min', score: 95, status: 'completed' },
  { ...experiments[4], startTime: '2025-04-18 09:30', duration: '1h 55min', score: 85, status: 'completed' },
  { ...experiments[5], startTime: '2025-04-15 13:00', duration: '2h 00min', score: null, status: 'inprogress' },
];

const STATS = [
  { label: '已选课程', value: 4, icon: BookOpen, color: 'from-[#0B5394] to-[#1E88E5]', bg: 'bg-[#EFF6FF]' },
  { label: '完成实验', value: 4, icon: FlaskConical, color: 'from-[#00695C] to-[#00897B]', bg: 'bg-[#E0F2F1]' },
  { label: '学习时长', value: '24h', icon: Clock, color: 'from-[#6D28D9] to-[#7C3AED]', bg: 'bg-[#EDE9FE]' },
  { label: '平均得分', value: '90', icon: Award, color: 'from-[#B45309] to-[#D97706]', bg: 'bg-[#FEF3C7]' },
];

const TABS = [
  { key: 'overview', label: '学习概览', icon: BarChart2 },
  { key: 'courses', label: '我的课程', icon: BookOpen },
  { key: 'experiments', label: '我的实验', icon: FlaskConical },
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
              <div className="text-[#1A2332] font-bold text-2xl leading-none">{s.value}</div>
              <div className="text-[#64748B] text-xs mt-0.5">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent courses + experiments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Continue learning */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0F4F8]">
            <h3 className="text-[#1A2332] font-semibold text-sm flex items-center gap-2">
              <TrendingUp size={15} className="text-[#0B5394]" /> 继续学习
            </h3>
          </div>
          <div className="p-4 space-y-3">
            {ENROLLED_COURSES.filter(c => c.status === 'learning').slice(0, 3).map(c => (
              <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F8FAFC] transition-colors group">
                <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                  <img src={c.image} alt={c.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[#1A2332] text-sm font-medium truncate">{c.title}</div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#0B5394] to-[#1E88E5] rounded-full"
                        style={{ width: `${c.progress}%` }}
                      />
                    </div>
                    <span className="text-[#94A3B8] text-xs flex-shrink-0">{c.progress}%</span>
                  </div>
                </div>
                <Link
                  to={`/courses/${c.id}/learn`}
                  className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 bg-[#0B5394] text-white rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Play size={10} fill="currentColor" /> 继续
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Recent experiments */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0F4F8]">
            <h3 className="text-[#1A2332] font-semibold text-sm flex items-center gap-2">
              <FlaskConical size={15} className="text-[#00897B]" /> 最近实验
            </h3>
          </div>
          <div className="p-4 space-y-2.5">
            {MY_EXPERIMENTS.slice(0, 4).map(e => (
              <div key={e.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F8FAFC] transition-colors">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${e.status === 'completed' ? 'bg-[#43A047]' : 'bg-[#FB8C00]'}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-[#1A2332] text-sm truncate">{e.title}</div>
                  <div className="text-[#94A3B8] text-xs mt-0.5">{e.startTime}</div>
                </div>
                {e.score !== null ? (
                  <span className="flex-shrink-0 text-sm font-semibold text-[#2E7D32]">{e.score}分</span>
                ) : (
                  <span className="flex-shrink-0 text-xs text-[#FB8C00] bg-[#FFF8E1] px-2 py-0.5 rounded-full">进行中</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Learning calendar / upcoming */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
        <h3 className="text-[#1A2332] font-semibold text-sm flex items-center gap-2 mb-4">
          <Target size={15} className="text-[#6D28D9]" /> 学习目标与进度
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ENROLLED_COURSES.map(c => (
            <div key={c.id} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                <img src={c.image} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between mb-1">
                  <span className="text-[#1A2332] text-xs truncate pr-2">{c.title.substring(0, 14)}…</span>
                  <span className={`text-xs font-medium flex-shrink-0 ${c.progress === 100 ? 'text-[#2E7D32]' : 'text-[#0B5394]'}`}>
                    {c.progress}%
                  </span>
                </div>
                <div className="h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${c.progress}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-full rounded-full ${c.progress === 100 ? 'bg-gradient-to-r from-[#2E7D32] to-[#43A047]' : 'bg-gradient-to-r from-[#0B5394] to-[#1E88E5]'}`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MyCourses() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[#1A2332] font-semibold">我的课程</h3>
        <Link to="/courses" className="text-xs text-[#0B5394] hover:underline flex items-center gap-1">
          浏览更多课程 <ChevronRight size={13} />
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ENROLLED_COURSES.map(c => (
          <div key={c.id} className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
            <div className="relative h-36 overflow-hidden">
              <img src={c.image} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              {c.status === 'completed' && (
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-[#2E7D32]/90 text-white text-xs px-2 py-0.5 rounded-full">
                  <CheckCircle size={10} /> 已完成
                </div>
              )}
              <div className="absolute bottom-3 left-3 right-3">
                <div className="flex justify-between text-white/80 text-xs mb-1">
                  <span>{c.completedSections}/{c.chapters} 节</span>
                  <span>{c.progress}%</span>
                </div>
                <div className="h-1.5 bg-white/30 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full" style={{ width: `${c.progress}%` }} />
                </div>
              </div>
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <h4 className="text-[#1A2332] text-sm font-semibold mb-1 line-clamp-2">{c.title}</h4>
              <p className="text-[#64748B] text-xs mb-1">{c.teacher}</p>
              <div className="flex items-center gap-3 text-[#94A3B8] text-xs mb-4">
                <span className="flex items-center gap-1"><Calendar size={11} /> 上次学习 {c.lastStudy}</span>
                <span className="flex items-center gap-1"><Star size={11} className="text-[#F59E0B]" /> {c.rating}</span>
              </div>
              <div className="mt-auto flex gap-2">
                <Link
                  to={`/courses/${c.id}`}
                  className="flex-1 flex items-center justify-center gap-1 py-2 text-xs border border-[#E2E8F0] text-[#64748B] rounded-xl hover:bg-[#F0F4F8] transition-colors"
                >
                  <Eye size={12} /> 详情
                </Link>
                <Link
                  to={`/courses/${c.id}/learn`}
                  className="flex-1 flex items-center justify-center gap-1 py-2 text-xs bg-[#0B5394] text-white rounded-xl hover:bg-[#1565C0] transition-colors"
                >
                  <Play size={12} fill="currentColor" />
                  {c.status === 'completed' ? '回顾' : '继续学习'}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MyExperiments() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[#1A2332] font-semibold">我的实验记录</h3>
        <Link to="/experiments" className="text-xs text-[#0B5394] hover:underline flex items-center gap-1">
          浏览实验库 <ChevronRight size={13} />
        </Link>
      </div>
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: '已完成', value: MY_EXPERIMENTS.filter(e => e.status === 'completed').length, color: 'text-[#2E7D32]', bg: 'bg-[#E8F5E9]' },
          { label: '进行中', value: MY_EXPERIMENTS.filter(e => e.status === 'inprogress').length, color: 'text-[#FB8C00]', bg: 'bg-[#FFF8E1]' },
          { label: '平均得分', value: `${Math.round(MY_EXPERIMENTS.filter(e => e.score).reduce((s, e) => s + (e.score || 0), 0) / MY_EXPERIMENTS.filter(e => e.score).length)}分`, color: 'text-[#0B5394]', bg: 'bg-[#E3F2FD]' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center`}>
            <div className={`${s.color} font-bold text-xl`}>{s.value}</div>
            <div className="text-[#64748B] text-xs mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>
      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
              {['实验名称', '类型', '开始时间', '时长', '得分', '状态', '操作'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[#64748B] whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MY_EXPERIMENTS.map((e, i) => (
              <tr key={e.id} className={`border-b border-[#F0F4F8] hover:bg-[#F8FAFC] transition-colors ${i % 2 ? 'bg-[#FAFBFD]' : ''}`}>
                <td className="px-4 py-3">
                  <div className="text-[#1A2332] text-sm font-medium max-w-[180px] line-clamp-1">{e.title}</div>
                  <div className="text-[#94A3B8] text-xs">{e.publisher}</div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${e.type === 'WebGL' ? 'bg-[#E3F2FD] text-[#0B5394]' : 'bg-[#EDE9FE] text-[#6D28D9]'}`}>
                    {e.typeLabel}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#64748B] text-xs whitespace-nowrap">{e.startTime}</td>
                <td className="px-4 py-3 text-[#64748B] text-xs whitespace-nowrap">{e.duration}</td>
                <td className="px-4 py-3">
                  {e.score !== null
                    ? <span className={`text-sm font-semibold ${e.score >= 90 ? 'text-[#2E7D32]' : e.score >= 80 ? 'text-[#0B5394]' : 'text-[#FB8C00]'}`}>{e.score}分</span>
                    : <span className="text-[#94A3B8] text-xs">—</span>
                  }
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${e.status === 'completed' ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-[#FFF8E1] text-[#FB8C00]'}`}>
                    {e.status === 'completed' ? <><CheckCircle size={10} /> 已完成</> : <>⏳ 进行中</>}
                  </span>
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
  );
}

function ProfileSection() {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: STUDENT.name,
    email: STUDENT.email,
    phone: STUDENT.phone,
    college: STUDENT.college,
    major: STUDENT.major,
  });

  return (
    <div className="max-w-xl space-y-5">
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0B5394] to-[#1E88E5] flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {STUDENT.avatar}
          </div>
          <div>
            <h3 className="text-[#1A2332] font-bold text-lg">{STUDENT.name}</h3>
            <p className="text-[#64748B] text-sm">{STUDENT.studentId}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 bg-[#E3F2FD] text-[#0B5394] text-xs rounded-full font-medium">{STUDENT.grade}</span>
              <span className="px-2 py-0.5 bg-[#E0F2F1] text-[#00695C] text-xs rounded-full font-medium">{STUDENT.major}</span>
            </div>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className={`ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-colors ${editing ? 'bg-[#F0F4F8] text-[#64748B]' : 'bg-[#E3F2FD] text-[#0B5394] hover:bg-[#DBEAFE]'}`}
          >
            {editing ? <><X size={14} /> 取消</> : <><Edit3 size={14} /> 编辑</>}
          </button>
        </div>

        <div className="space-y-4">
          {[
            { label: '姓名', key: 'name' },
            { label: '邮箱', key: 'email' },
            { label: '手机', key: 'phone' },
            { label: '学院', key: 'college' },
            { label: '专业', key: 'major' },
          ].map(f => (
            <div key={f.key} className="grid grid-cols-3 gap-4 items-center">
              <label className="text-[#64748B] text-sm col-span-1">{f.label}</label>
              {editing ? (
                <input
                  value={form[f.key as keyof typeof form]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  className="col-span-2 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#0B5394]"
                />
              ) : (
                <span className="col-span-2 text-[#1A2332] text-sm">{form[f.key as keyof typeof form]}</span>
              )}
            </div>
          ))}
        </div>

        {editing && (
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setEditing(false)}
              className="flex-1 py-2.5 border border-[#E2E8F0] text-[#64748B] rounded-xl text-sm hover:bg-[#F0F4F8]"
            >
              取消
            </button>
            <button
              onClick={() => setEditing(false)}
              className="flex-1 py-2.5 bg-[#0B5394] text-white rounded-xl text-sm font-medium hover:bg-[#1565C0] flex items-center justify-center gap-2"
            >
              <Save size={14} /> 保存修改
            </button>
          </div>
        )}
      </div>

      {/* Quick stats */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
        <h4 className="text-[#1A2332] font-semibold text-sm mb-4">学习成就</h4>
        <div className="space-y-3">
          {[
            { label: '选修课程', value: `${ENROLLED_COURSES.length} 门`, icon: BookOpen },
            { label: '完成课程', value: `${ENROLLED_COURSES.filter(c => c.status === 'completed').length} 门`, icon: CheckCircle },
            { label: '完成实验', value: `${MY_EXPERIMENTS.filter(e => e.status === 'completed').length} 个`, icon: FlaskConical },
            { label: '累计学时', value: '24 学时', icon: Clock },
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

export function StudentWorkbench() {
  const [activeTab, setActiveTab] = useState('overview');

  const tabContent: Record<string, React.ReactNode> = {
    overview: <Overview />,
    courses: <MyCourses />,
    experiments: <MyExperiments />,
    profile: <ProfileSection />,
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
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0B5394] to-[#1E88E5] flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3 shadow-lg">
                  {STUDENT.avatar}
                </div>
                <h3 className="text-[#1A2332] font-semibold">{STUDENT.name}</h3>
                <p className="text-[#64748B] text-xs mt-0.5">{STUDENT.studentId}</p>
                <div className="flex justify-center gap-2 mt-2">
                  <span className="px-2 py-0.5 bg-[#E3F2FD] text-[#0B5394] text-xs rounded-full">学生</span>
                  <span className="px-2 py-0.5 bg-[#E0F2F1] text-[#00695C] text-xs rounded-full">{STUDENT.grade}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-[#F0F4F8] grid grid-cols-2 gap-2 text-center">
                  <div>
                    <div className="text-[#1A2332] font-semibold text-base">{ENROLLED_COURSES.length}</div>
                    <div className="text-[#94A3B8] text-xs">课程</div>
                  </div>
                  <div>
                    <div className="text-[#1A2332] font-semibold text-base">{MY_EXPERIMENTS.filter(e => e.status === 'completed').length}</div>
                    <div className="text-[#94A3B8] text-xs">实验</div>
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
                        ? 'bg-[#0B5394] text-white'
                        : 'text-[#475569] hover:bg-[#F0F4F8] hover:text-[#0B5394]'
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
                    activeTab === tab.key ? 'bg-[#0B5394] text-white' : 'text-[#64748B] hover:bg-[#F0F4F8]'
                  }`}
                >
                  <tab.icon size={13} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Page header */}
            <div className="flex items-center gap-2 mb-5">
              <div className="h-5 w-1 rounded-full bg-[#0B5394]" />
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
