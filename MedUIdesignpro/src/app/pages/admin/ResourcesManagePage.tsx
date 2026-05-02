import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight,
  X, Upload, FolderOpen, FileText, Video, File,
  Download, Filter
} from 'lucide-react';
import { resources as initialResources, courses } from '../../data/mockData';

type Resource = typeof initialResources[0];

const FILE_TYPES = ['PDF', 'VIDEO', 'PPT', 'DOCX', 'ZIP', 'EXE', 'OTHER'];
const PAGE_SIZE = 6;

const typeConfig: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  PDF: { color: '#E53935', bg: '#FFEBEE', icon: FileText },
  VIDEO: { color: '#6A1B9A', bg: '#F3E5F5', icon: Video },
  PPT: { color: '#E65100', bg: '#FFF3E0', icon: File },
  DOCX: { color: '#0B5394', bg: '#E3F2FD', icon: FileText },
  ZIP: { color: '#F57F17', bg: '#FFF8E1', icon: File },
  EXE: { color: '#2E7D32', bg: '#E8F5E9', icon: File },
  OTHER: { color: '#64748B', bg: '#F0F4F8', icon: File },
};

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
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
          <button onClick={onCancel} className="flex-1 py-2.5 border border-[#E2E8F0] rounded-xl text-[#64748B] text-sm hover:bg-[#F0F4F8]">取消</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 bg-[#E53935] text-white rounded-xl text-sm font-medium hover:bg-[#C62828]">确认删除</button>
        </div>
      </motion.div>
    </div>
  );
}

type FormData = {
  name: string; type: string; size: string;
  course: string; chapter: string; description: string;
};

const emptyForm: FormData = { name: '', type: 'PDF', size: '', course: '', chapter: '', description: '' };

