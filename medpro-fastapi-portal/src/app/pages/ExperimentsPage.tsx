import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import {
  Search, FlaskConical, Users, Clock, Play, Eye,
  SlidersHorizontal, X, Monitor, Cpu, ChevronRight,
  Filter, LayoutGrid, List, Star
} from 'lucide-react';
import { getExperimentList, type Experiment } from '../../api/experiment';

// 分类色板（按索引循环）
const COLOR_PALETTE = [
  { bg: '#E3F2FD', text: '#0B5394' }, { bg: '#E0F2F1', text: '#00695C' },
  { bg: '#F3E5F5', text: '#6A1B9A' }, { bg: '#FFF3E0', text: '#E65100' },
  { bg: '#E8F5E9', text: '#2E7D32' }, { bg: '#FCE4EC', text: '#880E4F' },
  { bg: '#E1F5FE', text: '#01579B' }, { bg: '#FFF8E1', text: '#F57F17' },
];
const getCategoryColor = (name: string | null, idx: number) => COLOR_PALETTE[idx % COLOR_PALETTE.length];

const types = ['全部类型', 'Web实验', 'VR客户端'];
const sortOptions = ['默认排序', '参与人数最多', '最新上线'];

// 辅助函数：后端字段映射到展示字段
function mapExpType(expType: string | null) {
  if (expType === 'exe') return { type: 'EXE', typeLabel: 'VR客户端', icon: 'Cpu' };
  return { type: 'WebGL', typeLabel: 'Web实验', icon: 'Monitor' };
}

