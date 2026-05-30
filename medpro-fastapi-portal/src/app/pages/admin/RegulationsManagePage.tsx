import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Plus, Edit, Trash2, X, Shield,
  FileText, CheckCircle, Clock, Paperclip, ToggleLeft, ToggleRight,
  Download, Eye
} from 'lucide-react';
import {
  getAdminRegulationList, createRegulation, updateRegulation, deleteRegulation,
  AdminRegulation, SaveRegulationParams,
} from '@/api/school-admin';

interface Reg {
  _id: number;
  id: string;
  title: string;
  category: string;
  date: string;
  attachment: boolean;
  content: string;
  status: 'published' | 'draft';
}

function mapApiReg(r: AdminRegulation): Reg {
  return {
    _id: r.regId,
    id: String(r.regId),
    title: r.title,
    category: r.category ?? '',
    date: r.publishDate?.slice(0, 10) ?? r.createTime?.slice(0, 10) ?? '',
    attachment: r.hasAttachment,
    content: r.content ?? '',
    status: r.status === '1' ? 'published' : 'draft',
  };
}

const CATEGORIES = ['管理规定', '管理办法', '操作规范', '工作流程', '用户协议', '政策文件'];

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
          <h3 className="text-[#1A2332] font-semibold">{title}</h3>
          <button onClick={onClose} className="p-2 text-[#94A3B8] hover:text-[#1A2332] hover:bg-[#F0F4F8] rounded-lg"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </motion.div>
    </div>
  );
}

