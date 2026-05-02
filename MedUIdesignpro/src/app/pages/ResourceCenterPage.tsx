import { useState, ComponentType } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import {
  Search, BookOpen, Download, Eye, FileText, Video,
  Music, Image, Package, ChevronRight, Filter,
  LayoutGrid, List, Clock, ChevronDown, Play, X
} from 'lucide-react';
import { resources, courses } from '../data/mockData';

const TYPE_ICONS: Record<string, { icon: ComponentType<any>; color: string; bg: string }> = {
  PDF: { icon: FileText, color: '#E53935', bg: '#FFEBEE' },
  VIDEO: { icon: Video, color: '#0B5394', bg: '#E3F2FD' },
  PPT: { icon: FileText, color: '#F57F17', bg: '#FFF8E1' },
  DOCX: { icon: FileText, color: '#00897B', bg: '#E0F2F1' },
  AUDIO: { icon: Music, color: '#6A1B9A', bg: '#F3E5F5' },
  IMAGE: { icon: Image, color: '#1565C0', bg: '#E3F2FD' },
  EXE: { icon: Package, color: '#455A64', bg: '#ECEFF1' },
};

// Digital bookshelf books mock
const books = [
  { title: '人体解剖学', edition: '第9版', color: '#0B5394', img: 'https://images.unsplash.com/photo-1764366795900-91fd1b07df83?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200' },
  { title: '生理学', edition: '第9版', color: '#00897B', img: 'https://images.unsplash.com/photo-1758691462620-9018c602ed3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200' },
  { title: '病理学', edition: '第8版', color: '#6A1B9A', img: 'https://images.unsplash.com/photo-1774277602359-d5dfed73aa98?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200' },
  { title: '药理学', edition: '第8版', color: '#E65100', img: 'https://images.unsplash.com/photo-1743767588158-72174d1898a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200' },
  { title: '微生物学', edition: '第8版', color: '#1565C0', img: 'https://images.unsplash.com/photo-1658555012297-edb48f0c2d4c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200' },
  { title: '外科学', edition: '第9版', color: '#880E4F', img: 'https://images.unsplash.com/photo-1758653500549-faa71e7c4c2a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200' },
];