export function ExperimentsPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('全部');
  const [activeType, setActiveType] = useState('全部类型');
  const [sortBy, setSortBy] = useState('默认排序');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getExperimentList({ pageNum: 1, pageSize: 100, status: '1' })
      .then((res) => {
        setExperiments(res.rows);
        setTotal(res.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // 动态分类列表
  const categories = ['全部', ...Array.from(new Set(experiments.map((e) => e.categoryName).filter(Boolean) as string[]))];

  const filtered = experiments.filter((exp) => {
    const name = exp.expName ?? '';
    const desc = exp.description ?? '';
    const matchSearch = name.includes(search) || desc.includes(search);
    const matchCategory = activeCategory === '全部' || exp.categoryName === activeCategory;
    const { typeLabel } = mapExpType(exp.expType);
    const matchType = activeType === '全部类型' || typeLabel === activeType;
    return matchSearch && matchCategory && matchType;
  });

  // 排序
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === '参与人数最多') return (b.participateCount ?? 0) - (a.participateCount ?? 0);
    if (sortBy === '最新上线') return (b.createTime ?? '').localeCompare(a.createTime ?? '');
    return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
  });

  return (
    <div className="min-h-screen bg-[#F0F4F8]">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-[#0B1929] to-[#0B3A6B] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-center gap-2 text-white/50 text-sm mb-3">
            <Link to="/" className="hover:text-white transition-colors">首页</Link>
            <ChevronRight size={14} />
            <span className="text-white/80">虚拟仿真实验</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <FlaskConical size={22} className="text-[#42A5F5]" />
                </div>
                <h1 className="text-white" style={{ fontSize: '1.75rem', fontWeight: 700 }}>
                  虚拟仿真实验项目
                </h1>
              </div>
              <p className="text-white/60 text-sm">
                共 {total} 个实验项目，涵盖基础医学、临床医学、药学等多个学科领域
              </p>
            </div>
            {/* Search bar */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="搜索实验名称或关键词…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-72 pl-9 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 text-sm focus:outline-none focus:bg-white/20 transition-all"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X size={14} className="text-white/60" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Filter Bar */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 mb-6">
          <div className="flex flex-col gap-4">
            {/* Category pills */}
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              <span className="text-[#64748B] text-xs font-medium whitespace-nowrap flex-shrink-0">学科分类</span>
              <div className="flex gap-2 overflow-x-auto pb-0.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`flex-shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeCategory === cat
                        ? 'bg-[#0B5394] text-white'
                        : 'bg-[#F0F4F8] text-[#64748B] hover:bg-[#E3F2FD] hover:text-[#0B5394]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Type + Sort + View */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[#64748B] text-xs font-medium">实验类型</span>
                <div className="flex gap-1.5">
                  {types.map((type) => (
                    <button
                      key={type}
                      onClick={() => setActiveType(type)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                        activeType === type
                          ? 'bg-[#E3F2FD] text-[#0B5394] border border-[#0B5394]/30'
                          : 'bg-[#F0F4F8] text-[#64748B] hover:bg-[#E3F2FD] hover:text-[#0B5394]'
                      }`}
                    >
                      {type === 'Web实验' ? <Monitor size={12} /> : type === 'VR客户端' ? <Cpu size={12} /> : null}
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-xs text-[#64748B] bg-[#F0F4F8] border border-[#E2E8F0] rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#0B5394]"
                >
                  {sortOptions.map(o => <option key={o}>{o}</option>)}
                </select>
                <div className="flex border border-[#E2E8F0] rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-[#0B5394] text-white' : 'bg-white text-[#64748B] hover:bg-[#F0F4F8]'} transition-colors`}
                  >
                    <LayoutGrid size={15} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-[#0B5394] text-white' : 'bg-white text-[#64748B] hover:bg-[#F0F4F8]'} transition-colors`}
                  >
                    <List size={15} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-[#64748B] text-sm">
            {search || activeCategory !== '全部' || activeType !== '全部类型' ? (
              <>找到 <span className="text-[#0B5394] font-medium">{sorted.length}</span> 个匹配实验</>
            ) : (
              <>共 <span className="text-[#0B5394] font-medium">{total}</span> 个实验项目</>
            )}
          </p>
          {(search || activeCategory !== '全部' || activeType !== '全部类型') && (
            <button
              onClick={() => { setSearch(''); setActiveCategory('全部'); setActiveType('全部类型'); }}
              className="flex items-center gap-1 text-xs text-[#E53935] hover:text-red-700"
            >
              <X size={12} /> 清除筛选
            </button>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="h-48 bg-[#E2E8F0]" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-[#E2E8F0] rounded w-3/4" />
                  <div className="h-3 bg-[#E2E8F0] rounded w-full" />
                  <div className="h-3 bg-[#E2E8F0] rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-20">
            <FlaskConical size={48} className="text-[#CBD5E1] mx-auto mb-4" />
            <p className="text-[#64748B] text-base font-medium">未找到匹配的实验项目</p>
            <p className="text-[#94A3B8] text-sm mt-2">请尝试修改搜索关键词或筛选条件</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {sorted.map((exp, i) => {
              const { type, typeLabel } = mapExpType(exp.expType);
              const { bg, text } = getCategoryColor(exp.categoryName, i);
              return (
              <motion.div
                key={exp.expId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="group bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden hover:shadow-lg hover:border-[#1E88E5]/30 transition-all duration-300"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={exp.coverImage || '/placeholder.svg'}
                    alt={exp.expName ?? ''}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <span
                    className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-xs font-medium"
                    style={{ backgroundColor: bg, color: text }}
                  >
                    {exp.categoryName ?? '其他'}
                  </span>
                  <span className={`absolute top-3 right-3 px-2 py-1 rounded-md text-xs font-medium text-white flex items-center gap-1 ${
                    type === 'WebGL' ? 'bg-[#0B5394]' : 'bg-[#6A1B9A]'
                  }`}>
                    {type === 'WebGL' ? <Monitor size={11} /> : <Cpu size={11} />}
                    {typeLabel}
                  </span>
                  <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      to={`/experiments/${exp.expId}`}
                      className="flex items-center gap-1.5 px-3 py-2 bg-white/90 backdrop-blur-sm text-[#0B5394] rounded-lg text-xs font-medium"
                    >
                      <Eye size={13} /> 详情
                    </Link>
                    <button className="flex items-center gap-1.5 px-3 py-2 bg-[#0B5394] text-white rounded-lg text-xs font-medium">
                      <Play size={13} /> 启动
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <Link to={`/experiments/${exp.expId}`}>
                    <h3 className="text-[#1A2332] text-sm font-semibold mb-1 line-clamp-1 group-hover:text-[#0B5394] transition-colors">
                      {exp.expName}
                    </h3>
                  </Link>
                  <p className="text-[#64748B] text-xs line-clamp-2 mb-3 leading-relaxed">
                    {exp.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                    <span className="flex items-center gap-1"><Users size={12} />{(exp.participateCount ?? 0).toLocaleString()}人</span>
                    <span className="flex items-center gap-1"><Eye size={12} />{(exp.viewCount ?? 0).toLocaleString()}</span>
                    <span className="flex items-center gap-1"><Clock size={12} />{exp.expDuration ? `${exp.expDuration}分钟` : '-'}</span>
                  </div>
                </div>
              </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map((exp, i) => {
              const { type, typeLabel } = mapExpType(exp.expType);
              const { bg, text } = getCategoryColor(exp.categoryName, i);
              return (
              <motion.div
                key={exp.expId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="group bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden hover:shadow-md hover:border-[#1E88E5]/30 transition-all"
              >
                <div className="flex gap-0">
                  <div className="relative w-40 sm:w-52 flex-shrink-0">
                    <img
                      src={exp.coverImage || '/placeholder.svg'}
                      alt={exp.expName ?? ''}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10" />
                  </div>
                  <div className="flex-1 p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-md text-xs font-medium" style={{ backgroundColor: bg, color: text }}>
                          {exp.categoryName ?? '其他'}
                        </span>
                        <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium text-white ${
                          type === 'WebGL' ? 'bg-[#0B5394]' : 'bg-[#6A1B9A]'
                        }`}>
                          {type === 'WebGL' ? <Monitor size={11} /> : <Cpu size={11} />}
                          {typeLabel}
                        </span>
                      </div>
                      <Link to={`/experiments/${exp.expId}`}>
                        <h3 className="text-[#1A2332] font-semibold mb-1.5 group-hover:text-[#0B5394] transition-colors">
                          {exp.expName}
                        </h3>
                      </Link>
                      <p className="text-[#64748B] text-sm line-clamp-2 leading-relaxed">
                        {exp.description}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
                      <div className="flex items-center gap-4 text-xs text-[#94A3B8]">
                        <span className="flex items-center gap-1"><Users size={12} />{(exp.participateCount ?? 0).toLocaleString()} 人参与</span>
                        <span className="flex items-center gap-1"><Eye size={12} />{(exp.viewCount ?? 0).toLocaleString()} 浏览</span>
                        <span className="flex items-center gap-1"><Clock size={12} />{exp.expDuration ? `${exp.expDuration}分钟` : '-'}</span>
                        <span className="text-[#64748B]">发布：{exp.createTime?.slice(0, 10) ?? '-'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/experiments/${exp.expId}`}
                          className="px-4 py-2 border border-[#0B5394] text-[#0B5394] rounded-lg text-xs hover:bg-[#E3F2FD] transition-colors"
                        >
                          查看详情
                        </Link>
                        <button className="flex items-center gap-1.5 px-4 py-2 bg-[#0B5394] text-white rounded-lg text-xs hover:bg-[#1565C0] transition-colors">
                          <Play size={12} /> 启动实验
                        </button>
                      </div>
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
  );
}
