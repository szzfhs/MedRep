import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight,
  X, Eye, CheckCircle, Clock, Newspaper, ToggleLeft, ToggleRight
} from 'lucide-react';
import { news as initialNews } from '../../data/mockData';

type NewsItem = typeof initialNews[0] & { status?: 'published' | 'draft' };

const CATEGORIES = ['重要新闻', '教学通知', '平台动态', '培训通知', '合作交流', '规章制度'];
const PAGE_SIZE = 5;

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
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

type FormData = { title: string; category: string; author: string; summary: string; content: string; status: 'published' | 'draft' };
const emptyForm: FormData = { title: '', category: '平台动态', author: '', summary: '', content: '', status: 'draft' };

export function NewsManagePage() {
  const [data, setData] = useState<NewsItem[]>(
    initialNews.map(n => ({ ...n, status: 'published' as const }))
  );
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<NewsItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<NewsItem | null>(null);
  const [viewItem, setViewItem] = useState<NewsItem | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);

  const filtered = data.filter(n => {
    const q = search.toLowerCase();
    const matchSearch = !q || n.title.includes(q) || n.author.includes(q) || n.category.includes(q);
    const matchCat = !filterCategory || n.category === filterCategory;
    const matchStatus = !filterStatus || n.status === filterStatus;
    return matchSearch && matchCat && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openEdit = (item: NewsItem) => {
    setForm({ title: item.title, category: item.category, author: item.author,
      summary: item.summary || '', content: item.content || '', status: item.status || 'draft' });
    setEditItem(item); setShowForm(true);
  };

  const handleSave = () => {
    if (editItem) {
      setData(prev => prev.map(n => n.id === editItem.id ? { ...n, ...form } : n));
    } else {
      const newItem: NewsItem = {
        ...form, id: String(Date.now()),
        date: new Date().toISOString().slice(0, 10), views: 0,
        image: 'https://images.unsplash.com/photo-1617246610501-d11b4829436b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
      };
      setData(prev => [newItem, ...prev]);
    }
    setShowForm(false); setEditItem(null);
  };

  const handleDelete = () => {
    if (deleteItem) { setData(prev => prev.filter(n => n.id !== deleteItem.id)); setDeleteItem(null); }
  };

  const toggleStatus = (id: string) => {
    setData(prev => prev.map(n => n.id === id ? { ...n, status: n.status === 'published' ? 'draft' : 'published' } : n));
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
    '重要新闻': 'text-[#E53935] bg-[#FFEBEE]',
    '教学通知': 'text-[#0B5394] bg-[#E3F2FD]',
    '平台动态': 'text-[#2E7D32] bg-[#E8F5E9]',
    '培训通知': 'text-[#F57F17] bg-[#FFF8E1]',
    '合作交流': 'text-[#6A1B9A] bg-[#F3E5F5]',
    '规章制度': 'text-[#64748B] bg-[#F0F4F8]',
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[#1A2332] font-bold" style={{ fontSize: '1.1rem' }}>新闻资讯管理</h1>
          <p className="text-[#64748B] text-sm mt-0.5">管理所有新闻动态与通知公告，共 <span className="text-[#0B5394] font-medium">{data.length}</span> 条</p>
        </div>
        <button onClick={() => { setForm(emptyForm); setEditItem(null); setShowForm(true); }}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#0B5394] text-white rounded-xl text-sm font-medium hover:bg-[#1565C0] transition-colors self-start">
          <Plus size={14} /> 发布新闻
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 mb-5">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input type="text" placeholder="搜索标题、作者…" value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#0B5394] bg-[#F8FAFC]" />
          </div>
          <select value={filterCategory} onChange={e => { setFilterCategory(e.target.value); setPage(1); }}
            className="px-3 py-2.5 border border-[#E2E8F0] rounded-xl text-sm text-[#64748B] focus:outline-none focus:border-[#0B5394] bg-[#F8FAFC]">
            <option value="">全部类别</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
            className="px-3 py-2.5 border border-[#E2E8F0] rounded-xl text-sm text-[#64748B] focus:outline-none focus:border-[#0B5394] bg-[#F8FAFC]">
            <option value="">全部状态</option>
            <option value="published">已发布</option>
            <option value="draft">草稿</option>
          </select>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {paged.map(item => (
          <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-[#E2E8F0] p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-16 h-14 rounded-xl overflow-hidden flex-shrink-0">
                <img src={item.image} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${categoryColors[item.category] || 'text-[#64748B] bg-[#F0F4F8]'}`}>
                        {item.category}
                      </span>
                      <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-md font-medium ${item.status === 'published' ? 'text-[#2E7D32] bg-[#E8F5E9]' : 'text-[#64748B] bg-[#F0F4F8]'}`}>
                        {item.status === 'published' ? <CheckCircle size={10} /> : <Clock size={10} />}
                        {item.status === 'published' ? '已发布' : '草稿'}
                      </span>
                    </div>
                    <h3 className="text-[#1A2332] font-medium text-sm line-clamp-1">{item.title}</h3>
                    <p className="text-[#94A3B8] text-xs mt-0.5 line-clamp-1">{item.summary}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => setViewItem(item)} className="p-1.5 text-[#64748B] hover:text-[#0B5394] hover:bg-[#E3F2FD] rounded-lg transition-colors" title="预览">
                      <Eye size={14} />
                    </button>
                    <button title={item.status === 'published' ? '下线' : '发布'} onClick={() => toggleStatus(item.id)}
                      className={`p-1.5 rounded-lg transition-colors ${item.status === 'published' ? 'text-[#2E7D32] hover:bg-[#E8F5E9]' : 'text-[#94A3B8] hover:bg-[#F0F4F8]'}`}>
                      {item.status === 'published' ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                    </button>
                    <button onClick={() => openEdit(item)} className="p-1.5 text-[#64748B] hover:text-[#0B5394] hover:bg-[#E3F2FD] rounded-lg transition-colors"><Edit size={14} /></button>
                    <button onClick={() => setDeleteItem(item)} className="p-1.5 text-[#E53935] hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-2 text-[#94A3B8] text-xs">
                  <span>{item.author}</span>
                  <span>{item.date}</span>
                  <span className="flex items-center gap-1"><Eye size={11} /> {item.views.toLocaleString()} 浏览</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="py-16 text-center bg-white rounded-2xl border border-[#E2E8F0]">
            <Newspaper size={40} className="mx-auto text-[#CBD5E1] mb-3" />
            <p className="text-[#94A3B8] text-sm">暂无匹配的新闻资讯</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-1">
          <span className="text-[#64748B] text-sm">第 {page} / {totalPages} 页，共 {filtered.length} 条</span>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#64748B] hover:bg-white hover:shadow-sm disabled:opacity-40"><ChevronLeft size={16} /></button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center transition-colors ${page === p ? 'bg-[#0B5394] text-white' : 'bg-white text-[#64748B] hover:shadow-sm'}`}>{p}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#64748B] hover:bg-white hover:shadow-sm disabled:opacity-40"><ChevronRight size={16} /></button>
          </div>
        </div>
      )}

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <Modal title={editItem ? '编辑新闻' : '发布新闻'} onClose={() => setShowForm(false)}>
            <div className="p-6 space-y-4">
              <Field label="新闻标题" required>
                <input className={inputCls} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="请输入新闻标题" />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="新闻类别">
                  <select className={selectCls} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="作者/来源">
                  <input className={inputCls} value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} placeholder="如：宣传部、教务处" />
                </Field>
              </div>
              <Field label="新闻摘要">
                <textarea className={`${inputCls} resize-none`} rows={2} value={form.summary}
                  onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} placeholder="简要描述新闻内容（将显示在列表页）" />
              </Field>
              <Field label="正文内容" required>
                <textarea className={`${inputCls} resize-none`} rows={6} value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="请输入完整新闻内容…" />
              </Field>
              <Field label="发布状态">
                <select className={selectCls} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as FormData['status'] }))}>
                  <option value="draft">草稿（暂不发布）</option>
                  <option value="published">立即发布</option>
                </select>
              </Field>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-[#E2E8F0] rounded-xl text-[#64748B] text-sm hover:bg-[#F0F4F8]">取消</button>
                <button onClick={handleSave} className="flex-1 py-2.5 bg-[#0B5394] text-white rounded-xl text-sm font-medium hover:bg-[#1565C0]">{editItem ? '保存修改' : '发布新闻'}</button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {viewItem && (
          <Modal title="新闻预览" onClose={() => setViewItem(null)}>
            <div className="p-6">
              <div className="h-40 rounded-xl overflow-hidden mb-5">
                <img src={viewItem.image} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${categoryColors[viewItem.category] || 'text-[#64748B] bg-[#F0F4F8]'}`}>{viewItem.category}</span>
              </div>
              <h2 className="text-[#1A2332] font-semibold mb-2">{viewItem.title}</h2>
              <div className="flex items-center gap-3 text-[#94A3B8] text-xs mb-4">
                <span>{viewItem.author}</span>
                <span>{viewItem.date}</span>
                <span className="flex items-center gap-1"><Eye size={11} /> {viewItem.views}</span>
              </div>
              <p className="text-[#64748B] text-sm leading-relaxed">{viewItem.content || viewItem.summary}</p>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteItem && (
          <ConfirmDialog message={`确认删除新闻「${deleteItem.title}」？`}
            onConfirm={handleDelete} onCancel={() => setDeleteItem(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
