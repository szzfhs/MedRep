import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Plus, Edit, Trash2, Eye, Filter,
  FlaskConical, CheckCircle, XCircle, Clock,
  ChevronLeft, ChevronRight, X, Upload, Tag,
  MoreHorizontal, Globe, Monitor, ToggleLeft, ToggleRight
} from 'lucide-react';
import { experiments as initialExperiments } from '../../data/mockData';

type Experiment = typeof initialExperiments[0] & { status?: 'published' | 'draft' | 'review' };

const CATEGORIES = ['解剖学', '细胞生物学', '药理学', '外科学', '生理学', '神经科学', '微生物学'];
const TYPES = [{ value: 'WebGL', label: 'Web实验' }, { value: 'VR', label: 'VR客户端' }];
const PAGE_SIZE = 6;

const statusConfig = {
  published: { label: '已发布', color: 'text-[#2E7D32] bg-[#E8F5E9]', icon: CheckCircle },
  draft: { label: '草稿', color: 'text-[#64748B] bg-[#F0F4F8]', icon: Clock },
  review: { label: '审核中', color: 'text-[#F57F17] bg-[#FFF8E1]', icon: Clock },
};

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
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

function ConfirmDialog({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
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
        <p className="text-[#64748B] text-sm text-center mb-6">{message}</p>
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

type FormData = {
  title: string; subtitle: string; category: string; type: string;
  duration: string; publisher: string; description: string;
  requirements: string; devices: string; status: 'published' | 'draft' | 'review';
  tags: string;
};

const emptyForm: FormData = {
  title: '', subtitle: '', category: '解剖学', type: 'WebGL',
  duration: '2学时', publisher: '', description: '',
  requirements: '', devices: '', status: 'draft', tags: '',
};

export function ExperimentsManagePage() {
  const [data, setData] = useState<Experiment[]>(
    initialExperiments.map((e, i) => ({ ...e, status: i % 3 === 2 ? 'review' : 'published' as const }))
  );
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Experiment | null>(null);
  const [deleteItem, setDeleteItem] = useState<Experiment | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = data.filter(e => {
    const q = search.toLowerCase();
    const matchSearch = !q || e.title.includes(q) || e.publisher.includes(q) || e.category.includes(q);
    const matchCat = !filterCategory || e.category === filterCategory;
    const matchType = !filterType || e.type === filterType;
    const matchStatus = !filterStatus || e.status === filterStatus;
    return matchSearch && matchCat && matchType && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openCreate = () => { setForm(emptyForm); setEditItem(null); setShowForm(true); };
  const openEdit = (item: Experiment) => {
    setForm({
      title: item.title, subtitle: item.subtitle, category: item.category,
      type: item.type, duration: item.duration, publisher: item.publisher,
      description: item.description, requirements: item.requirements,
      devices: item.devices, status: item.status || 'draft',
      tags: item.tags.join(', '),
    });
    setEditItem(item);
    setShowForm(true);
  };

  const handleSave = () => {
    const tags = form.tags.split(/[,，]/).map(t => t.trim()).filter(Boolean);
    if (editItem) {
      setData(prev => prev.map(e => e.id === editItem.id ? { ...e, ...form, tags } : e));
    } else {
      const newItem: Experiment = {
        ...emptyForm, ...form, tags,
        id: String(Date.now()), participants: 0, views: 0,
        typeLabel: form.type === 'WebGL' ? 'Web实验' : 'VR客户端',
        publishDate: new Date().toISOString().slice(0, 10),
        launchUrl: '#', relatedCourse: '', materials: [],
        categoryColor: '#E3F2FD', categoryText: '#0B5394',
        image: 'https://images.unsplash.com/photo-1764366795900-91fd1b07df83?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
      };
      setData(prev => [newItem, ...prev]);
    }
    setShowForm(false);
  };

  const handleDelete = () => {
    if (deleteItem) {
      setData(prev => prev.filter(e => e.id !== deleteItem.id));
      setDeleteItem(null);
    }
  };

  const toggleStatus = (id: string) => {
    setData(prev => prev.map(e => e.id === id
      ? { ...e, status: e.status === 'published' ? 'draft' : 'published' } : e));
  };

  const toggleSelect = (id: string) => setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  const toggleAll = () => setSelected(prev => prev.length === paged.length ? [] : paged.map(e => e.id));

  const Field = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
    <div>
      <label className="block text-xs font-medium text-[#64748B] mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );

  const inputCls = "w-full px-3 py-2.5 border border-[#E2E8F0] rounded-xl text-sm text-[#1A2332] focus:outline-none focus:border-[#0B5394] bg-white";
  const selectCls = "w-full px-3 py-2.5 border border-[#E2E8F0] rounded-xl text-sm text-[#1A2332] focus:outline-none focus:border-[#0B5394] bg-white";

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[#1A2332] font-bold" style={{ fontSize: '1.1rem' }}>实验项目管理</h1>
          <p className="text-[#64748B] text-sm mt-0.5">管理所有虚拟仿真实验项目，共 <span className="text-[#0B5394] font-medium">{data.length}</span> 个</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-4 py-2 border border-[#E2E8F0] text-[#64748B] rounded-xl text-sm hover:bg-[#F0F4F8] transition-colors">
            <Upload size={14} /> 批量导入
          </button>
          <button onClick={openCreate} className="flex items-center gap-1.5 px-4 py-2 bg-[#0B5394] text-white rounded-xl text-sm font-medium hover:bg-[#1565C0] transition-colors">
            <Plus size={14} /> 新增实验
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 mb-5">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input type="text" placeholder="搜索实验名称、发布科室…" value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#0B5394] bg-[#F8FAFC]" />
          </div>
          <select value={filterCategory} onChange={e => { setFilterCategory(e.target.value); setPage(1); }}
            className="px-3 py-2.5 border border-[#E2E8F0] rounded-xl text-sm text-[#64748B] focus:outline-none focus:border-[#0B5394] bg-[#F8FAFC]">
            <option value="">全部类别</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1); }}
            className="px-3 py-2.5 border border-[#E2E8F0] rounded-xl text-sm text-[#64748B] focus:outline-none focus:border-[#0B5394] bg-[#F8FAFC]">
            <option value="">全部类型</option>
            {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
            className="px-3 py-2.5 border border-[#E2E8F0] rounded-xl text-sm text-[#64748B] focus:outline-none focus:border-[#0B5394] bg-[#F8FAFC]">
            <option value="">全部状态</option>
            <option value="published">已发布</option>
            <option value="draft">草稿</option>
            <option value="review">审核中</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
        {selected.length > 0 && (
          <div className="flex items-center gap-3 px-5 py-3 bg-[#E3F2FD] border-b border-[#E2E8F0]">
            <span className="text-[#0B5394] text-sm font-medium">已选 {selected.length} 项</span>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-red-500 border border-red-200 rounded-lg text-sm hover:bg-red-50 transition-colors">
              <Trash2 size={13} /> 批量删除
            </button>
            <button onClick={() => setSelected([])} className="text-[#64748B] text-sm hover:text-[#1A2332]">取消选择</button>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                <th className="px-4 py-3">
                  <input type="checkbox" checked={selected.length === paged.length && paged.length > 0}
                    onChange={toggleAll} className="rounded" />
                </th>
                {['实验名称', '类别 / 类型', '发布科室', '学时', '参与人数', '状态', '发布日期', '操作'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[#94A3B8] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F4F8]">
              {paged.map((exp) => {
                const st = statusConfig[exp.status || 'published'];
                const StatusIcon = st.icon;
                return (
                  <motion.tr key={exp.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className={`hover:bg-[#F8FAFC] transition-colors ${selected.includes(exp.id) ? 'bg-[#F0F4F8]' : ''}`}>
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.includes(exp.id)}
                        onChange={() => toggleSelect(exp.id)} className="rounded" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-[#E3F2FD]">
                          <img src={exp.image} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="text-[#1A2332] text-sm font-medium max-w-[220px] truncate">{exp.title}</div>
                          <div className="text-[#94A3B8] text-xs truncate max-w-[220px]">{exp.subtitle}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs px-2 py-0.5 rounded-md font-medium w-fit" style={{ backgroundColor: exp.categoryColor, color: exp.categoryText }}>{exp.category}</span>
                        <span className="flex items-center gap-1 text-xs text-[#64748B]">
                          {exp.type === 'WebGL' ? <Globe size={11} /> : <Monitor size={11} />} {exp.typeLabel}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#64748B] text-sm">{exp.publisher}</td>
                    <td className="px-4 py-3 text-[#64748B] text-sm">{exp.duration}</td>
                    <td className="px-4 py-3 text-[#1A2332] text-sm font-medium">{exp.participants.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1 w-fit px-2.5 py-1 rounded-lg text-xs font-medium ${st.color}`}>
                        <StatusIcon size={11} /> {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#94A3B8] text-xs whitespace-nowrap">{exp.publishDate}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button title={exp.status === 'published' ? '点击下线' : '点击发布'}
                          onClick={() => toggleStatus(exp.id)}
                          className={`p-1.5 rounded-lg transition-colors ${exp.status === 'published' ? 'text-[#2E7D32] hover:bg-[#E8F5E9]' : 'text-[#94A3B8] hover:bg-[#F0F4F8]'}`}>
                          {exp.status === 'published' ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                        </button>
                        <button onClick={() => openEdit(exp)} className="p-1.5 text-[#64748B] hover:text-[#0B5394] hover:bg-[#E3F2FD] rounded-lg transition-colors" title="编辑">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => setDeleteItem(exp)} className="p-1.5 text-[#E53935] hover:bg-red-50 rounded-lg transition-colors" title="删除">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <FlaskConical size={40} className="mx-auto text-[#CBD5E1] mb-3" />
              <p className="text-[#94A3B8] text-sm">暂无匹配的实验项目</p>
            </div>
          )}
        </div>
        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-[#E2E8F0]">
          <span className="text-[#64748B] text-sm">
            显示 {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}-{Math.min(page * PAGE_SIZE, filtered.length)} / 共 {filtered.length} 条
          </span>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#64748B] hover:bg-[#F0F4F8] disabled:opacity-40 transition-colors">
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center transition-colors ${page === p ? 'bg-[#0B5394] text-white' : 'text-[#64748B] hover:bg-[#F0F4F8]'}`}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#64748B] hover:bg-[#F0F4F8] disabled:opacity-40 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <Modal title={editItem ? '编辑实验项目' : '新增实验项目'} onClose={() => setShowForm(false)}>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="实验名称" required>
                  <input className={inputCls} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="请输入实验名称" />
                </Field>
                <Field label="英文副标题">
                  <input className={inputCls} value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} placeholder="English subtitle" />
                </Field>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Field label="学科类别" required>
                  <select className={selectCls} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="实验类型" required>
                  <select className={selectCls} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                    {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </Field>
                <Field label="学时">
                  <select className={selectCls} value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}>
                    {['1学时', '2学时', '3学时', '4学时', '6学时'].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="发布科室" required>
                  <input className={inputCls} value={form.publisher} onChange={e => setForm(f => ({ ...f, publisher: e.target.value }))} placeholder="如：解剖学教研室" />
                </Field>
                <Field label="发布状态">
                  <select className={selectCls} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as FormData['status'] }))}>
                    <option value="draft">草稿</option>
                    <option value="review">提交审核</option>
                    <option value="published">直接发布</option>
                  </select>
                </Field>
              </div>
              <Field label="实验简介" required>
                <textarea className={`${inputCls} resize-none`} rows={3} value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="请输入实验项目简介…" />
              </Field>
              <Field label="运行要求">
                <input className={inputCls} value={form.requirements}
                  onChange={e => setForm(f => ({ ...f, requirements: e.target.value }))} placeholder="如：Chrome浏览器 90+，WebGL 2.0支持" />
              </Field>
              <Field label="支持设备">
                <input className={inputCls} value={form.devices}
                  onChange={e => setForm(f => ({ ...f, devices: e.target.value }))} placeholder="如：Windows PC / macOS / Web浏览器" />
              </Field>
              <Field label="标签（逗号分隔）">
                <div className="relative">
                  <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                  <input className={`${inputCls} pl-8`} value={form.tags}
                    onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="如：心脏, 循环系统, 3D仿真" />
                </div>
              </Field>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-[#E2E8F0] rounded-xl text-[#64748B] text-sm hover:bg-[#F0F4F8] transition-colors">
                  取消
                </button>
                <button onClick={handleSave} className="flex-1 py-2.5 bg-[#0B5394] text-white rounded-xl text-sm font-medium hover:bg-[#1565C0] transition-colors">
                  {editItem ? '保存修改' : '创建实验'}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Confirm Delete */}
      <AnimatePresence>
        {deleteItem && (
          <ConfirmDialog
            message={`确认删除实验「${deleteItem.title}」？删除后数据将无法恢复。`}
            onConfirm={handleDelete}
            onCancel={() => setDeleteItem(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
