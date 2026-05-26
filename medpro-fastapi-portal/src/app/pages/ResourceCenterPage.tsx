import { useState, useEffect, useRef, ComponentType } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import {
  Search, BookOpen, Download, Eye, FileText, Video,
  Music, Image, Package, ChevronRight, Filter,
  LayoutGrid, List, Clock, ChevronDown, Play, X,
  ChevronLeft
} from 'lucide-react';
import { getResourceList, getResourceCategories, type Resource, type ResourceCategory } from '../../api/resource';

const TYPE_ICONS: Record<string, { icon: ComponentType<any>; color: string; bg: string }> = {
  pdf:  { icon: FileText, color: '#E53935', bg: '#FFEBEE' },
  mp4:  { icon: Video,    color: '#0B5394', bg: '#E3F2FD' },
  ppt:  { icon: FileText, color: '#F57F17', bg: '#FFF8E1' },
  pptx: { icon: FileText, color: '#F57F17', bg: '#FFF8E1' },
  docx: { icon: FileText, color: '#00897B', bg: '#E0F2F1' },
  doc:  { icon: FileText, color: '#00897B', bg: '#E0F2F1' },
  mp3:  { icon: Music,    color: '#6A1B9A', bg: '#F3E5F5' },
  exe:  { icon: Package,  color: '#455A64', bg: '#ECEFF1' },
};
const getTypeInfo = (fmt: string | null) => TYPE_ICONS[fmt?.toLowerCase() ?? ''] ?? { icon: FileText, color: '#64748B', bg: '#F0F4F8' };

const RESOURCE_TYPE_LABEL: Record<string, string> = {
  courseware: '课件', lesson_plan: '教案', micro_video: '微视频', ebook: '电子书', extension: '拓展资料',
};

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '-';
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

// Color palette for ebooks without a cover image
const BOOK_COLORS = ['#0B5394', '#00897B', '#6A1B9A', '#E65100', '#1565C0', '#880E4F', '#1B5E20', '#BF360C', '#283593', '#006064'];

