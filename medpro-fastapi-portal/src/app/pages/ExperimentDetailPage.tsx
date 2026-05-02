import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { motion } from 'motion/react';
import {
  ChevronRight, Users, Eye, Clock, Play, Download,
  Monitor, Cpu, AlertCircle, BookOpen, ArrowLeft,
  Share2, Star, Award, CheckCircle, Info
} from 'lucide-react';
import { getExperimentDetail, getExperimentList, type Experiment } from '../../api/experiment';

function mapExpType(expType: string | null) {
  if (expType === 'exe') return { typeLabel: 'VR客户端', isVR: true };
  return { typeLabel: 'Web实验', isVR: false };
}

function parseTags(tags: string | null): string[] {
  if (!tags || tags === "''" || tags.trim() === '') return [];
  return tags.split(',').map((t) => t.trim()).filter(Boolean);
}

export function ExperimentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [exp, setExp] = useState<Experiment | null>(null);
  const [related, setRelated] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getExperimentDetail(Number(id))
      .then((data) => {
        setExp(data);
        // 加载同分类的相关实验
        getExperimentList({ pageNum: 1, pageSize: 4, status: '1' })
          .then((res) => setRelated(res.rows.filter((e) => e.expId !== data.expId).slice(0, 3)))
          .catch(() => {});
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-[#0B5394] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[#64748B] text-sm">加载实验详情中…</p>
        </div>
      </div>
    );
  }

  if (notFound || !exp) {
    return (
      <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="text-[#CBD5E1] mx-auto mb-3" />
          <p className="text-[#64748B]">实验不存在或已下线</p>
          <Link to="/experiments" className="mt-4 inline-flex items-center gap-1 text-[#0B5394] text-sm hover:underline">
            <ArrowLeft size={14} /> 返回实验列表
          </Link>
        </div>
      </div>
    );
  }

  const { typeLabel, isVR } = mapExpType(exp.expType);
  const tags = parseTags(exp.tags);
  const coverImage = (!exp.coverImage || exp.coverImage === "''") ? '/placeholder.svg' : exp.coverImage;

  return (
    <div className="min-h-screen bg-[#F0F4F8]">
      {/* Hero Banner */}
      <div className="relative h-72 sm:h-80 overflow-hidden">
        <img src={coverImage} alt={exp.expName} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1929]/90 via-[#0B1929]/50 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-8">
            <div className="flex items-center gap-2 text-white/50 text-sm mb-3">
              <Link to="/" className="hover:text-white">首页</Link>
              <ChevronRight size={13} />
              <Link to="/experiments" className="hover:text-white">虚拟仿真实验</Link>
              <ChevronRight size={13} />
              <span className="text-white/80 truncate max-w-xs">{exp.expName}</span>
            </div>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {exp.categoryName && (
                    <span className="px-3 py-1 rounded-lg text-xs font-medium bg-[#E3F2FD] text-[#0B5394]">
                      {exp.categoryName}
                    </span>
                  )}
                  <span className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium text-white ${isVR ? 'bg-[#6A1B9A]' : 'bg-[#0B5394]'}`}>
                    {isVR ? <Cpu size={12} /> : <Monitor size={12} />}
                    {typeLabel}
                  </span>
                </div>
                <h1 className="text-white mb-1" style={{ fontSize: '1.6rem', fontWeight: 700 }}>
                  {exp.expName}
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats bar */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
              <div className="grid grid-cols-3 gap-4 divide-x divide-[#E2E8F0]">
                <div className="text-center">
                  <div className="text-[#1A2332] font-bold text-xl">{(exp.participateCount ?? 0).toLocaleString()}</div>
                  <div className="text-[#94A3B8] text-xs mt-0.5">参与人数</div>
                </div>
                <div className="text-center pl-4">
                  <div className="text-[#1A2332] font-bold text-xl">{(exp.viewCount ?? 0).toLocaleString()}</div>
                  <div className="text-[#94A3B8] text-xs mt-0.5">浏览次数</div>
                </div>
                <div className="text-center pl-4">
                  <div className="text-[#1A2332] font-bold text-xl">{exp.expDuration ?? 0}</div>
                  <div className="text-[#94A3B8] text-xs mt-0.5">时长（分钟）</div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
              <h2 className="text-[#1A2332] font-semibold mb-4 flex items-center gap-2" style={{ fontSize: '1rem' }}>
                <BookOpen size={18} className="text-[#0B5394]" />
                实验简介
              </h2>
              {exp.description ? (
                <div
                  className="text-[#4A5568] leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: exp.description }}
                />
              ) : (
                <p className="text-[#94A3B8] text-sm">暂无简介</p>
              )}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-[#F0F4F8] text-[#64748B] rounded-lg text-xs">
                      # {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Experiment Guide (if available) */}
            {exp.expGuide && (
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
                <h2 className="text-[#1A2332] font-semibold mb-4 flex items-center gap-2" style={{ fontSize: '1rem' }}>
                  <CheckCircle size={18} className="text-[#0B5394]" />
                  实验指导
                </h2>
                <div
                  className="text-[#4A5568] leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: exp.expGuide }}
                />
              </div>
            )}

            {/* System Requirements */}
            {(exp.envRequirements || exp.softwareRequirements) && (
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
                <h2 className="text-[#1A2332] font-semibold mb-4 flex items-center gap-2" style={{ fontSize: '1rem' }}>
                  <Info size={18} className="text-[#0B5394]" />
                  实验环境要求
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {exp.envRequirements && (
                    <div className="bg-[#F0F4F8] rounded-xl p-4">
                      <h3 className="text-[#1A2332] text-sm font-medium mb-2 flex items-center gap-2">
                        <Monitor size={15} className="text-[#0B5394]" />
                        推荐硬件配置
                      </h3>
                      <p className="text-[#64748B] text-sm leading-relaxed">{exp.envRequirements}</p>
                    </div>
                  )}
                  {exp.softwareRequirements && (
                    <div className="bg-[#F0F4F8] rounded-xl p-4">
                      <h3 className="text-[#1A2332] text-sm font-medium mb-2 flex items-center gap-2">
                        <Cpu size={15} className="text-[#00897B]" />
                        软件要求
                      </h3>
                      <p className="text-[#64748B] text-sm leading-relaxed">{exp.softwareRequirements}</p>
                    </div>
                  )}
                </div>
                {isVR && (
                  <div className="mt-4 flex items-start gap-3 p-4 bg-[#FFF3E0] rounded-xl border border-[#FFB74D]/30">
                    <AlertCircle size={18} className="text-[#F57F17] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[#E65100] text-sm font-medium">VR设备实验提示</p>
                      <p className="text-[#64748B] text-xs mt-1">
                        本实验推荐使用VR头戴设备以获得最佳体验。若无VR设备，也可在普通电脑上以鼠标键盘交互模式运行。
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Launch Card */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sticky top-20">
              <div className="text-center mb-5">
                <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-3 ${isVR ? 'bg-[#EDE7F6]' : 'bg-[#E3F2FD]'}`}>
                  {isVR ? <Cpu size={30} className="text-[#6A1B9A]" /> : <Monitor size={30} className="text-[#0B5394]" />}
                </div>
                <h3 className="text-[#1A2332] font-semibold mb-1">{typeLabel}</h3>
                <p className="text-[#64748B] text-xs">
                  {isVR ? '需下载客户端程序后运行' : '无需安装，浏览器直接运行'}
                </p>
              </div>

              {exp.launchUrl && exp.launchUrl !== "''" ? (
                <a
                  href={exp.launchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#0B5394] text-white rounded-xl font-medium text-sm hover:bg-[#1565C0] transition-colors shadow-md shadow-[#0B5394]/20 mb-3"
                >
                  <Play size={18} fill="currentColor" />
                  启动实验
                </a>
              ) : (
                <button className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#CBD5E1] text-white rounded-xl font-medium text-sm cursor-not-allowed mb-3">
                  <Play size={18} fill="currentColor" />
                  启动实验（链接未配置）
                </button>
              )}

              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-[#E2E8F0] text-[#64748B] rounded-xl text-xs hover:bg-[#F0F4F8] transition-colors">
                  <Star size={14} /> 收藏
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-[#E2E8F0] text-[#64748B] rounded-xl text-xs hover:bg-[#F0F4F8] transition-colors">
                  <Share2 size={14} /> 分享
                </button>
              </div>

              {/* Quick info */}
              <div className="mt-5 pt-4 border-t border-[#E2E8F0] space-y-2.5">
                {[
                  { label: '学科分类', value: exp.categoryName ?? '-' },
                  { label: '实验时长', value: exp.expDuration ? `${exp.expDuration} 分钟` : '-' },
                  { label: '上线日期', value: exp.createTime?.slice(0, 10) ?? '-' },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between">
                    <span className="text-[#94A3B8] text-xs">{item.label}</span>
                    <span className="text-[#1A2332] text-xs font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Related */}
            {related.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
                <h3 className="text-[#1A2332] font-semibold mb-4 text-sm">相关实验推荐</h3>
                <div className="space-y-3">
                  {related.map((r) => {
                    const rCover = (!r.coverImage || r.coverImage === "''") ? '/placeholder.svg' : r.coverImage;
                    return (
                      <Link
                        key={r.expId}
                        to={`/experiments/${r.expId}`}
                        className="group flex gap-3 hover:bg-[#F0F4F8] -mx-2 px-2 py-2 rounded-xl transition-colors"
                      >
                        <img src={rCover} alt={r.expName} className="w-16 h-12 rounded-lg object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[#1A2332] text-xs font-medium line-clamp-2 group-hover:text-[#0B5394] transition-colors">
                            {r.expName}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[#94A3B8] text-xs flex items-center gap-0.5">
                              <Users size={10} />{(r.participateCount ?? 0).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