export function ResourcesManagePage() {
  const [data, setData] = useState<Resource[]>(initialResources);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [editItem, setEditItem] = useState<Resource | null>(null);
  const [deleteItem, setDeleteItem] = useState<Resource | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [selected, setSelected] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const courseNames = [...new Set(courses.map(c => c.title))];

  const filtered = data.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.name.toLowerCase().includes(q) || r.course.toLowerCase().includes(q);
    const matchType = !filterType || r.type === filterType;
    const matchCourse = !filterCourse || r.course === filterCourse;
    return matchSearch && matchType && matchCourse;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openEdit = (item: Resource) => {
    setForm({ name: item.name, type: item.type, size: item.size, course: item.course, chapter: item.chapter, description: item.description });
    setEditItem(item); setShowForm(true);
  };

  const handleSave = () => {
    if (editItem) {
      setData(prev => prev.map(r => r.id === editItem.id ? { ...r, ...form } : r));
    } else {
      const newItem: Resource = {
        ...form, id: String(Date.now()),
        uploadDate: new Date().toISOString().slice(0, 10), downloads: 0,
      };
      setData(prev => [newItem, ...prev]);
    }
    setShowForm(false); setEditItem(null);
  };

  const handleDelete = () => {
    if (deleteItem) { setData(prev => prev.filter(r => r.id !== deleteItem.id)); setDeleteItem(null); }
  };

  const toggleSelect = (id: string) => setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  const toggleAll = () => setSelected(prev => prev.length === paged.length ? [] : paged.map(r => r.id));

  const inputCls = "w-full px-3 py-2.5 border border-[#E2E8F0] rounded-xl text-sm text-[#1A2332] focus:outline-none focus:border-[#E65100] bg-white";
  const selectCls = "w-full px-3 py-2.5 border border-[#E2E8F0] rounded-xl text-sm text-[#1A2332] focus:outline-none focus:border-[#E65100] bg-white";

  const Field = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
    <div>
      <label className="block text-xs font-medium text-[#64748B] mb-1.5">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      {children}
    </div>
  );

  const totalDownloads = data.reduce((a, r) => a + r.downloads, 0);

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[#1A2332] font-bold" style={{ fontSize: '1.1rem' }}>资源中心管理</h1>
          <p className="text-[#64748B] text-sm mt-0.5">管理所有教学资源文件，共 <span className="text-[#E65100] font-medium">{data.length}</span> 个资源</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowUpload(true)} className="flex items-center gap-1.5 px-4 py-2 border border-[#E2E8F0] text-[#64748B] rounded-xl text-sm hover:bg-[#F0F4F8] transition-colors">
            <Upload size={14} /> 上传资源
          </button>
          <button onClick={() => { setForm(emptyForm); setEditItem(null); setShowForm(true); }}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#E65100] text-white rounded-xl text-sm font-medium hover:bg-[#BF360C] transition-colors">
            <Plus size={14} /> 新增记录
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        {[
          { label: '资源总数', value: data.length, color: '#E65100', bg: '#FFF3E0' },
          { label: 'PDF文档', value: data.filter(r => r.type === 'PDF').length, color: '#E53935', bg: '#FFEBEE' },
          { label: '视频资源', value: data.filter(r => r.type === 'VIDEO').length, color: '#6A1B9A', bg: '#F3E5F5' },
          { label: '总下载次数', value: totalDownloads.toLocaleString(), color: '#0B5394', bg: '#E3F2FD' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-[#E2E8F0] p-4">
            <div className="text-[#1A2332] font-bold text-lg">{s.value}</div>
            <div className="text-[#94A3B8] text-xs">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 mb-5">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input type="text" placeholder="搜索资源名称、课程…" value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#E65100] bg-[#F8FAFC]" />
          </div>
          <select value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1); }}
            className="px-3 py-2.5 border border-[#E2E8F0] rounded-xl text-sm text-[#64748B] focus:outline-none focus:border-[#E65100] bg-[#F8FAFC]">
            <option value="">全部类型</option>
            {FILE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={filterCourse} onChange={e => { setFilterCourse(e.target.value); setPage(1); }}
            className="px-3 py-2.5 border border-[#E2E8F0] rounded-xl text-sm text-[#64748B] focus:outline-none focus:border-[#E65100] bg-[#F8FAFC] max-w-[200px]">
            <option value="">全部课程</option>
            {courseNames.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
        {selected.length > 0 && (
          <div className="flex items-center gap-3 px-5 py-3 bg-[#FFF3E0] border-b border-[#E2E8F0]">
            <span className="text-[#E65100] text-sm font-medium">已选 {selected.length} 项</span>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-red-500 border border-red-200 rounded-lg text-sm hover:bg-red-50">
              <Trash2 size={13} /> 批量删除
            </button>
            <button onClick={() => setSelected([])} className="text-[#64748B] text-sm">取消</button>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                <th className="px-4 py-3"><input type="checkbox" checked={selected.length === paged.length && paged.length > 0} onChange={toggleAll} className="rounded" /></th>
                {['资源名称', '类型', '大小', '所属课程', '所属章节', '下载数', '上传日期', '操作'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[#94A3B8] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F4F8]">
              {paged.map(res => {
                const tc = typeConfig[res.type] || typeConfig['OTHER'];
                const TypeIcon = tc.icon;
                return (
                  <motion.tr key={res.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className={`hover:bg-[#F8FAFC] transition-colors ${selected.includes(res.id) ? 'bg-[#F0F4F8]' : ''}`}>
                    <td className="px-4 py-3"><input type="checkbox" checked={selected.includes(res.id)} onChange={() => toggleSelect(res.id)} className="rounded" /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: tc.bg }}>
                          <TypeIcon size={15} style={{ color: tc.color }} />
                        </div>
                        <div>
                          <div className="text-[#1A2332] text-sm font-medium max-w-[200px] truncate">{res.name}</div>
                          <div className="text-[#94A3B8] text-xs truncate max-w-[200px]">{res.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-md font-medium" style={{ backgroundColor: tc.bg, color: tc.color }}>{res.type}</span>
                    </td>
                    <td className="px-4 py-3 text-[#64748B] text-sm">{res.size}</td>
                    <td className="px-4 py-3 text-[#64748B] text-sm max-w-[160px] truncate">{res.course}</td>
                    <td className="px-4 py-3 text-[#94A3B8] text-xs max-w-[140px] truncate">{res.chapter}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-[#64748B] text-sm">
                        <Download size={13} /> {res.downloads.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#94A3B8] text-xs whitespace-nowrap">{res.uploadDate}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(res)} className="p-1.5 text-[#64748B] hover:text-[#E65100] hover:bg-[#FFF3E0] rounded-lg transition-colors"><Edit size={14} /></button>
                        <button onClick={() => setDeleteItem(res)} className="p-1.5 text-[#E53935] hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <FolderOpen size={40} className="mx-auto text-[#CBD5E1] mb-3" />
              <p className="text-[#94A3B8] text-sm">暂无匹配的资源</p>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-t border-[#E2E8F0]">
          <span className="text-[#64748B] text-sm">显示 {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}-{Math.min(page * PAGE_SIZE, filtered.length)} / 共 {filtered.length} 条</span>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#64748B] hover:bg-[#F0F4F8] disabled:opacity-40"><ChevronLeft size={16} /></button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center transition-colors ${page === p ? 'bg-[#E65100] text-white' : 'text-[#64748B] hover:bg-[#F0F4F8]'}`}>{p}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#64748B] hover:bg-[#F0F4F8] disabled:opacity-40"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      {/* Edit / Add Form */}
      <AnimatePresence>
        {showForm && (
          <Modal title={editItem ? '编辑资源信息' : '新增资源记录'} onClose={() => setShowForm(false)}>
            <div className="p-6 space-y-4">
              <Field label="资源名称" required>
                <input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="请输入资源名称" />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="文件类型">
                  <select className={selectCls} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                    {FILE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="文件大小">
                  <input className={inputCls} value={form.size} onChange={e => setForm(f => ({ ...f, size: e.target.value }))} placeholder="如：2.4MB、512MB" />
                </Field>
              </div>
              <Field label="所属课程">
                <select className={selectCls} value={form.course} onChange={e => setForm(f => ({ ...f, course: e.target.value }))}>
                  <option value="">-- 请选择课程 --</option>
                  {courseNames.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="所属章节">
                <input className={inputCls} value={form.chapter} onChange={e => setForm(f => ({ ...f, chapter: e.target.value }))} placeholder="如：运动系统：骨骼与关节" />
              </Field>
              <Field label="资源描述">
                <textarea className={`${inputCls} resize-none`} rows={3} value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="请输入资源描述…" />
              </Field>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-[#E2E8F0] rounded-xl text-[#64748B] text-sm hover:bg-[#F0F4F8]">取消</button>
                <button onClick={handleSave} className="flex-1 py-2.5 bg-[#E65100] text-white rounded-xl text-sm font-medium hover:bg-[#BF360C]">{editItem ? '保存修改' : '添加资源'}</button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUpload && (
          <Modal title="上传资源文件" onClose={() => setShowUpload(false)}>
            <div className="p-6 space-y-4">
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); }}
                className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors cursor-pointer ${dragOver ? 'border-[#E65100] bg-[#FFF3E0]' : 'border-[#E2E8F0] hover:border-[#E65100] hover:bg-[#FFF8F5]'}`}
              >
                <div className="w-14 h-14 bg-[#FFF3E0] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Upload size={26} className="text-[#E65100]" />
                </div>
                <p className="text-[#1A2332] font-medium mb-1">点击或拖放文件到此处</p>
                <p className="text-[#94A3B8] text-sm">支持 PDF、PPT、Word、视频等格式，单文件最大 2GB</p>
                <button className="mt-4 px-6 py-2 bg-[#E65100] text-white rounded-xl text-sm font-medium hover:bg-[#BF360C] transition-colors">选择文件</button>
              </div>
              <div className="bg-[#F8FAFC] rounded-xl p-4">
                <h4 className="text-[#64748B] text-xs font-medium mb-2">上传说明</h4>
                <ul className="space-y-1">
                  {['上传完成后请及时补充资源描述和关联课程信息', '视频文件建议使用 MP4 格式（H.264 编码）', '文档类资源建议转换为 PDF 格式后上传'].map(tip => (
                    <li key={tip} className="text-[#94A3B8] text-xs flex items-start gap-1.5">
                      <span className="w-1 h-1 bg-[#94A3B8] rounded-full mt-1.5 flex-shrink-0" />{tip}
                    </li>
                  ))}
                </ul>
              </div>
              <button onClick={() => setShowUpload(false)} className="w-full py-2.5 border border-[#E2E8F0] rounded-xl text-[#64748B] text-sm hover:bg-[#F0F4F8]">关闭</button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteItem && (
          <ConfirmDialog message={`确认删除资源「${deleteItem.name}」？`}
            onConfirm={handleDelete} onCancel={() => setDeleteItem(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
