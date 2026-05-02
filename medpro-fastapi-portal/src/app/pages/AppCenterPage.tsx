import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AppWindow, Search, Eye, Play, X, Monitor, Layers,
  ChevronLeft, ChevronRight, ExternalLink, Cpu, Tag,
  Gauge, BookOpen, CheckCircle, XCircle, Globe, Loader2,
} from 'lucide-react';
import {
  SimSystem as ApiSimSystem,
  getSimSystemList,
} from '../../api/sim_system';
import {
  SimSystem, SYS_CATEGORIES, HW_LABELS, HwSupport,
} from '../data/appsData';

/* ──────────────────────────── adapter ──────────────────────────── */

function adaptApiSystem(api: ApiSimSystem): SimSystem {
  const hwList = (api.hwSupport ?? '')
    .split(',')
    .map(s => s.trim())
    .filter((s): s is HwSupport => s === 'helmet' || s === 'pc' || s === 'zspace' || s === 'webgl');
  // Admin convention: status '1'=启用(active), '0'=停用(disabled)
  // UI convention (SimSystem type): status '0'=active, '1'=paused → flip
  const uiStatus: '0' | '1' = api.status === '1' ? '0' : '1';
  return {
    sim_system_id: api.simSystemId,
    system_name: api.systemName,
    system_detail: api.systemDetail ?? '',
    cover_image: api.coverImage ?? '',
    hw_recommend: api.hwRecommend ?? '',
    hw_support: hwList,
    sys_category: api.sysCategory ?? '',
    view_count: api.viewCount ?? 0,
    status: uiStatus,
    create_by: '',
    create_time: api.createTime ?? '',
    images: api.images.map((url, i) => ({
      image_id: i,
      sim_system_id: api.simSystemId,
      image_url: url,
      sort_order: i,
    })),
    exp_count: api.expCount ?? 0,
    launch_url: '',
  };
}

/* ──────────────────────────── helpers ──────────────────────────── */

function HwBadge({ hw }: { hw: HwSupport }) {
  const cfg = HW_LABELS[hw];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
      {hw === 'helmet' && '🥽'}
      {hw === 'pc' && '🖥️'}
      {hw === 'zspace' && '📐'}
      {hw === 'webgl' && '🌐'}
      {cfg.label}
    </span>
  );
}

/* ──────────────────────────── Launch Modal ──────────────────────── */

