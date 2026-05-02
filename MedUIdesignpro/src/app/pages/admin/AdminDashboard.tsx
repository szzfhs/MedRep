import { motion } from 'motion/react';
import {
  Users, FlaskConical, BookOpen, FolderOpen, TrendingUp,
  Eye, Download, Plus, CheckCircle, Clock, AlertCircle,
  ArrowUpRight, ArrowRight, Newspaper
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { experiments, courses, news } from '../../data/mockData';

const statCards = [
  { label: '注册用户总数', value: '12,847', change: '+234', trend: 'up', icon: Users, color: '#0B5394', bg: '#E3F2FD', desc: '本月新增' },
  { label: '虚拟实验项目', value: '52', change: '+3', trend: 'up', icon: FlaskConical, color: '#00897B', bg: '#E0F2F1', desc: '本月新增' },
  { label: '实验课程', value: '18', change: '+2', trend: 'up', icon: BookOpen, color: '#6A1B9A', bg: '#F3E5F5', desc: '本月发布' },
  { label: '教学资源数', value: '384', change: '+28', trend: 'up', icon: FolderOpen, color: '#E65100', bg: '#FFF3E0', desc: '本月上传' },
];

const visitData = [
  { name: '1月', visits: 3200, experiments: 1400 },
  { name: '2月', visits: 2800, experiments: 1200 },
  { name: '3月', visits: 4100, experiments: 1800 },
  { name: '4月', visits: 3900, experiments: 1700 },
  { name: '5月', visits: 5200, experiments: 2300 },
  { name: '6月', visits: 4800, experiments: 2100 },
  { name: '7月', visits: 3600, experiments: 1600 },
  { name: '8月', visits: 2900, experiments: 1300 },
  { name: '9月', visits: 5800, experiments: 2600 },
  { name: '10月', visits: 6200, experiments: 2900 },
  { name: '11月', visits: 5400, experiments: 2400 },
  { name: '12月', visits: 4900, experiments: 2200 },
];

const userTypeData = [
  { name: '学生', value: 10234, color: '#0B5394' },
  { name: '教师', value: 1876, color: '#00897B' },
  { name: '机构', value: 487, color: '#6A1B9A' },
  { name: '管理员', value: 250, color: '#F57F17' },
];

const pendingTasks = [
  { type: '用户审核', desc: '新教师账号申请待审核', count: 5, color: '#F57F17', icon: Users },
  { type: '内容审核', desc: '新实验项目待发布', count: 2, color: '#0B5394', icon: FlaskConical },
  { type: '资源上传', desc: '课件资源等待处理', count: 8, color: '#00897B', icon: FolderOpen },
];

const recentActivity = [
  { action: '新用户注册', detail: '李明同学完成学生账号注册', time: '5分钟前', type: 'success' },
  { action: '实验上线', detail: '《微生物培养与检测》实验项目已发布', time: '1小时前', type: 'info' },
  { action: '课程更新', detail: '人体解剖学课程第3章内容已更新', time: '2小时前', type: 'info' },
  { action: '资源上传', detail: '外科学教研室上传了5个课件资源', time: '3小时前', type: 'success' },
  { action: '系统警告', detail: '存储空间使用率已达到75%', time: '昨天', type: 'warning' },
];

export function AdminDashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#1A2332]" style={{ fontSize: '1.4rem', fontWeight: 700 }}>系统概览</h1>
          <p className="text-[#64748B] text-sm mt-0.5">欢迎回来，管理员 · 数据更新于 2025-05-01 09:30</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-[#0B5394] text-white rounded-xl text-sm font-medium hover:bg-[#1565C0] transition-colors">
          <Plus size={15} /> 快速新建
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white rounded-2xl border border-[#E2E8F0] p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: card.bg }}>
                <card.icon size={20} style={{ color: card.color }} />
              </div>
              <span className="flex items-center gap-1 text-xs text-[#2E7D32] bg-[#E8F5E9] px-2 py-0.5 rounded-lg">
                <ArrowUpRight size={11} />
                {card.change}
              </span>
            </div>
            <div className="text-[#1A2332] font-bold text-2xl mb-0.5">{card.value}</div>
            <div className="text-[#64748B] text-xs">{card.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Visit trend */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E2E8F0] p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-[#1A2332] font-semibold text-sm">平台访问趋势</h3>
              <p className="text-[#94A3B8] text-xs mt-0.5">2025年各月访问量与实验启动次数</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#64748B]">
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 bg-[#0B5394] rounded-full inline-block" />页面访问</span>
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 bg-[#00897B] rounded-full inline-block" />实验启动</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={visitData} barGap={2} barSize={10}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F4F8" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: '12px' }}
                cursor={{ fill: '#F0F4F8' }}
              />
              <Bar dataKey="visits" fill="#0B5394" radius={[4, 4, 0, 0]} name="页面访问" />
              <Bar dataKey="experiments" fill="#00897B" radius={[4, 4, 0, 0]} name="实验启动" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* User type pie */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
          <h3 className="text-[#1A2332] font-semibold text-sm mb-1">用户构成</h3>
          <p className="text-[#94A3B8] text-xs mb-4">各角色用户占比</p>
          <div className="flex justify-center mb-4">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={userTypeData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                  {userTypeData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {userTypeData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
                  <span className="text-[#64748B] text-xs">{item.name}</span>
                </div>
                <span className="text-[#1A2332] text-xs font-medium">{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pending Tasks */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
          <h3 className="text-[#1A2332] font-semibold text-sm mb-4 flex items-center gap-2">
            <Clock size={16} className="text-[#F57F17]" />
            待处理任务
          </h3>
          <div className="space-y-3">
            {pendingTasks.map((task) => (
              <div key={task.type} className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-xl hover:bg-[#F0F4F8] transition-colors cursor-pointer group">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: task.color + '15' }}>
                  <task.icon size={17} style={{ color: task.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#1A2332] text-xs font-medium group-hover:text-[#0B5394] transition-colors">{task.type}</p>
                  <p className="text-[#94A3B8] text-xs truncate">{task.desc}</p>
                </div>
                <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: task.color }}>
                  {task.count}
                </span>
              </div>
            ))}
          </div>
          <button className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 border border-[#E2E8F0] rounded-xl text-xs text-[#64748B] hover:bg-[#F0F4F8] transition-colors">
            查看全部任务 <ArrowRight size={13} />
          </button>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E2E8F0] p-5">
          <h3 className="text-[#1A2332] font-semibold text-sm mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-[#0B5394]" />
            最近操作日志
          </h3>
          <div className="space-y-0">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-start gap-3 py-3 border-b border-[#F0F4F8] last:border-0">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  item.type === 'success' ? 'bg-[#2E7D32]' :
                  item.type === 'warning' ? 'bg-[#F57F17]' : 'bg-[#0B5394]'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                      item.type === 'success' ? 'bg-[#E8F5E9] text-[#2E7D32]' :
                      item.type === 'warning' ? 'bg-[#FFF8E1] text-[#F57F17]' : 'bg-[#E3F2FD] text-[#0B5394]'
                    }`}>{item.action}</span>
                    <span className="text-[#94A3B8] text-xs">{item.time}</span>
                  </div>
                  <p className="text-[#64748B] text-xs mt-0.5">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Access */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: '发布新闻', icon: Newspaper, path: '/admin/news/new', color: '#0B5394' },
          { label: '添加实验项目', icon: FlaskConical, path: '/admin/experiments/new', color: '#00897B' },
          { label: '新建课程', icon: BookOpen, path: '/admin/courses/new', color: '#6A1B9A' },
          { label: '上传资源', icon: FolderOpen, path: '/admin/resources/upload', color: '#E65100' },
        ].map((item) => (
          <button
            key={item.label}
            className="group flex items-center gap-3 p-4 bg-white rounded-2xl border border-[#E2E8F0] hover:shadow-md hover:border-[#1E88E5]/30 transition-all"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: item.color + '15' }}>
              <item.icon size={20} style={{ color: item.color }} />
            </div>
            <span className="text-[#1A2332] text-sm font-medium group-hover:text-[#0B5394] transition-colors">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
