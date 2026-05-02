import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight,
  X, Upload, BookOpen, Star, Users, CheckCircle, Clock,
  ToggleLeft, ToggleRight, Tag, Eye
} from 'lucide-react';
import { courses as initialCourses } from '../../data/mockData';

type Course = typeof initialCourses[0] & { status?: 'published' | 'draft' };

const CATEGORIES = ['基础医学', '临床医学', '药学', '护理学', '公共卫生'];
const DEPARTMENTS = ['基础医学院', '临床医学院', '药学院', '护理学院', '微生物学与免疫学', '生理学教研室', '外科学教研室'];
const PAGE_SIZE = 5;

const statusConfig = {
  published: { label: '已发布', color: 'text-[#2E7D32] bg-[#E8F5E9]', icon: CheckCircle },
  draft: { label: '草稿', color: 'text-[#64748B] bg-[#F0F4F8]', icon: Clock },
};

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
          <h3 className="text-[#1A2332] font-semibold">{title}</h3>
          <button onClick={onClose} className="p-2 text-[#94A3B8] hover:text-[#1A2332] hover:bg-[#F0F4F8] rounded-lg transition-colors"><X size={18} /></button>
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
          <button onClick={onCancel} className="flex-1 py-2.5 border border-[#E2E8F0] rounded-xl text-[#64748B] text-sm hover:bg-[#F0F4F8] transition-colors">取消</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 bg-[#E53935] text-white rounded-xl text-sm font-medium hover:bg-[#C62828] transition-colors">确认删除</button>
        </div>
      </motion.div>
    </div>
  );
}

type FormData = {
  title: string; subtitle: string; teacher: string; department: string;
  category: string; totalHours: string; chapters: string;
  description: string; status: 'published' | 'draft';
};

const emptyForm: FormData = {
  title: '', subtitle: '', teacher: '', department: '基础医学院',
  category: '基础医学', totalHours: '20', chapters: '10',
  description: '', status: 'draft',
};