function LaunchModal({ app, onClose }: { app: SimSystem; onClose: () => void }) {
  const [launching, setLaunching] = useState(false);
  const [launched, setLaunched] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);

  const handleLaunch = async () => {
    setLaunching(true);
    await new Promise(r => setTimeout(r, 2000));
    setLaunching(false);
    setLaunched(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-[#0B5394] to-[#1E88E5] rounded-xl flex items-center justify-center">
              <AppWindow size={18} className="text-white" />
            </div>
            <div>
              <h3 className="text-[#1A2332] font-semibold text-base">{app.system_name}</h3>
              <p className="text-[#64748B] text-xs">{app.sys_category}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#94A3B8] hover:text-[#1A2332] hover:bg-[#F0F4F8] rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {/* Image gallery */}
          {app.images.length > 0 && (
            <div className="relative bg-[#0B1929] h-52 overflow-hidden">
              <img
                src={app.images[imgIdx]?.image_url}
                alt={app.system_name}
                className="w-full h-full object-cover opacity-90"
              />
              {app.images.length > 1 && (
                <>
                  <button
                    onClick={() => setImgIdx(i => (i - 1 + app.images.length) % app.images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setImgIdx(i => (i + 1) % app.images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {app.images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setImgIdx(i)}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${i === imgIdx ? 'bg-white w-4' : 'bg-white/50'}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          <div className="p-6 space-y-5">
            {/* Meta info row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#F8FAFC] rounded-xl p-3 text-center">
                <Eye size={16} className="text-[#64748B] mx-auto mb-1" />
                <div className="text-[#1A2332] font-semibold text-sm">{app.view_count.toLocaleString()}</div>
                <div className="text-[#94A3B8] text-xs">浏览次数</div>
              </div>
              <div className="bg-[#F8FAFC] rounded-xl p-3 text-center">
                <BookOpen size={16} className="text-[#64748B] mx-auto mb-1" />
                <div className="text-[#1A2332] font-semibold text-sm">{app.exp_count}</div>
                <div className="text-[#94A3B8] text-xs">关联实验</div>
              </div>
              <div className="bg-[#F8FAFC] rounded-xl p-3 text-center">
                <Layers size={16} className="text-[#64748B] mx-auto mb-1" />
                <div className="text-[#1A2332] font-semibold text-sm">{app.sys_category}</div>
                <div className="text-[#94A3B8] text-xs">所属分类</div>
              </div>
            </div>

            {/* Supported hardware */}
            <div>
              <h4 className="text-[#1A2332] text-sm font-medium mb-2 flex items-center gap-2">
                <Monitor size={14} className="text-[#0B5394]" /> 支持平台
              </h4>
              <div className="flex flex-wrap gap-2">
                {app.hw_support.map(hw => <HwBadge key={hw} hw={hw} />)}
              </div>
            </div>

            {/* Hardware recommend */}
            <div>
              <h4 className="text-[#1A2332] text-sm font-medium mb-2 flex items-center gap-2">
                <Cpu size={14} className="text-[#0B5394]" /> 硬件配置要求
              </h4>
              <p className="text-[#475569] text-sm bg-[#F8FAFC] rounded-xl px-4 py-3 border border-[#E2E8F0]">
                {app.hw_recommend}
              </p>
            </div>

            {/* System detail */}
            <div>
              <h4 className="text-[#1A2332] text-sm font-medium mb-2 flex items-center gap-2">
                <Tag size={14} className="text-[#0B5394]" /> 系统简介
              </h4>
              <div
                className="text-[#475569] text-sm leading-relaxed space-y-2 [&>p]:text-sm"
                dangerouslySetInnerHTML={{ __html: app.system_detail }}
              />
            </div>
          </div>
        </div>

        {/* Footer / Launch */}
        <div className="px-6 py-4 border-t border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between gap-4">
          {launched ? (
            <div className="flex items-center gap-2 text-[#2E7D32] text-sm font-medium">
              <CheckCircle size={18} />
              应用已在新标签页中启动
            </div>
          ) : (
            <div className="text-[#64748B] text-xs flex items-center gap-1.5">
              <Globe size={13} />
              启动后将在新标签页中打开
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 border border-[#E2E8F0] text-[#64748B] rounded-xl text-sm hover:bg-white transition-colors"
            >
              关闭
            </button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleLaunch}
              disabled={launching || launched}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium shadow-md transition-colors ${
                launched
                  ? 'bg-[#2E7D32] text-white cursor-default'
                  : 'bg-[#0B5394] hover:bg-[#1565C0] text-white shadow-[#0B5394]/20'
              } disabled:opacity-80`}
            >
              {launching ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  正在启动…
                </>
              ) : launched ? (
                <>
                  <CheckCircle size={16} /> 已启动
                </>
              ) : (
                <>
                  <Play size={16} fill="currentColor" /> 立即启动
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ──────────────────────────── App Card ──────────────────────────── */

function AppCard({ app, onLaunch }: { app: SimSystem; onLaunch: (a: SimSystem) => void }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#E2E8F0] hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col group"
    >
      {/* Cover */}
      <div className="relative h-44 overflow-hidden bg-[#EFF6FF]">
        <img
          src={app.cover_image}
          alt={app.system_name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Category tag */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 bg-[#0B5394]/90 text-white text-xs font-medium rounded-lg">
            {app.sys_category}
          </span>
        </div>

        {/* Status */}
        {app.status === '1' && (
          <div className="absolute top-3 right-3">
            <span className="px-2.5 py-1 bg-[#EF5350]/90 text-white text-xs font-medium rounded-lg flex items-center gap-1">
              <XCircle size={10} /> 暂停服务
            </span>
          </div>
        )}

        {/* View count */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 text-white/80 text-xs">
          <Eye size={11} /> {app.view_count.toLocaleString()}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col p-4">
        <h3 className="text-[#1A2332] font-semibold text-sm leading-snug mb-2 line-clamp-2">
          {app.system_name}
        </h3>

        {/* HW support */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {app.hw_support.map(hw => <HwBadge key={hw} hw={hw} />)}
        </div>

        {/* Exp count */}
        <div className="flex items-center gap-1.5 text-[#64748B] text-xs mb-4">
          <BookOpen size={12} />
          <span>包含 <strong className="text-[#0B5394]">{app.exp_count}</strong> 个实验项目</span>
        </div>

        {/* Actions */}
        <div className="mt-auto flex gap-2">
          <button
            onClick={() => onLaunch(app)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-[#64748B] border border-[#E2E8F0] rounded-xl hover:bg-[#F0F4F8] hover:border-[#CBD5E1] transition-colors"
          >
            <ExternalLink size={13} /> 详情
          </button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => onLaunch(app)}
            disabled={app.status === '1'}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-white bg-[#0B5394] rounded-xl hover:bg-[#1565C0] transition-colors shadow-sm shadow-[#0B5394]/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play size={13} fill="currentColor" />
            {app.status === '1' ? '暂停服务' : '启动应用'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

/* ──────────────────────────── Main Page ──────────────────────────── */

export function AppCenterPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('全部');
  const [hwFilter, setHwFilter] = useState<HwSupport | 'all'>('all');
  const [selectedApp, setSelectedApp] = useState<SimSystem | null>(null);
  const [apps, setApps] = useState<SimSystem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getSimSystemList({ pageNum: 1, pageSize: 100 })
      .then(res => setApps((res.rows ?? []).map(adaptApiSystem)))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return apps.filter(app => {
      const matchSearch = !search || app.system_name.toLowerCase().includes(search.toLowerCase()) || app.sys_category.includes(search);
      const matchCat = category === '全部' || app.sys_category === category;
      const matchHw = hwFilter === 'all' || app.hw_support.includes(hwFilter as HwSupport);
      return matchSearch && matchCat && matchHw;
    });
  }, [search, category, hwFilter, apps]);

  const stats = useMemo(() => ({
    total: apps.length,
    active: apps.filter(a => a.status === '0').length,
    totalViews: apps.reduce((s, a) => s + a.view_count, 0),
    totalExp: apps.reduce((s, a) => s + a.exp_count, 0),
  }), [apps]);

  return (
    <div className="min-h-screen bg-[#F0F4F8]">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-[#0B1929] via-[#0B3A6B] to-[#063B33] overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: 'linear-gradient(#1E88E5 1px, transparent 1px), linear-gradient(90deg, #1E88E5 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />
        {/* Decorative circles */}
        <div className="absolute -right-24 -top-24 w-96 h-96 bg-[#1E88E5]/10 rounded-full blur-3xl" />
        <div className="absolute -left-16 bottom-0 w-80 h-80 bg-[#00897B]/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 px-4 py-1.5 rounded-full text-sm mb-5 border border-white/15">
              <AppWindow size={14} />
              虚拟仿真应用中心
            </div>
            <h1 className="text-white mb-4" style={{ fontSize: '2.25rem', fontWeight: 700 }}>
              应用中心
            </h1>
            <p className="text-white/60 text-base max-w-xl mx-auto mb-10 leading-relaxed">
              汇聚多平台虚拟仿真教学应用，支持 WebGL、VR头盔、zSpace 等多种硬件环境，为医学教育提供沉浸式学习体验
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {[
                { label: '仿真应用', value: stats.total, icon: AppWindow },
                { label: '正常运行', value: stats.active, icon: CheckCircle },
                { label: '累计浏览', value: `${(stats.totalViews / 1000).toFixed(1)}K`, icon: Eye },
                { label: '实验项目', value: stats.totalExp, icon: BookOpen },
              ].map(s => (
                <div key={s.label} className="bg-white/10 border border-white/15 rounded-xl px-4 py-3 text-center">
                  <s.icon size={18} className="text-[#90CAF9] mx-auto mb-1.5" />
                  <div className="text-white font-bold text-xl">{s.value}</div>
                  <div className="text-white/50 text-xs">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-[65px] z-30 bg-white border-b border-[#E2E8F0] shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="搜索应用名称..."
              className="w-full pl-9 pr-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#1A2332] focus:outline-none focus:border-[#0B5394] transition-colors"
            />
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {SYS_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  category === cat
                    ? 'bg-[#0B5394] text-white shadow-sm'
                    : 'bg-[#F0F4F8] text-[#475569] hover:bg-[#E3F2FD] hover:text-[#0B5394]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* HW filter */}
          <div className="flex items-center gap-1.5 ml-auto">
            <Gauge size={13} className="text-[#94A3B8]" />
            {([['all', '全部平台'], ['webgl', 'WebGL'], ['pc', 'PC'], ['helmet', 'VR'], ['zspace', 'zSpace']] as [string, string][]).map(([v, l]) => (
              <button
                key={v}
                onClick={() => setHwFilter(v as HwSupport | 'all')}
                className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                  hwFilter === v
                    ? 'bg-[#1E88E5]/10 text-[#0B5394] font-medium border border-[#0B5394]/20'
                    : 'text-[#64748B] hover:bg-[#F0F4F8]'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* App Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Loader2 size={40} className="text-[#0B5394] animate-spin mb-4" />
            <p className="text-[#94A3B8] text-sm">正在加载应用中心…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <AppWindow size={48} className="text-[#CBD5E1] mb-4" />
            <p className="text-[#94A3B8] text-lg font-medium">暂无匹配的应用</p>
            <p className="text-[#CBD5E1] text-sm mt-1">请尝试调整搜索条件</p>
            <button
              onClick={() => { setSearch(''); setCategory('全部'); setHwFilter('all'); }}
              className="mt-4 px-4 py-2 bg-[#0B5394] text-white rounded-xl text-sm hover:bg-[#1565C0] transition-colors"
            >
              重置筛选
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <p className="text-[#64748B] text-sm">
                共 <span className="text-[#0B5394] font-semibold">{filtered.length}</span> 个应用
                {(search || category !== '全部' || hwFilter !== 'all') && (
                  <button
                    onClick={() => { setSearch(''); setCategory('全部'); setHwFilter('all'); }}
                    className="ml-3 text-xs text-[#94A3B8] hover:text-[#EF5350] transition-colors underline"
                  >
                    清除筛选
                  </button>
                )}
              </p>
            </div>
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            >
              <AnimatePresence mode="popLayout">
                {filtered.map(app => (
                  <AppCard key={app.sim_system_id} app={app} onLaunch={setSelectedApp} />
                ))}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </div>

      {/* Detail/Launch Modal */}
      <AnimatePresence>
        {selectedApp && (
          <LaunchModal app={selectedApp} onClose={() => setSelectedApp(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
