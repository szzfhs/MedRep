import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  Search, Plus, Upload, Download, Trash2, Edit,
  CheckCircle, MoreHorizontal, Filter, Users,
  GraduationCap, BookOpen, Building2, RefreshCw, Loader2,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import {
  getSchoolUsers, deleteSchoolUsers,
  SchoolUser, UserListQuery,
} from '@/api/school-admin';

const PAGE_SIZE = 10;

const tabs = [
  { key: 'student', label: '学生账户', icon: GraduationCap, roleKey: 'student' },
  { key: 'teacher', label: '教师账户', icon: BookOpen, roleKey: 'teacher' },
  { key: 'all',     label: '全部账户', icon: Building2,   roleKey: '' },
];

export function UserManagementPage() {
  const [activeTab, setActiveTab] = useState('student');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<number[]>([]);
  const [users, setUsers] = useState<SchoolUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const activeTabMeta = tabs.find(t => t.key === activeTab);
    const params: UserListQuery = {
      pageNum: page,
      pageSize: PAGE_SIZE,
    };
    if (search) params.userName = search;
    if (activeTabMeta?.roleKey) params.roleKey = activeTabMeta.roleKey;
    try {
      const result = await getSchoolUsers(params);
      setUsers(result.rows ?? []);
      setTotal(result.total ?? 0);
    } catch {
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [activeTab, page, search]);

  useEffect(() => {
    setPage(1);
  }, [activeTab, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const toggleSelect = (id: number) => {
    setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    setSelected(prev => prev.length === users.length ? [] : users.map(s => s.userId));
  };

  const handleDeleteSelected = async () => {
    if (!selected.length) return;
    if (!window.confirm(`确认删除选中的 ${selected.length} 个账户？`)) return;
    try {
      await deleteSchoolUsers(selected);
      setSelected([]);
      fetchUsers();
    } catch {/* ignore */}
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[#1A2332] font-bold text-lg">账户管理</h1>
          <p className="text-[#64748B] text-sm">管理本校所有用户账号信息</p>
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
            {activeTab === tab.key && total > 0 && (
              <span className="px-2 py-0.5 rounded-md text-xs bg-white/20 text-white">
                {total.toLocaleString()}
              </span>
            )}
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
              placeholder="搜索姓名、账号…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#0B5394] bg-[#F8FAFC]"
            />
          </div>
          <button
            onClick={fetchUsers}
            className="flex items-center gap-1.5 px-3 py-2 border border-[#E2E8F0] text-[#64748B] rounded-xl text-sm hover:bg-[#F0F4F8]"
          >
            <RefreshCw size={14} />
          </button>
          {selected.length > 0 && (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-[#64748B] text-sm">已选 {selected.length} 项</span>
              <button
                onClick={handleDeleteSelected}
                className="flex items-center gap-1.5 px-3 py-2 text-red-500 border border-red-200 rounded-xl text-sm hover:bg-red-50"
              >
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
                    checked={users.length > 0 && selected.length === users.length}
                    onChange={toggleAll}
                    className="rounded"
                  />
                </th>
                {['用户名', '昵称', '部门', '手机号', '状态', '注册时间', '操作'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[#94A3B8] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F4F8]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-[#94A3B8]">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 size={18} className="animate-spin" /> 加载中…
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-[#94A3B8] text-sm">
                    暂无用户数据
                  </td>
                </tr>
              ) : users.map((user) => (
                <motion.tr
                  key={user.userId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`hover:bg-[#F8FAFC] transition-colors ${selected.includes(user.userId) ? 'bg-[#F0F4F8]' : ''}`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(user.userId)}
                      onChange={() => toggleSelect(user.userId)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-[#E3F2FD] rounded-full flex items-center justify-center text-xs font-semibold text-[#0B5394]">
                        {(user.nickName || user.userName).charAt(0)}
                      </div>
                      <span className="text-[#1A2332] text-sm font-medium">{user.userName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#64748B] text-sm">{user.nickName || '—'}</td>
                  <td className="px-4 py-3 text-[#64748B] text-sm whitespace-nowrap">{user.deptName || '—'}</td>
                  <td className="px-4 py-3 text-[#64748B] text-sm">{user.phonenumber || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`flex items-center gap-1 w-fit px-2.5 py-1 rounded-lg text-xs font-medium ${
                      user.status === '0'
                        ? 'bg-[#E8F5E9] text-[#2E7D32]'
                        : 'bg-[#FFEBEE] text-[#E53935]'
                    }`}>
                      {user.status === '0'
                        ? <><CheckCircle size={11} /> 正常</>
                        : <><MoreHorizontal size={11} /> 停用</>
                      }
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#94A3B8] text-xs whitespace-nowrap">
                    {user.createTime ? user.createTime.slice(0, 10) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 text-[#64748B] hover:text-[#0B5394] hover:bg-[#E3F2FD] rounded-lg transition-colors">
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => deleteSchoolUsers([user.userId]).then(fetchUsers)}
                        className="p-1.5 text-[#E53935] hover:bg-red-50 rounded-lg transition-colors"
                      >
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
            共 {total.toLocaleString()} 条记录，第 {page} / {totalPages || 1} 页
          </span>
          <div className="flex items-center gap-1.5">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              className="w-8 h-8 rounded-lg text-sm flex items-center justify-center text-[#64748B] hover:bg-[#F0F4F8] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = page <= 3 ? i + 1 : page - 2 + i;
              if (p < 1 || p > totalPages) return null;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center transition-colors ${
                    p === page ? 'bg-[#0B5394] text-white' : 'text-[#64748B] hover:bg-[#F0F4F8]'
                  }`}
                >
                  {p}
                </button>
              );
            })}
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="w-8 h-8 rounded-lg text-sm flex items-center justify-center text-[#64748B] hover:bg-[#F0F4F8] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
