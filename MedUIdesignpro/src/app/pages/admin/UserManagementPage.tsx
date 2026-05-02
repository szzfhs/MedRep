import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Search, Plus, Upload, Download, Trash2, Edit,
  CheckCircle, XCircle, MoreHorizontal, Filter, Users,
  GraduationCap, BookOpen, Building2, RefreshCw
} from 'lucide-react';

const mockStudents = [
  { id: 1, name: '张明远', studentId: '202101001', class: '临床医学2021-1班', dept: '临床医学院', phone: '138****1234', status: 'active', date: '2021-09-01' },
  { id: 2, name: '李晓梦', studentId: '202101002', class: '临床医学2021-1班', dept: '临床医学院', phone: '139****5678', status: 'active', date: '2021-09-01' },
  { id: 3, name: '王浩天', studentId: '202201003', class: '基础医学2022-2班', dept: '基础医学院', phone: '137****9012', status: 'pending', date: '2022-09-01' },
  { id: 4, name: '陈思雨', studentId: '202201004', class: '药学2022-1班', dept: '药学院', phone: '136****3456', status: 'active', date: '2022-09-01' },
  { id: 5, name: '刘子豪', studentId: '202301005', class: '护理学2023-1班', dept: '护理学院', phone: '135****7890', status: 'pending', date: '2023-09-01' },
];

const tabs = [
  { key: 'student', label: '学生账户', icon: GraduationCap, count: 10234 },
  { key: 'teacher', label: '教师账户', icon: BookOpen, count: 1876 },
  { key: 'institution', label: '机构账户', icon: Building2, count: 487 },
];

export function UserManagementPage() {
  const [activeTab, setActiveTab] = useState('student');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<number[]>([]);

  const toggleSelect = (id: number) => {
    setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    setSelected(prev => prev.length === mockStudents.length ? [] : mockStudents.map(s => s.id));
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[#1A2332] font-bold text-lg">账户管理</h1>
          <p className="text-[#64748B] text-sm">管理平台所有用户账号信息</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-4 py-2 border border-[#E2E8F0] text-[#64748B] rounded-xl text-sm hover:bg-[#F0F4F8] transition-colors">
            <Upload size={14} /> 批量导入
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 border border-[#E2E8F0] text-[#64748B] rounded-xl text-sm hover:bg-[#F0F4F8] transition-colors">
            <Download size={14} /> 导出
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-[#0B5394] text-white rounded-xl text-sm font-medium hover:bg-[#1565C0] transition-colors">
            <Plus size={14} /> 新增账户
          </button>
        </div>
      </div>

      {/* Role Tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex-shrink-0 ${
              activeTab === tab.key
                ? 'bg-[#0B5394] text-white shadow-sm'
                : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:border-[#0B5394] hover:text-[#0B5394]'
            }`}
          >
            <tab.icon size={15} />
            {tab.label}
            <span className={`px-2 py-0.5 rounded-md text-xs ${
              activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-[#F0F4F8] text-[#94A3B8]'
            }`}>
              {tab.count.toLocaleString()}
            </span>
          </button>
        ))}
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-[#E2E8F0]">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="搜索姓名、学号…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#0B5394] bg-[#F8FAFC]"
            />
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 border border-[#E2E8F0] text-[#64748B] rounded-xl text-sm hover:bg-[#F0F4F8]">
            <Filter size={14} /> 筛选
          </button>
          {selected.length > 0 && (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-[#64748B] text-sm">已选 {selected.length} 项</span>
              <button className="flex items-center gap-1.5 px-3 py-2 text-red-500 border border-red-200 rounded-xl text-sm hover:bg-red-50">
                <Trash2 size={14} /> 批量删除
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selected.length === mockStudents.length}
                    onChange={toggleAll}
                    className="rounded"
                  />
                </th>
                {['姓名', '学号', '所属班级', '院系', '手机号', '状态', '注册时间', '操作'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[#94A3B8] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F4F8]">
              {mockStudents.map((student) => (
                <motion.tr
                  key={student.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`hover:bg-[#F8FAFC] transition-colors ${selected.includes(student.id) ? 'bg-[#F0F4F8]' : ''}`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(student.id)}
                      onChange={() => toggleSelect(student.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-[#E3F2FD] rounded-full flex items-center justify-center text-xs font-semibold text-[#0B5394]">
                        {student.name.charAt(0)}
                      </div>
                      <span className="text-[#1A2332] text-sm font-medium">{student.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#64748B] text-sm">{student.studentId}</td>
                  <td className="px-4 py-3 text-[#64748B] text-sm whitespace-nowrap">{student.class}</td>
                  <td className="px-4 py-3 text-[#64748B] text-sm whitespace-nowrap">{student.dept}</td>
                  <td className="px-4 py-3 text-[#64748B] text-sm">{student.phone}</td>
                  <td className="px-4 py-3">
                    <span className={`flex items-center gap-1 w-fit px-2.5 py-1 rounded-lg text-xs font-medium ${
                      student.status === 'active'
                        ? 'bg-[#E8F5E9] text-[#2E7D32]'
                        : 'bg-[#FFF8E1] text-[#F57F17]'
                    }`}>
                      {student.status === 'active'
                        ? <><CheckCircle size={11} /> 正常</>
                        : <><RefreshCw size={11} /> 审核中</>
                      }
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#94A3B8] text-xs whitespace-nowrap">{student.date}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 text-[#64748B] hover:text-[#0B5394] hover:bg-[#E3F2FD] rounded-lg transition-colors">
                        <Edit size={14} />
                      </button>
                      {student.status === 'pending' && (
                        <button className="p-1.5 text-[#2E7D32] hover:bg-[#E8F5E9] rounded-lg transition-colors">
                          <CheckCircle size={14} />
                        </button>
                      )}
                      <button className="p-1.5 text-[#E53935] hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-[#E2E8F0]">
          <span className="text-[#64748B] text-sm">
            显示 1-5 / 共 10,234 条记录
          </span>
          <div className="flex items-center gap-1.5">
            {['<', '1', '2', '3', '...', '1024', '>'].map((p, i) => (
              <button
                key={i}
                className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center transition-colors ${
                  p === '1' ? 'bg-[#0B5394] text-white' : 'text-[#64748B] hover:bg-[#F0F4F8]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