export function ResourceCenterPage() {
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState('全部');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [expandedCourses, setExpandedCourses] = useState<string[]>(['1']);

  const types = ['全部', 'PDF', 'VIDEO', 'PPT', 'DOCX'];

  const filtered = resources.filter((r) => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase());
    const matchType = selectedType === '全部' || r.type === selectedType;
    const matchCourse = !selectedCourse || r.course === selectedCourse;
    return matchSearch && matchType && matchCourse;
  });

  const toggleCourse = (title: string) => {
    setExpandedCourses(prev =>
      prev.includes(title) ? prev.filter(c => c !== title) : [...prev, title]
    );
  };

  const courseTitle = (id: string) => courses.find(c => c.id === id)?.title || '';

  return (
    <div className="min-h-screen bg-[#F0F4F8]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0B2848] to-[#00695C] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-center gap-2 text-white/50 text-sm mb-3">
            <Link to="/" className="hover:text-white">首页</Link>
            <ChevronRight size={14} />
            <span className="text-white/80">资源中心</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <BookOpen size={22} className="text-[#80DEEA]" />
                </div>
                <h1 className="text-white" style={{ fontSize: '1.75rem', fontWeight: 700 }}>资源中心</h1>
              </div>
              <p className="text-white/60 text-sm">数字教材、课件、视频等教学资源一站式获取</p>
            </div>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="搜索资源名称…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-80 pl-9 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 text-sm focus:outline-none focus:bg-white/15 focus:border-white/40 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Digital Bookshelf */}
        <div className="bg-gradient-to-br from-[#0B1929] to-[#1A2332] rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <BookOpen size={18} className="text-[#42A5F5]" />
              数字教材书架
            </h2>
            <button className="text-[#42A5F5] text-xs hover:text-white transition-colors">
              查看全部 →
            </button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {books.map((book, i) => (
              <motion.div
                key={book.title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="group cursor-pointer"
              >
                <div className="relative rounded-xl overflow-hidden mb-2 shadow-lg group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300">
                  <div className="aspect-[3/4] relative">
                    <img src={book.img} alt={book.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    {/* Spine effect */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-2 opacity-80"
                      style={{ backgroundColor: book.color }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <div className="flex items-center justify-center w-8 h-8 mx-auto bg-white/90 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play size={14} className="text-[#0B5394] ml-0.5" fill="currentColor" />
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-white text-xs font-medium text-center truncate">{book.title}</p>
                <p className="text-[#64748B] text-xs text-center">{book.edition}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Main Content: Sidebar + List */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Left Sidebar: Tree */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden h-fit">
            <div className="p-4 border-b border-[#E2E8F0] bg-[#F0F4F8]">
              <h3 className="text-[#1A2332] text-sm font-semibold">课程章节目录</h3>
            </div>
            <div className="p-2">
              {/* All Resources */}
              <button
                onClick={() => setSelectedCourse(null)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors mb-1 ${
                  !selectedCourse ? 'bg-[#E3F2FD] text-[#0B5394]' : 'text-[#64748B] hover:bg-[#F0F4F8]'
                }`}
              >
                📂 全部资源
              </button>
              {courses.map((course) => (
                <div key={course.id}>
                  <button
                    onClick={() => { toggleCourse(course.id); setSelectedCourse(course.id); }}
                    className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                      selectedCourse === course.id ? 'bg-[#E3F2FD] text-[#0B5394]' : 'text-[#4A5568] hover:bg-[#F0F4F8]'
                    }`}
                  >
                    <span className="truncate flex-1 pr-2">📚 {course.title}</span>
                    <ChevronDown
                      size={13}
                      className={`flex-shrink-0 transition-transform ${expandedCourses.includes(course.id) ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {expandedCourses.includes(course.id) && (
                    <div className="ml-4 border-l border-[#E2E8F0] pl-2 my-1">
                      {course.outline.slice(0, 5).map((ch) => (
                        <button
                          key={ch.id}
                          className="w-full text-left px-2 py-1.5 text-xs text-[#64748B] hover:text-[#0B5394] hover:bg-[#F0F4F8] rounded-lg transition-colors truncate"
                        >
                          {ch.title}
                        </button>
                      ))}
                      {course.outline.length > 5 && (
                        <button className="px-2 py-1 text-xs text-[#1E88E5]">
                          +{course.outline.length - 5} 更多…
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Resource List */}
          <div className="lg:col-span-3 space-y-4">
            {/* Toolbar */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 flex flex-wrap items-center gap-3">
              <div className="flex gap-2">
                {types.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedType === type
                        ? 'bg-[#0B5394] text-white'
                        : 'bg-[#F0F4F8] text-[#64748B] hover:bg-[#E3F2FD] hover:text-[#0B5394]'
                    }`}
                  >
                    {TYPE_ICONS[type] && (() => {
                      const TypeIcon = TYPE_ICONS[type as keyof typeof TYPE_ICONS].icon;
                      return (
                        <span style={{ color: selectedType === type ? 'white' : TYPE_ICONS[type].color }}>
                          <TypeIcon size={12} />
                        </span>
                      );
                    })()}
                    {type}
                  </button>
                ))}
              </div>
              <div className="ml-auto flex items-center gap-2">
                <span className="text-[#64748B] text-xs">{filtered.length} 个资源</span>
                <div className="flex border border-[#E2E8F0] rounded-lg overflow-hidden">
                  <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-[#0B5394] text-white' : 'bg-white text-[#64748B]'} transition-colors`}>
                    <LayoutGrid size={14} />
                  </button>
                  <button onClick={() => setViewMode('list')} className={`p-2 ${viewMode === 'list' ? 'bg-[#0B5394] text-white' : 'bg-white text-[#64748B]'} transition-colors`}>
                    <List size={14} />
                  </button>
                </div>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#E2E8F0] py-16 text-center">
                <BookOpen size={40} className="text-[#CBD5E1] mx-auto mb-3" />
                <p className="text-[#64748B]">暂无匹配资源</p>
              </div>
            ) : viewMode === 'list' ? (
              <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
                <div className="grid grid-cols-12 gap-4 px-5 py-2.5 bg-[#F0F4F8] border-b border-[#E2E8F0] text-xs text-[#94A3B8] font-medium">
                  <span className="col-span-5">资源名称</span>
                  <span className="col-span-2">类型</span>
                  <span className="col-span-2 hidden md:block">大小</span>
                  <span className="col-span-2 hidden md:block">上传时间</span>
                  <span className="col-span-1 text-right">操作</span>
                </div>
                <div className="divide-y divide-[#F0F4F8]">
                  {filtered.map((res, i) => {
                    const typeInfo = TYPE_ICONS[res.type] || TYPE_ICONS['DOCX'];
                    const TypeIcon = typeInfo.icon;
                    return (
                      <motion.div
                        key={res.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="grid grid-cols-12 gap-4 px-5 py-3.5 items-center hover:bg-[#F8FAFC] transition-colors group"
                      >
                        <div className="col-span-5 flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: typeInfo.bg }}>
                            <TypeIcon size={18} style={{ color: typeInfo.color }} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[#1A2332] text-sm font-medium truncate group-hover:text-[#0B5394] transition-colors">
                              {res.name}
                            </p>
                            <p className="text-[#94A3B8] text-xs truncate">{res.description}</p>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <span className="px-2 py-0.5 rounded-md text-xs font-medium" style={{ backgroundColor: typeInfo.bg, color: typeInfo.color }}>
                            {res.type}
                          </span>
                        </div>
                        <div className="col-span-2 hidden md:block text-[#64748B] text-xs">{res.size}</div>
                        <div className="col-span-2 hidden md:block text-[#94A3B8] text-xs">{res.uploadDate}</div>
                        <div className="col-span-1 flex justify-end gap-1.5">
                          <button className="p-1.5 text-[#64748B] hover:text-[#0B5394] hover:bg-[#E3F2FD] rounded-lg transition-colors">
                            <Eye size={15} />
                          </button>
                          <button className="p-1.5 text-[#64748B] hover:text-[#0B5394] hover:bg-[#E3F2FD] rounded-lg transition-colors">
                            <Download size={15} />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((res, i) => {
                  const typeInfo = TYPE_ICONS[res.type] || TYPE_ICONS['DOCX'];
                  const TypeIcon = typeInfo.icon;
                  return (
                    <motion.div
                      key={res.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="group bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden hover:shadow-md hover:border-[#1E88E5]/30 transition-all"
                    >
                      <div className="h-28 flex items-center justify-center" style={{ backgroundColor: typeInfo.bg }}>
                        <TypeIcon size={48} style={{ color: typeInfo.color }} className="opacity-60" />
                      </div>
                      <div className="p-4">
                        <p className="text-[#1A2332] text-sm font-medium mb-1 line-clamp-1 group-hover:text-[#0B5394] transition-colors">
                          {res.name}
                        </p>
                        <p className="text-[#64748B] text-xs line-clamp-1 mb-3">{res.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
                            <span>{res.size}</span>
                            <span>·</span>
                            <span className="flex items-center gap-0.5"><Download size={11} />{res.downloads}</span>
                          </div>
                          <div className="flex gap-1.5">
                            <button className="p-1.5 border border-[#E2E8F0] rounded-lg text-[#64748B] hover:text-[#0B5394] hover:border-[#0B5394] transition-colors">
                              <Eye size={14} />
                            </button>
                            <button className="p-1.5 bg-[#0B5394] rounded-lg text-white hover:bg-[#1565C0] transition-colors">
                              <Download size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}