import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Plus, Edit, Trash2, Eye, Filter,
  AppWindow, CheckCircle, XCircle, X,
  ChevronLeft, ChevronRight, ToggleLeft, ToggleRight,
  Monitor, Cpu, Image as ImageIcon, Tag, Layers,
} from 'lucide-react';
import {
  mockApps as initialApps, SimSystem, SYS_CATEGORIES, HW_LABELS, HwSupport,
} from '../../data/appsData';

const PAGE_SIZE = 8;
const HW_OPTIONS: HwSupport[] = ['webgl', 'pc', 'helmet', 'zspace'];

/* ───────── Reusable Modal shell ───────── */
function Modal({ title, onClose, children, size = 'lg' }: {
  title: string; onClose: () => void; children: React.ReactNode; size?: 'sm' | 'lg';
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className={`bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-hidden flex flex-col ${size === 'sm' ? 'max-w-sm' : 'max-w-2xl'}`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] flex-shrink-0">
          <h3 className="text-[#1A2332] font-semibold">{title}</h3>
          <button onClick={onClose} className="p-2 text-[#94A3B8] hover:text-[#1A2332] hover:bg-[#F0F4F8] rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </motion.div>
    </div>
  );
}

/* ───────── Confirm delete dialog ───────── */
function ConfirmDialog({ name, onConfirm, onCancel }: {
  name: string; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
      >
        <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Trash2 size={22} className="text-[#E53935]" />
        </div>
        <h3 className="text-[#1A2332] font-semibold text-center mb-2">确认删除</h3>
        <p className="text-[#64748B] text-sm text-center mb-6">
          确定删除「<span className="text-[#0B5394] font-medium">{name}</span>」吗？此操作不可恢复。
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 border border-[#E2E8F0] rounded-xl text-[#64748B] text-sm hover:bg-[#F0F4F8] transition-colors">
            取消
          </button>
          <button onClick={onConfirm} className="flex-1 py-2.5 bg-[#E53935] text-white rounded-xl text-sm font-medium hover:bg-[#C62828] transition-colors">
            确认删除
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ───────── Form type ───────── */
type FormData = {
  system_name: string;
  sys_category: string;
  cover_image: string;
  hw_support: HwSupport[];
  hw_recommend: string;
  system_detail: string;
  status: '0' | '1';
  launch_url: string;
};

const emptyForm: FormData = {
  system_name: '',
  sys_category: '解剖学',
  cover_image: '',
  hw_support: ['webgl'],
  hw_recommend: '',
  system_detail: '',
  status: '0',
  launch_url: '',
};

/* ───────── App Form ───────── */
function AppForm({
  initial, onSave, onCancel,
}: {
  initial: FormData;
  onSave: (data: FormData) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<FormData>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const set = <K extends keyof FormData>(k: K, v: FormData[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  const toggleHw = (hw: HwSupport) =>
    set('hw_support', form.hw_support.includes(hw)
      ? form.hw_support.filter(h => h !== hw)
      : [...form.hw_support, hw]);

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.system_name.trim()) e.system_name = '请输入应用名称';
    if (!form.launch_url.trim()) e.launch_url = '请输入启动地址';
    if (form.hw_support.length === 0) e.hw_support = '至少选择一种支持平台';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (validate()) onSave(form);
  };

  const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
    <div>
      <label className="block text-[#1A2332] text-sm font-medium mb-1.5">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );

  const inputClass = (err?: string) =>
    `w-full px-3.5 py-2.5 bg-[#F8FAFC] border rounded-xl text-sm text-[#1A2332] focus:outline-none focus:bg-white transition-all ${
      err ? 'border-red-400' : 'border-[#E2E8F0] focus:border-[#0B5394]'
    }`;

  return (
    <div className="p-6 space-y-4">
      {/* Name + Category */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="应用名称 *" error={errors.system_name}>
          <input
            value={form.system_name}
            onChange={e => set('system_name', e.target.value)}
            placeholder="请输入应用名称"
            className={inputClass(errors.system_name)}
          />
        </Field>
        <Field label="所属分类 *">
          <select
            value={form.sys_category}
            onChange={e => set('sys_category', e.target.value)}
            className={inputClass()}
          >
            {SYS_CATEGORIES.filter(c => c !== '全部').map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Field>
      </div>

      {/* Launch URL */}
      <Field label="启动地址 *" error={errors.launch_url}>
        <input
          value={form.launch_url}
          onChange={e => set('launch_url', e.target.value)}
          placeholder="https://..."
          className={inputClass(errors.launch_url)}
        />
      </Field>

      {/* Cover image */}
      <Field label="封面图片 URL">
        <div className="flex gap-2">
          <input
            value={form.cover_image}
            onChange={e => set('cover_image', e.target.value)}
            placeholder="https://images.example.com/cover.jpg"
            className={`flex-1 ${inputClass()}`}
          />
          {form.cover_image && (
            <div className="w-10 h-10 rounded-lg overflow-hidden border border-[#E2E8F0] flex-shrink-0">
              <img src={form.cover_image} alt="" className="w-full h-full object-cover" onError={e => (e.currentTarget.src = '')} />
            </div>
          )}
        </div>
      </Field>

      {/* Hardware support */}
      <Field label="支持平台 *" error={errors.hw_support as string | undefined}>
        <div className="flex flex-wrap gap-2">
          {HW_OPTIONS.map(hw => {
            const cfg = HW_LABELS[hw];
            const active = form.hw_support.includes(hw);
            return (
              <button
                key={hw}
                type="button"
                onClick={() => toggleHw(hw)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border-2 transition-all ${
                  active
                    ? `${cfg.bg} ${cfg.color} border-current`
                    : 'bg-[#F8FAFC] text-[#94A3B8] border-[#E2E8F0] hover:border-[#CBD5E1]'
                }`}
              >
                {hw === 'helmet' && '🥽'}
                {hw === 'pc' && '🖥️'}
                {hw === 'zspace' && '📐'}
                {hw === 'webgl' && '🌐'}
                {cfg.label}
              </button>
            );
          })}
        </div>
      </Field>

      {/* HW recommend */}
      <Field label="硬件配置说明">
        <input
          value={form.hw_recommend}
          onChange={e => set('hw_recommend', e.target.value)}
          placeholder="推荐/最低配置要求描述"
          className={inputClass()}
        />
      </Field>

      {/* System detail */}
      <Field label="系统简介">
        <textarea
          value={form.system_detail}
          onChange={e => set('system_detail', e.target.value)}
          placeholder="详细描述该应用的功能特点、适用场景等"
          rows={4}
          className={`${inputClass()} resize-none`}
        />
      </Field>

      {/* Status */}
      <Field label="上架状态">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => set('status', form.status === '0' ? '1' : '0')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              form.status === '0'
                ? 'bg-[#E8F5E9] text-[#2E7D32]'
                : 'bg-[#F0F4F8] text-[#64748B]'
            }`}
          >
            {form.status === '0'
              ? <><ToggleRight size={18} className="text-[#43A047]" /> 正常上架</>
              : <><ToggleLeft size={18} /> 暂停服务</>
            }
          </button>
        </div>
      </Field>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 border border-[#E2E8F0] text-[#64748B] rounded-xl text-sm hover:bg-[#F0F4F8] transition-colors"
        >
          取消
        </button>
        <button
          onClick={handleSave}
          className="flex-1 py-2.5 bg-[#0B5394] text-white rounded-xl text-sm font-medium hover:bg-[#1565C0] transition-colors"
        >
          保存
        </button>
      </div>
    </div>
  );
}

/* ───────── Detail view panel ───────── */
function DetailView({ app, onClose }: { app: SimSystem; onClose: () => void }) {
  return (
    <div className="p-6 space-y-4">
      {app.cover_image && (
        <div className="rounded-xl overflow-hidden h-48">
          <img src={app.cover_image} alt={app.system_name} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-[#F8FAFC] rounded-xl p-3">
          <span className="text-[#94A3B8] text-xs block mb-0.5">应用名称</span>
          <span className="text-[#1A2332] font-medium">{app.system_name}</span>
        </div>
        <div className="bg-[#F8FAFC] rounded-xl p-3">
          <span className="text-[#94A3B8] text-xs block mb-0.5">所属分类</span>
          <span className="text-[#1A2332] font-medium">{app.sys_category}</span>
        </div>
        <div className="bg-[#F8FAFC] rounded-xl p-3">
          <span className="text-[#94A3B8] text-xs block mb-0.5">状态</span>
          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
            app.status === '0' ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-red-50 text-[#E53935]'
          }`}>
            {app.status === '0' ? <><CheckCircle size={10} /> 正常</> : <><XCircle size={10} /> 停用</>}
          </span>
        </div>
        <div className="bg-[#F8FAFC] rounded-xl p-3">
          <span className="text-[#94A3B8] text-xs block mb-0.5">浏览次数</span>
          <span className="text-[#1A2332] font-medium">{app.view_count.toLocaleString()}</span>
        </div>
      </div>
      <div className="bg-[#F8FAFC] rounded-xl p-3">
        <span className="text-[#94A3B8] text-xs block mb-1.5">支持平台</span>
        <div className="flex flex-wrap gap-1.5">
          {app.hw_support.map(hw => {
            const cfg = HW_LABELS[hw];
            return (
              <span key={hw} className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
                {cfg.label}
              </span>
            );
          })}
        </div>
      </div>
      {app.hw_recommend && (
        <div className="bg-[#F8FAFC] rounded-xl p-3">
          <span className="text-[#94A3B8] text-xs block mb-1">硬件配置要求</span>
          <p className="text-[#475569] text-sm">{app.hw_recommend}</p>
        </div>
      )}
      <div className="bg-[#F8FAFC] rounded-xl p-3">
        <span className="text-[#94A3B8] text-xs block mb-1">启动地址</span>
        <a href={app.launch_url} target="_blank" rel="noreferrer" className="text-[#0B5394] text-sm hover:underline break-all">
          {app.launch_url}
        </a>
      </div>
      <div className="flex justify-end pt-1">
        <button onClick={onClose} className="px-5 py-2.5 border border-[#E2E8F0] text-[#64748B] rounded-xl text-sm hover:bg-[#F0F4F8] transition-colors">
          关闭
        </button>
      </div>
    </div>
  );
}

/* ───────── Main page ───────── */
export function AppsManagePage() {
  const [apps, setApps] = useState<SimSystem[]>(initialApps);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('全部');
  const [statusFilter, setStatusFilter] = useState<'all' | '0' | '1'>('all');
  const [page, setPage] = useState(1);

  type ModalState =
    | { type: 'create' }
    | { type: 'edit'; app: SimSystem }
    | { type: 'detail'; app: SimSystem }
    | { type: 'delete'; app: SimSystem }
    | null;
  const [modal, setModal] = useState<ModalState>(null);

  /* filtered list */
  const filtered = apps.filter(a => {
    const matchSearch = !search || a.system_name.includes(search) || a.sys_category.includes(search);
    const matchCat = categoryFilter === '全部' || a.sys_category === categoryFilter;
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchSearch && matchCat && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  /* CRUD helpers */
  const handleCreate = (data: FormData) => {
    const newApp: SimSystem = {
      ...data,
      sim_system_id: Math.max(0, ...apps.map(a => a.sim_system_id)) + 1,
      view_count: 0,
      create_by: 'admin',
      create_time: new Date().toLocaleString(),
      exp_count: 0,
      images: [],
    };
    setApps(prev => [newApp, ...prev]);
    setModal(null);
  };

  const handleEdit = (data: FormData) => {
    if (modal?.type !== 'edit') return;
    setApps(prev => prev.map(a =>
      a.sim_system_id === modal.app.sim_system_id ? { ...a, ...data } : a
    ));
    setModal(null);
  };

  const handleDelete = () => {
    if (modal?.type !== 'delete') return;
    setApps(prev => prev.filter(a => a.sim_system_id !== modal.app.sim_system_id));
    setModal(null);
  };

  const toggleStatus = (id: number) => {
    setApps(prev => prev.map(a =>
      a.sim_system_id === id ? { ...a, status: a.status === '0' ? '1' : '0' } : a
    ));
  };

  /* stats */
  const stats = {
    total: apps.length,
    active: apps.filter(a => a.status === '0').length,
    disabled: apps.filter(a => a.status === '1').length,
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#1A2332] font-bold text-xl">应用管理</h1>
          <p className="text-[#64748B] text-sm mt-0.5">管理虚拟仿真应用软件（vf_sim_system）</p>
        </div>
        <button
          onClick={() => setModal({ type: 'create' })}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0B5394] text-white rounded-xl text-sm font-medium hover:bg-[#1565C0] transition-colors shadow-md shadow-[#0B5394]/20"
        >
          <Plus size={16} /> 新增应用
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: '应用总数', value: stats.total, icon: AppWindow, color: 'from-[#0B5394] to-[#1E88E5]' },
          { label: '正常运行', value: stats.active, icon: CheckCircle, color: 'from-[#2E7D32] to-[#43A047]' },
          { label: '暂停服务', value: stats.disabled, icon: XCircle, color: 'from-[#B71C1C] to-[#E53935]' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 border border-[#E2E8F0] flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center flex-shrink-0`}>
              <s.icon size={18} className="text-white" />
            </div>
            <div>
              <div className="text-[#1A2332] font-bold text-2xl">{s.value}</div>
              <div className="text-[#64748B] text-xs">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="搜索应用名称、分类..."
            className="w-full pl-9 pr-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#0B5394]"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#1A2332] focus:outline-none focus:border-[#0B5394]"
        >
          {SYS_CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value as 'all' | '0' | '1'); setPage(1); }}
          className="px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#1A2332] focus:outline-none focus:border-[#0B5394]"
        >
          <option value="all">全部状态</option>
          <option value="0">正常</option>
          <option value="1">停用</option>
        </select>
        <div className="flex items-center gap-1.5 text-[#94A3B8] text-xs ml-auto">
          <Filter size={13} />
          {filtered.length} 条结果
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                {['应用信息', '分类', '支持平台', '浏览量', '实验数', '状态', '创建时间', '操作'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[#64748B] whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {pageData.map((app, idx) => (
                  <motion.tr
                    key={app.sim_system_id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`border-b border-[#F0F4F8] hover:bg-[#F8FAFC] transition-colors ${idx % 2 === 0 ? '' : 'bg-[#FAFBFD]'}`}
                  >
                    {/* App info */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {app.cover_image ? (
                          <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-[#E2E8F0]">
                            <img src={app.cover_image} alt="" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-[#E3F2FD] flex items-center justify-center flex-shrink-0">
                            <AppWindow size={16} className="text-[#0B5394]" />
                          </div>
                        )}
                        <div>
                          <div className="text-[#1A2332] text-sm font-medium leading-tight max-w-[180px] line-clamp-1">
                            {app.system_name}
                          </div>
                          <div className="text-[#94A3B8] text-xs mt-0.5 font-mono truncate max-w-[180px]">
                            ID: {app.sim_system_id}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-[#E3F2FD] text-[#0B5394] text-xs rounded-full font-medium">
                        {app.sys_category}
                      </span>
                    </td>

                    {/* HW support */}
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {app.hw_support.map(hw => (
                          <span
                            key={hw}
                            className={`px-1.5 py-0.5 rounded text-xs font-medium ${HW_LABELS[hw].bg} ${HW_LABELS[hw].color}`}
                          >
                            {HW_LABELS[hw].label}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Views */}
                    <td className="px-4 py-3 text-[#475569] text-sm">
                      {app.view_count.toLocaleString()}
                    </td>

                    {/* Exp count */}
                    <td className="px-4 py-3 text-[#475569] text-sm">
                      {app.exp_count}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleStatus(app.sim_system_id)}
                        title="点击切换状态"
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all hover:opacity-80 ${
                          app.status === '0'
                            ? 'bg-[#E8F5E9] text-[#2E7D32]'
                            : 'bg-red-50 text-[#E53935]'
                        }`}
                      >
                        {app.status === '0'
                          ? <><CheckCircle size={11} /> 正常</>
                          : <><XCircle size={11} /> 停用</>
                        }
                      </button>
                    </td>

                    {/* Create time */}
                    <td className="px-4 py-3 text-[#94A3B8] text-xs whitespace-nowrap">
                      {app.create_time.split(' ')[0]}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setModal({ type: 'detail', app })}
                          title="查看详情"
                          className="p-1.5 text-[#64748B] hover:text-[#0B5394] hover:bg-[#E3F2FD] rounded-lg transition-colors"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => setModal({ type: 'edit', app })}
                          title="编辑"
                          className="p-1.5 text-[#64748B] hover:text-[#1565C0] hover:bg-[#E3F2FD] rounded-lg transition-colors"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => setModal({ type: 'delete', app })}
                          title="删除"
                          className="p-1.5 text-[#64748B] hover:text-[#E53935] hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>

              {pageData.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <AppWindow size={40} className="text-[#CBD5E1] mx-auto mb-3" />
                    <p className="text-[#94A3B8] text-sm">暂无数据</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#E2E8F0] bg-[#F8FAFC]">
            <span className="text-[#64748B] text-xs">
              第 {page} / {totalPages} 页，共 {filtered.length} 条
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 text-[#64748B] hover:text-[#0B5394] hover:bg-[#E3F2FD] rounded-lg transition-colors disabled:opacity-30"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 rounded-lg text-xs font-medium transition-all ${
                    p === page ? 'bg-[#0B5394] text-white' : 'text-[#64748B] hover:bg-[#F0F4F8]'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 text-[#64748B] hover:text-[#0B5394] hover:bg-[#E3F2FD] rounded-lg transition-colors disabled:opacity-30"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {modal?.type === 'create' && (
          <Modal title="新增应用" onClose={() => setModal(null)}>
            <AppForm initial={emptyForm} onSave={handleCreate} onCancel={() => setModal(null)} />
          </Modal>
        )}
        {modal?.type === 'edit' && (
          <Modal title="编辑应用" onClose={() => setModal(null)}>
            <AppForm
              initial={{
                system_name: modal.app.system_name,
                sys_category: modal.app.sys_category,
                cover_image: modal.app.cover_image,
                hw_support: modal.app.hw_support,
                hw_recommend: modal.app.hw_recommend,
                system_detail: modal.app.system_detail,
                status: modal.app.status,
                launch_url: modal.app.launch_url,
              }}
              onSave={handleEdit}
              onCancel={() => setModal(null)}
            />
          </Modal>
        )}
        {modal?.type === 'detail' && (
          <Modal title="应用详情" onClose={() => setModal(null)}>
            <DetailView app={modal.app} onClose={() => setModal(null)} />
          </Modal>
        )}
        {modal?.type === 'delete' && (
          <ConfirmDialog
            name={modal.app.system_name}
            onConfirm={handleDelete}
            onCancel={() => setModal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