function ConfirmDialog({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4"><Trash2 size={22} className="text-[#E53935]" /></div>
        <h3 className="text-[#1A2332] font-semibold text-center mb-2">确认删除</h3>
        <p className="text-[#64748B] text-sm text-center mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 border border-[#E2E8F0] rounded-xl text-[#64748B] text-sm hover:bg-[#F0F4F8]">取消</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 bg-[#E53935] text-white rounded-xl text-sm font-medium hover:bg-[#C62828]">确认删除</button>
        </div>
      </motion.div>
    </div>
  );
}

type FormData = { title: string; category: string; date: string; attachment: boolean; content: string; status: 'published' | 'draft' };
const emptyForm: FormData = {
  title: '', category: '管理规定',
  date: new Date().toISOString().slice(0, 10),
  attachment: false, content: '', status: 'published',
};

export function RegulationsManagePage() {
  const [data, setData] = useState<Reg[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Reg | null>(null);
  const [deleteItem, setDeleteItem] = useState<Reg | null>(null);
  const [viewItem, setViewItem] = useState<Reg | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAdminRegulationList({ pageSize: 9999 });
      setData((result.rows ?? []).map(mapApiReg));
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = data.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.title.includes(q) || r.category.includes(q);
    const matchCat = !filterCategory || r.category === filterCategory;
    return matchSearch && matchCat;
  });

  const openEdit = (item: Reg) => {
    setForm({ title: item.title, category: item.category, date: item.date,
      attachment: item.attachment, content: item.content || '', status: item.status || 'published' });
    setEditItem(item); setShowForm(true);
  };

  const handleSave = async () => {
    const params: SaveRegulationParams = {
      title: form.title,
      category: form.category,
      publishDate: form.date,
      hasAttachment: form.attachment,
      content: form.content,
      status: form.status === 'published' ? '1' : '0',
    };
    try {
      if (editItem) {
        await updateRegulation({ ...params, regId: editItem._id });
      } else {
        await createRegulation(params);
      }
      setShowForm(false); setEditItem(null);
      fetchData();
    } catch {/* ignore */}
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      await deleteRegulation(deleteItem._id);
      setDeleteItem(null);
      fetchData();
    } catch {/* ignore */}
  };

  const toggleStatus = async (id: string) => {
    const item = data.find(r => r.id === id);
    if (!item) return;
    try {
      await updateRegulation({ regId: item._id, status: item.status === 'published' ? '0' : '1' });
      fetchData();
    } catch {/* ignore */}
  };

  const inputCls = "w-full px-3 py-2.5 border border-[#E2E8F0] rounded-xl text-sm text-[#1A2332] focus:outline-none focus:border-[#0B5394] bg-white";
  const selectCls = "w-full px-3 py-2.5 border border-[#E2E8F0] rounded-xl text-sm text-[#1A2332] focus:outline-none focus:border-[#0B5394] bg-white";
  const Field = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
    <div>
      <label className="block text-xs font-medium text-[#64748B] mb-1.5">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      {children}
    </div>
  );

  const categoryColors: Record<string, string> = {
    '管理规定': 'text-[#0B5394] bg-[#E3F2FD]',
    '管理办法': 'text-[#6A1B9A] bg-[#F3E5F5]',
    '操作规范': 'text-[#2E7D32] bg-[#E8F5E9]',
    '工作流程': 'text-[#F57F17] bg-[#FFF8E1]',
    '用户协议': 'text-[#64748B] bg-[#F0F4F8]',
    '政策文件': 'text-[#E53935] bg-[#FFEBEE]',
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[#1A2332] font-bold" style={{ fontSize: '1.1rem' }}>规章制度管理</h1>
          <p className="text-[#64748B] text-sm mt-0.5">管理实验室规章制度与政策文件，共 <span className="text-[#0B5394] font-medium">{data.length}</span> 条</p>
        </div>
        <button onClick={() => { setForm(emptyForm); setEditItem(null); setShowForm(true); }}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#0B5394] text-white rounded-xl text-sm font-medium hover:bg-[#1565C0] transition-colors self-start">
          <Plus size={14} /> 新增制度
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: '制度总数', value: data.length, color: '#0B5394', bg: '#E3F2FD' },
          { label: '已发布', value: data.filter(r => r.status === 'published').length, color: '#2E7D32', bg: '#E8F5E9' },
          { label: '含附件', value: data.filter(r => r.attachment).length, color: '#F57F17', bg: '#FFF8E1' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-[#E2E8F0] p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: s.bg }}>
              <Shield size={18} style={{ color: s.color }} />
            </div>
            <div>
              <div className="text-[#1A2332] font-bold text-xl">{s.value}</div>
              <div className="text-[#94A3B8] text-xs">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 mb-5">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input type="text" placeholder="搜索制度名称…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#0B5394] bg-[#F8FAFC]" />
          </div>
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
            className="px-3 py-2.5 border border-[#E2E8F0] rounded-xl text-sm text-[#64748B] focus:outline-none focus:border-[#0B5394] bg-[#F8FAFC]">
            <option value="">全部类别</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                {['序号', '制度名称', '类别', '发布/修订日期', '附件', '状态', '操作'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[#94A3B8] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F4F8]">
              {filtered.map((reg, i) => (
                <motion.tr key={reg.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="px-4 py-4">
                    <div className="w-7 h-7 bg-[#E3F2FD] rounded-lg flex items-center justify-center">
                      <span className="text-[#0B5394] text-xs font-bold">{i + 1}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-[#E3F2FD] rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText size={15} className="text-[#0B5394]" />
                      </div>
                      <span className="text-[#1A2332] text-sm font-medium">{reg.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-lg font-medium ${categoryColors[reg.category] || 'text-[#64748B] bg-[#F0F4F8]'}`}>{reg.category}</span>
                  </td>
                  <td className="px-4 py-4 text-[#64748B] text-sm">{reg.date}</td>
                  <td className="px-4 py-4">
                    {reg.attachment ? (
                      <div className="flex items-center gap-1.5">
                        <Paperclip size={13} className="text-[#0B5394]" />
                        <button className="text-[#0B5394] text-xs hover:underline flex items-center gap-1">
                          <Download size={11} /> 下载
                        </button>
                      </div>
                    ) : (
                      <span className="text-[#CBD5E1] text-xs">无附件</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`flex items-center gap-1 w-fit px-2.5 py-1 rounded-lg text-xs font-medium ${reg.status === 'published' ? 'text-[#2E7D32] bg-[#E8F5E9]' : 'text-[#64748B] bg-[#F0F4F8]'}`}>
                      {reg.status === 'published' ? <CheckCircle size={11} /> : <Clock size={11} />}
                      {reg.status === 'published' ? '已发布' : '草稿'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setViewItem(reg)} className="p-1.5 text-[#64748B] hover:text-[#0B5394] hover:bg-[#E3F2FD] rounded-lg transition-colors" title="预览">
                        <Eye size={14} />
                      </button>
                      <button title={reg.status === 'published' ? '下线' : '发布'} onClick={() => toggleStatus(reg.id)}
                        className={`p-1.5 rounded-lg transition-colors ${reg.status === 'published' ? 'text-[#2E7D32] hover:bg-[#E8F5E9]' : 'text-[#94A3B8] hover:bg-[#F0F4F8]'}`}>
                        {reg.status === 'published' ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                      </button>
                      <button onClick={() => openEdit(reg)} className="p-1.5 text-[#64748B] hover:text-[#0B5394] hover:bg-[#E3F2FD] rounded-lg transition-colors"><Edit size={14} /></button>
                      <button onClick={() => setDeleteItem(reg)} className="p-1.5 text-[#E53935] hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <Shield size={40} className="mx-auto text-[#CBD5E1] mb-3" />
              <p className="text-[#94A3B8] text-sm">暂无匹配的规章制度</p>
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <Modal title={editItem ? '编辑规章制度' : '新增规章制度'} onClose={() => setShowForm(false)}>
            <div className="p-6 space-y-4">
              <Field label="制度名称" required>
                <input className={inputCls} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="请输入规章制度名称" />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="制度类别">
                  <select className={selectCls} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="发布/修订日期">
                  <input type="date" className={inputCls} value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                </Field>
              </div>
              <Field label="制度内容">
                <textarea className={`${inputCls} resize-none`} rows={5} value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="请输入规章制度正文内容…" />
              </Field>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.attachment} onChange={e => setForm(f => ({ ...f, attachment: e.target.checked }))} className="rounded" />
                  <span className="text-[#64748B] text-sm">包含附件（PDF文件）</span>
                </label>
              </div>
              <Field label="发布状态">
                <select className={selectCls} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as FormData['status'] }))}>
                  <option value="draft">草稿</option>
                  <option value="published">立即发布</option>
                </select>
              </Field>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-[#E2E8F0] rounded-xl text-[#64748B] text-sm hover:bg-[#F0F4F8]">取消</button>
                <button onClick={handleSave} className="flex-1 py-2.5 bg-[#0B5394] text-white rounded-xl text-sm font-medium hover:bg-[#1565C0]">{editItem ? '保存修改' : '发布制度'}</button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* View Modal */}
      <AnimatePresence>
        {viewItem && (
          <Modal title="制度详情" onClose={() => setViewItem(null)}>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#E3F2FD] rounded-xl flex items-center justify-center">
                  <FileText size={18} className="text-[#0B5394]" />
                </div>
                <div>
                  <h3 className="text-[#1A2332] font-semibold">{viewItem.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${categoryColors[viewItem.category] || 'text-[#64748B] bg-[#F0F4F8]'}`}>{viewItem.category}</span>
                    <span className="text-[#94A3B8] text-xs">{viewItem.date}</span>
                  </div>
                </div>
              </div>
              {viewItem.content ? (
                <div className="bg-[#F8FAFC] rounded-xl p-4">
                  <p className="text-[#64748B] text-sm leading-relaxed whitespace-pre-wrap">{viewItem.content}</p>
                </div>
              ) : (
                <div className="bg-[#F8FAFC] rounded-xl p-8 text-center">
                  <FileText size={32} className="mx-auto text-[#CBD5E1] mb-2" />
                  <p className="text-[#94A3B8] text-sm">暂无正文内容，请编辑添加</p>
                </div>
              )}
              {viewItem.attachment && (
                <div className="flex items-center justify-between p-3 bg-[#E3F2FD] rounded-xl">
                  <div className="flex items-center gap-2">
                    <Paperclip size={15} className="text-[#0B5394]" />
                    <span className="text-[#0B5394] text-sm">附件文件</span>
                  </div>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0B5394] text-white rounded-lg text-xs hover:bg-[#1565C0]">
                    <Download size={12} /> 下载
                  </button>
                </div>
              )}
            </div>
          </Modal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteItem && (
          <ConfirmDialog message={`确认删除「${deleteItem.title}」？`}
            onConfirm={handleDelete} onCancel={() => setDeleteItem(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