export function ResourceCenterPage() {
  const [search, setSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState('全部');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [expandedCategories, setExpandedCategories] = useState<number[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<ResourceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [ebooks, setEbooks] = useState<Resource[]>([]);
  const [shelfOffset, setShelfOffset] = useState(0);
  const shelfRef = useRef<HTMLDivElement>(null);

  const types = ['全部', 'pdf', 'mp4', 'pptx', 'docx', 'ebook'];

  useEffect(() => {
    getResourceCategories().then(setCategories).catch(() => {});
    // 单独拉取电子书资源用于数字书架
    getResourceList({ pageNum: 1, pageSize: 20, status: '0', resourceType: 'ebook' })
      .then((res) => setEbooks(res.rows))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    getResourceList({
      pageNum: 1,
      pageSize: 100,
      status: '0',
      ...(selectedCategoryId ? { categoryId: selectedCategoryId } : {}),
    })
      .then((res) => { setResources(res.rows); setTotal(res.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedCategoryId]);

  const filtered = resources.filter((r) => {
    const matchSearch = (r.resourceName ?? '').toLowerCase().includes(search.toLowerCase());
    const matchType =
      selectedType === '全部' ||
      (selectedType === 'ebook'
        ? r.resourceType === 'ebook'
        : r.fileFormat?.toLowerCase() === selectedType.toLowerCase());
    return matchSearch && matchType;
  });

  const shelfScrollBy = (direction: 'prev' | 'next') => {
    const el = shelfRef.current;
    if (!el) return;
    const step = el.clientWidth * 0.7;
    if (direction === 'prev') {
      el.scrollBy({ left: -step, behavior: 'smooth' });
    } else {
      el.scrollBy({ left: step, behavior: 'smooth' });
    }
  };

  const [shelfCanPrev, setShelfCanPrev] = useState(false);
  const [shelfCanNext, setShelfCanNext] = useState(false);

  const handleShelfScroll = () => {
    const el = shelfRef.current;
    if (!el) return;
    setShelfCanPrev(el.scrollLeft > 4);
    setShelfCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    const el = shelfRef.current;
    if (!el) return;
    handleShelfScroll();
    el.addEventListener('scroll', handleShelfScroll);
    return () => el.removeEventListener('scroll', handleShelfScroll);
  }, [ebooks]);

  const toggleCategory = (id: number) => {
    setExpandedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

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
            {/* 左右翻页按钮 */}
            {ebooks.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => shelfScrollBy('prev')}
                  disabled={!shelfCanPrev}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 ${
                    shelfCanPrev
                      ? 'bg-white/10 border border-white/15 text-white hover:bg-[#0B5394] hover:border-[#0B5394] hover:shadow-md'
                      : 'bg-white/5 border border-white/8 text-white/20 cursor-not-allowed'
                  }`}
                >
                  <ChevronLeft size={15} />
                </button>
                <button
                  onClick={() => shelfScrollBy('next')}
                  disabled={!shelfCanNext}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 ${
                    shelfCanNext
                      ? 'bg-white/10 border border-white/15 text-white hover:bg-[#0B5394] hover:border-[#0B5394] hover:shadow-md'
                      : 'bg-white/5 border border-white/8 text-white/20 cursor-not-allowed'
                  }`}
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            )}
          </div>

          {ebooks.length > 0 ? (
            <div
              ref={shelfRef}
              className="flex gap-4 overflow-x-auto"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              onScroll={handleShelfScroll}
            >
              {ebooks.map((book, i) => {
                const color = BOOK_COLORS[i % BOOK_COLORS.length];
                return (
                  <motion.div
                    key={book.resourceId}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="group cursor-pointer flex-shrink-0"
                    style={{ width: 96 }}
                    onClick={() => book.fileUrl && window.open(book.fileUrl, '_blank', 'noopener,noreferrer')}
                  >
                    <div className="relative rounded-xl overflow-hidden mb-2 shadow-lg group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300">
                      {book.coverImage ? (
                        <div className="aspect-[3/4]">
                          <img
                            src={book.coverImage}
                            alt={book.resourceName ?? ''}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.display = 'none';
                              (e.currentTarget.nextSibling as HTMLElement).style.display = 'flex';
                            }}
                          />
                          <div className="aspect-[3/4] hidden items-center justify-center" style={{ backgroundColor: color + '22' }}>
                            <div className="absolute left-0 top-0 bottom-0 w-2 opacity-80" style={{ backgroundColor: color }} />
                            <BookOpen size={28} style={{ color }} className="opacity-60" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          </div>
                        </div>
                      ) : (
                        <div className="aspect-[3/4] relative flex items-center justify-center" style={{ backgroundColor: color + '22' }}>
                          <div className="absolute left-0 top-0 bottom-0 w-2 opacity-80" style={{ backgroundColor: color }} />
                          <BookOpen size={28} style={{ color }} className="opacity-60" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        </div>
                      )}
                    </div>
                    <p className="text-white text-xs font-medium text-center line-clamp-2 leading-snug">{book.resourceName}</p>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center">
              <BookOpen size={32} className="text-white/20 mx-auto mb-2" />
              <p className="text-white/40 text-sm">暂无电子书资源，请在后台资源管理中添加类型为「电子书」的资源</p>
            </div>
          )}
        </div>

        {/* Main Content: Sidebar + List */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Left Sidebar: Category Tree */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden h-fit">
            <div className="p-4 border-b border-[#E2E8F0] bg-[#F0F4F8]">
              <h3 className="text-[#1A2332] text-sm font-semibold">资源分类</h3>
            </div>
            <div className="p-2">
              <button
                onClick={() => setSelectedCategoryId(null)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors mb-1 ${
                  !selectedCategoryId ? 'bg-[#E3F2FD] text-[#0B5394]' : 'text-[#64748B] hover:bg-[#F0F4F8]'
                }`}
              >
                📂 全部资源
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.categoryId}
                  onClick={() => { setSelectedCategoryId(cat.categoryId); toggleCategory(cat.categoryId); }}
                  className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                    selectedCategoryId === cat.categoryId ? 'bg-[#E3F2FD] text-[#0B5394]' : 'text-[#4A5568] hover:bg-[#F0F4F8]'
                  }`}
                >
                  <span className="truncate flex-1 pr-2">📚 {cat.categoryName}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Resource List */}
          <div className="lg:col-span-3 space-y-4">
            {/* Toolbar */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 flex flex-wrap items-center gap-3">
              <div className="flex flex-wrap gap-2">
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
                    {type === 'ebook' ? '电子书' : type}
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

            {loading ? (
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 animate-pulse">
                    <div className="w-9 h-9 bg-[#E2E8F0] rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-[#E2E8F0] rounded w-2/3" />
                      <div className="h-2.5 bg-[#E2E8F0] rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
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
                    const typeInfo = getTypeInfo(res.fileFormat);
                    const TypeIcon = typeInfo.icon;
                    return (
                      <motion.div
                        key={res.resourceId}
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
                              {res.resourceName}
                            </p>
                            <p className="text-[#94A3B8] text-xs truncate">{res.description}</p>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <span className="px-2 py-0.5 rounded-md text-xs font-medium" style={{ backgroundColor: typeInfo.bg, color: typeInfo.color }}>
                            {res.fileFormat?.toUpperCase() ?? RESOURCE_TYPE_LABEL[res.resourceType ?? ''] ?? '-'}
                          </span>
                        </div>
                        <div className="col-span-2 hidden md:block text-[#64748B] text-xs">{formatFileSize(res.fileSize)}</div>
                        <div className="col-span-2 hidden md:block text-[#94A3B8] text-xs">{res.createTime?.slice(0, 10) ?? '-'}</div>
                        <div className="col-span-1 flex justify-end gap-1.5">
                          <button className="p-1.5 text-[#64748B] hover:text-[#0B5394] hover:bg-[#E3F2FD] rounded-lg transition-colors">
                            <Eye size={15} />
                          </button>
                          {res.allowDownload !== '0' && (
                            <button className="p-1.5 text-[#64748B] hover:text-[#0B5394] hover:bg-[#E3F2FD] rounded-lg transition-colors">
                              <Download size={15} />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((res, i) => {
                  const typeInfo = getTypeInfo(res.fileFormat);
                  const TypeIcon = typeInfo.icon;
                  return (
                    <motion.div
                      key={res.resourceId}
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
                          {res.resourceName}
                        </p>
                        <p className="text-[#64748B] text-xs line-clamp-1 mb-3">{res.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
                            <span>{formatFileSize(res.fileSize)}</span>
                            <span>·</span>
                            <span className="flex items-center gap-0.5"><Download size={11} />{res.downloadCount ?? 0}</span>
                          </div>
                          <div className="flex gap-1.5">
                            <button className="p-1.5 border border-[#E2E8F0] rounded-lg text-[#64748B] hover:text-[#0B5394] hover:border-[#0B5394] transition-colors">
                              <Eye size={14} />
                            </button>
                            {res.allowDownload !== '0' && (
                              <button className="p-1.5 bg-[#0B5394] rounded-lg text-white hover:bg-[#1565C0] transition-colors">
                                <Download size={14} />
                              </button>
                            )}
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