export function CoursesManagePage() {
  const [data, setData] = useState<Course[]>(
    initialCourses.map(c => ({ ...c, status: 'published' as const }))
  );
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Course | null>(null);
  const [deleteItem, setDeleteItem] = useState<Course | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = data.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.title.includes(q) || c.teacher.includes(q) || c.department.includes(q);
    const matchCat = !filterCategory || c.category === filterCategory;
    const matchStatus = !filterStatus || c.status === filterStatus;
    return matchSearch && matchCat && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openCreate = () => { setForm(emptyForm); setEditItem(null); setShowForm(true); };
  const openEdit = (item: Course) => {
    setForm({
      title: item.title, subtitle: item.subtitle, teacher: item.teacher,
      department: item.department, category: item.category,
      totalHours: String(item.totalHours), chapters: String(item.chapters),
      description: item.description, status: item.status || 'draft',
    });
    setEditItem(item); setShowForm(true);
  };

  const handleSave = () => {
    if (editItem) {
      setData(prev => prev.map(c => c.id === editItem.id
        ? { ...c, ...form, totalHours: Number(form.totalHours), chapters: Number(form.chapters) } : c));
    } else {
      const newItem: Course = {
        ...emptyForm, ...form,
        totalHours: Number(form.totalHours), chapters: Number(form.chapters),
        id: String(Date.now()), students: 0, rating: 0, reviews: 0,
        publishDate: new Date().toISOString().slice(0, 10), outline: [],
        image: 'https://images.unsplash.com/photo-1764366795900-91fd1b07df83?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600',
      };
      setData(prev => [newItem, ...prev]);
    }
    setShowForm(false);
  };

  const handleDelete = () => {
    if (deleteItem) { setData(prev => prev.filter(c => c.id !== deleteItem.id)); setDeleteItem(null); }
  };

  const toggleStatus = (id: string) => {
    setData(prev => prev.map(c => c.id === id
      ? { ...c, status: c.status === 'published' ? 'draft' : 'published' } : c));
  };

  const toggleSelect = (id: string) => setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  const toggleAll = () => setSelected(prev => prev.length === paged.length ? [] : paged.map(c => c.id));

  const inputCls = "w-full px-3 py-2.5 border border-[#E2E8F0] rounded-xl text-sm text-[#1A2332] focus:outline-none focus:border-[#0B5394] bg-white";
  const selectCls = "w-full px-3 py-2.5 border border-[#E2E8F0] rounded-xl text-sm text-[#1A2332] focus:outline-none focus:border-[#0B5394] bg-white";

  const Field = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
    <div>
      <label className="block text-xs font-medium text-[#64748B] mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[#1A2332] font-bold" style={{ fontSize: '1.1rem' }}>课程管理</h1>
          <p className="text-[#64748B] text-sm mt-0.5">管理所有实验课程，共 <span className="text-[#6A1B9A] font-medium">{data.length}</span> 门</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-4 py-2 border border-[#E2E8F0] text-[#64748B] rounded-xl text-sm hover:bg-[#F0F4F8] transition-colors">
            <Upload size={14} /> 导出
          </button>
          <button onClick={openCreate} className="flex items-center gap-1.5 px-4 py-2 bg-[#6A1B9A] text-white rounded-xl text-sm font-medium hover:bg-[#7B1FA2] transition-colors">
            <Plus size={14} /> 新建课程
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: '课程总数', value: data.length, color: '#6A1B9A', bg: '#F3E5F5' },
          { label: '已发布', value: data.filter(c => c.status === 'published').length, color: '#2E7D32', bg: '#E8F5E9' },
          { label: '总学生数', value: data.reduce((a, c) => a + c.students, 0).toLocaleString(), color: '#0B5394', bg: '#E3F2FD' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-[#E2E8F0] p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: s.bg }}>
              <BookOpen size={18} style={{ color: s.color }} />
            </div>
            <div>
              <div className="text-[#1A2332] font-bold">{s.value}</div>
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
            <input type="text" placeholder="搜索课程名称、教师、院系…" value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#6A1B9A] bg-[#F8FAFC]" />
          </div>
          <select value={filterCategory} onChange={e => { setFilterCategory(e.target.value); setPage(1); }}
            className="px-3 py-2.5 border border-[#E2E8F0] rounded-xl text-sm text-[#64748B] focus:outline-none focus:border-[#6A1B9A] bg-[#F8FAFC]">
            <option value="">全部类别</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
            className="px-3 py-2.5 border border-[#E2E8F0] rounded-xl text-sm text-[#64748B] focus:outline-none focus:border-[#6A1B9A] bg-[#F8FAFC]">
            <option value="">全部状态</option>
            <option value="published">已发布</option>
            <option value="draft">草稿</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
        {selected.length > 0 && (
          <div className="flex items-center gap-3 px-5 py-3 bg-[#F3E5F5] border-b border-[#E2E8F0]">
            <span className="text-[#6A1B9A] text-sm font-medium">已选 {selected.length} 项</span>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-red-500 border border-red-200 rounded-lg text-sm hover:bg-red-50">
              <Trash2 size={13} /> 批量删除
            </button>
            <button onClick={() => setSelected([])} className="text-[#64748B] text-sm hover:text-[#1A2332]">取消</button>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                <th className="px-4 py-3"><input type="checkbox" checked={selected.length === paged.length && paged.length > 0} onChange={toggleAll} className="rounded" /></th>
                {['课程名称', '主讲教师', '院系', '类别', '章节/学时', '评分', '学生数', '状态', '操作'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[#94A3B8] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F4F8]">
              {paged.map(course => {
                const st = statusConfig[course.status || 'published'];
                const StatusIcon = st.icon;
                return (
                  <motion.tr key={course.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className={`hover:bg-[#F8FAFC] transition-colors ${selected.includes(course.id) ? 'bg-[#F0F4F8]' : ''}`}>
                    <td className="px-4 py-3"><input type="checkbox" checked={selected.includes(course.id)} onChange={() => toggleSelect(course.id)} className="rounded" /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
                          <img src={course.image} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="text-[#1A2332] text-sm font-medium max-w-[200px] truncate">{course.title}</div>
                          <div className="text-[#94A3B8] text-xs truncate max-w-[200px]">{course.subtitle}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#64748B] text-sm whitespace-nowrap">{course.teacher}</td>
                    <td className="px-4 py-3 text-[#64748B] text-sm whitespace-nowrap">{course.department}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-md font-medium bg-[#F3E5F5] text-[#6A1B9A]">{course.category}</span>
                    </td>
                    <td className="px-4 py-3 text-[#64748B] text-sm">{course.chapters}章 / {course.totalHours}学时</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Star size={13} className="text-[#F59E0B] fill-[#F59E0B]" />
                        <span className="text-[#1A2332] text-sm font-medium">{course.rating}</span>
                        <span className="text-[#94A3B8] text-xs">({course.reviews})</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-[#64748B] text-sm">
                        <Users size={13} /> {course.students.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1 w-fit px-2.5 py-1 rounded-lg text-xs font-medium ${st.color}`}>
                        <StatusIcon size={11} /> {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button title={course.status === 'published' ? '下线' : '发布'} onClick={() => toggleStatus(course.id)}
                          className={`p-1.5 rounded-lg transition-colors ${course.status === 'published' ? 'text-[#2E7D32] hover:bg-[#E8F5E9]' : 'text-[#94A3B8] hover:bg-[#F0F4F8]'}`}>
                          {course.status === 'published' ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                        </button>
                        <button onClick={() => openEdit(course)} className="p-1.5 text-[#64748B] hover:text-[#6A1B9A] hover:bg-[#F3E5F5] rounded-lg transition-colors"><Edit size={14} /></button>
                        <button onClick={() => setDeleteItem(course)} className="p-1.5 text-[#E53935] hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <BookOpen size={40} className="mx-auto text-[#CBD5E1] mb-3" />
              <p className="text-[#94A3B8] text-sm">暂无匹配的课程</p>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-t border-[#E2E8F0]">
          <span className="text-[#64748B] text-sm">显示 {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}-{Math.min(page * PAGE_SIZE, filtered.length)} / 共 {filtered.length} 条</span>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#64748B] hover:bg-[#F0F4F8] disabled:opacity-40"><ChevronLeft size={16} /></button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center transition-colors ${page === p ? 'bg-[#6A1B9A] text-white' : 'text-[#64748B] hover:bg-[#F0F4F8]'}`}>{p}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#64748B] hover:bg-[#F0F4F8] disabled:opacity-40"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <Modal title={editItem ? '编辑课程' : '新建课程'} onClose={() => setShowForm(false)}>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="课程名称" required>
                  <input className={inputCls} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="请输入课程名称" />
                </Field>
                <Field label="英文副标题">
                  <input className={inputCls} value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} placeholder="English subtitle" />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="主讲教师" required>
                  <input className={inputCls} value={form.teacher} onChange={e => setForm(f => ({ ...f, teacher: e.target.value }))} placeholder="如：王明远 教授" />
                </Field>
                <Field label="所属院系" required>
                  <select className={selectCls} value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Field label="课程类别">
                  <select className={selectCls} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="章节数">
                  <input type="number" className={inputCls} value={form.chapters} onChange={e => setForm(f => ({ ...f, chapters: e.target.value }))} min="1" />
                </Field>
                <Field label="总学时">
                  <input type="number" className={inputCls} value={form.totalHours} onChange={e => setForm(f => ({ ...f, totalHours: e.target.value }))} min="1" />
                </Field>
              </div>
              <Field label="课程简介" required>
                <textarea className={`${inputCls} resize-none`} rows={4} value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="请输入课程简介…" />
              </Field>
              <Field label="发布状态">
                <select className={selectCls} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as FormData['status'] }))}>
                  <option value="draft">草稿</option>
                  <option value="published">直接发布</option>
                </select>
              </Field>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-[#E2E8F0] rounded-xl text-[#64748B] text-sm hover:bg-[#F0F4F8] transition-colors">取消</button>
                <button onClick={handleSave} className="flex-1 py-2.5 bg-[#6A1B9A] text-white rounded-xl text-sm font-medium hover:bg-[#7B1FA2] transition-colors">{editItem ? '保存修改' : '创建课程'}</button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteItem && (
          <ConfirmDialog message={`确认删除课程「${deleteItem.title}」？删除后数据将无法恢复。`}
            onConfirm={handleDelete} onCancel={() => setDeleteItem(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
