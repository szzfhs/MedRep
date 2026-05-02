import { useParams, Link } from 'react-router';
import { motion } from 'motion/react';
import {
  ChevronRight, Users, Eye, Clock, Play, Download,
  Monitor, Cpu, AlertCircle, BookOpen, ArrowLeft,
  Share2, Star, Award, CheckCircle, Info
} from 'lucide-react';
import { experiments } from '../data/mockData';

export function ExperimentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const exp = experiments.find((e) => e.id === id) || experiments[0];
  const related = experiments.filter((e) => e.category === exp.category && e.id !== exp.id).slice(0, 3);

  return (
    <div className="min-h-screen bg-[#F0F4F8]">
      {/* Hero Banner */}
      <div className="relative h-72 sm:h-96 overflow-hidden">
        <img
          src={exp.image}
          alt={exp.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1929]/90 via-[#0B1929]/50 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-8">
            <div className="flex items-center gap-2 text-white/50 text-sm mb-3">
              <Link to="/" className="hover:text-white">首页</Link>
              <ChevronRight size={13} />
              <Link to="/experiments" className="hover:text-white">虚拟仿真实验</Link>
              <ChevronRight size={13} />
              <span className="text-white/80 truncate max-w-xs">{exp.title}</span>
            </div>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span
                    className="px-3 py-1 rounded-lg text-xs font-medium"
                    style={{ backgroundColor: exp.categoryColor, color: exp.categoryText }}
                  >
                    {exp.category}
                  </span>
                  <span className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium text-white ${
                    exp.type === 'WebGL' ? 'bg-[#0B5394]' : 'bg-[#6A1B9A]'
                  }`}>
                    {exp.type === 'WebGL' ? <Monitor size={12} /> : <Cpu size={12} />}
                    {exp.typeLabel}
                  </span>
                </div>
                <h1 className="text-white mb-1" style={{ fontSize: '1.6rem', fontWeight: 700 }}>
                  {exp.title}
                </h1>
                <p className="text-white/60 text-sm">{exp.subtitle}</p>
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
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 divide-x divide-[#E2E8F0]">
                <div className="text-center">
                  <div className="text-[#1A2332] font-bold text-xl">{exp.participants.toLocaleString()}</div>
                  <div className="text-[#94A3B8] text-xs mt-0.5">参与人数</div>
                </div>
                <div className="text-center pl-4">
                  <div className="text-[#1A2332] font-bold text-xl">{exp.views.toLocaleString()}</div>
                  <div className="text-[#94A3B8] text-xs mt-0.5">浏览次数</div>
                </div>
                <div className="text-center pl-4">
                  <div className="text-[#1A2332] font-bold text-xl">{exp.duration}</div>
                  <div className="text-[#94A3B8] text-xs mt-0.5">建议学时</div>
                </div>
                <div className="hidden sm:block text-center pl-4">
                  <div className="text-[#1A2332] font-bold text-xl truncate">{exp.publisher}</div>
                  <div className="text-[#94A3B8] text-xs mt-0.5">发布单位</div>
                </div>
                <div className="hidden sm:block text-center pl-4">
                  <div className="text-[#1A2332] font-bold text-sm">{exp.publishDate}</div>
                  <div className="text-[#94A3B8] text-xs mt-0.5">发布时间</div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
              <h2 className="text-[#1A2332] font-semibold mb-4 flex items-center gap-2" style={{ fontSize: '1rem' }}>
                <BookOpen size={18} className="text-[#0B5394]" />
                实验简介
              </h2>
              <p className="text-[#4A5568] leading-relaxed">{exp.description}</p>

              <div className="flex flex-wrap gap-2 mt-4">
                {exp.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-[#F0F4F8] text-[#64748B] rounded-lg text-xs">
                    # {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* System Requirements */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
              <h2 className="text-[#1A2332] font-semibold mb-4 flex items-center gap-2" style={{ fontSize: '1rem' }}>
                <Info size={18} className="text-[#0B5394]" />
                实验环境要求
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-[#F0F4F8] rounded-xl p-4">
                  <h3 className="text-[#1A2332] text-sm font-medium mb-2 flex items-center gap-2">
                    <Monitor size={15} className="text-[#0B5394]" />
                    推荐硬件配置
                  </h3>
                  <p className="text-[#64748B] text-sm leading-relaxed">{exp.requirements}</p>
                </div>
                <div className="bg-[#F0F4F8] rounded-xl p-4">
                  <h3 className="text-[#1A2332] text-sm font-medium mb-2 flex items-center gap-2">
                    <Cpu size={15} className="text-[#00897B]" />
                    支持设备
                  </h3>
                  <p className="text-[#64748B] text-sm leading-relaxed">{exp.devices}</p>
                </div>
              </div>

              {exp.type === 'VR' && (
                <div className="mt-4 flex items-start gap-3 p-4 bg-[#FFF3E0] rounded-xl border border-[#FFB74D]/30">
                  <AlertCircle size={18} className="text-[#F57F17] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[#E65100] text-sm font-medium">VR设备实验提示</p>
                    <p className="text-[#64748B] text-xs mt-1">
                      本实验推荐使用VR头戴设备以获得最佳体验。若无VR设备，也可在普通电脑上以鼠标键盘交互模式运行，
                      但沉浸感和操作精准度将有所降低。
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Materials */}
            {exp.materials && exp.materials.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
                <h2 className="text-[#1A2332] font-semibold mb-4 flex items-center gap-2" style={{ fontSize: '1rem' }}>
                  <Download size={18} className="text-[#0B5394]" />
                  实验材料与资源
                </h2>
                <div className="space-y-3">
                  {exp.materials.map((mat, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3.5 bg-[#F0F4F8] rounded-xl hover:bg-[#E3F2FD] transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold ${
                          mat.type === 'PDF' ? 'bg-[#E53935]' :
                          mat.type === 'VIDEO' ? 'bg-[#0B5394]' :
                          mat.type === 'EXE' ? 'bg-[#6A1B9A]' : 'bg-[#00897B]'
                        }`}>
                          {mat.type}
                        </div>
                        <div>
                          <p className="text-[#1A2332] text-sm font-medium group-hover:text-[#0B5394] transition-colors">
                            {mat.name}
                          </p>
                          <p className="text-[#94A3B8] text-xs">{mat.size}</p>
                        </div>
                      </div>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 text-[#0B5394] text-xs border border-[#0B5394]/30 rounded-lg hover:bg-[#0B5394] hover:text-white transition-all group-hover:border-[#0B5394]">
                        <Download size={12} />
                        下载
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Related course */}
            {exp.relatedCourse && (
              <div className="bg-gradient-to-r from-[#0B5394] to-[#1565C0] rounded-2xl p-5 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <BookOpen size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-white/70 text-xs mb-0.5">此实验也包含在课程中</p>
                      <p className="text-white font-semibold">{exp.relatedCourse}</p>
                    </div>
                  </div>
                  <Link
                    to="/courses"
                    className="flex items-center gap-1.5 px-4 py-2 bg-white text-[#0B5394] rounded-xl text-sm font-medium hover:bg-blue-50 transition-colors flex-shrink-0"
                  >
                    查看课程 <ChevronRight size={15} />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Launch Card */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sticky top-20">
              <div className="text-center mb-5">
                <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-3 ${
                  exp.type === 'WebGL' ? 'bg-[#E3F2FD]' : 'bg-[#EDE7F6]'
                }`}>
                  {exp.type === 'WebGL'
                    ? <Monitor size={30} className="text-[#0B5394]" />
                    : <Cpu size={30} className="text-[#6A1B9A]" />
                  }
                </div>
                <h3 className="text-[#1A2332] font-semibold mb-1">{exp.typeLabel}</h3>
                <p className="text-[#64748B] text-xs">
                  {exp.type === 'WebGL'
                    ? '无需安装，浏览器直接运行'
                    : '需下载客户端程序后运行'
                  }
                </p>
              </div>

              <button className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#0B5394] text-white rounded-xl font-medium text-sm hover:bg-[#1565C0] transition-colors shadow-md shadow-[#0B5394]/20 mb-3">
                <Play size={18} fill="currentColor" />
                启动实验
              </button>

              {exp.type === 'VR' && (
                <button className="w-full flex items-center justify-center gap-2 py-3 border border-[#6A1B9A] text-[#6A1B9A] rounded-xl text-sm hover:bg-[#EDE7F6] transition-colors mb-3">
                  <Download size={16} />
                  下载客户端
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
                  { label: '学科分类', value: exp.category },
                  { label: '建议学时', value: exp.duration },
                  { label: '发布单位', value: exp.publisher },
                  { label: '上线日期', value: exp.publishDate },
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
                  {related.map((r) => (
                    <Link
                      key={r.id}
                      to={`/experiments/${r.id}`}
                      className="group flex gap-3 hover:bg-[#F0F4F8] -mx-2 px-2 py-2 rounded-xl transition-colors"
                    >
                      <img
                        src={r.image}
                        alt={r.title}
                        className="w-16 h-12 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[#1A2332] text-xs font-medium line-clamp-2 group-hover:text-[#0B5394] transition-colors">
                          {r.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[#94A3B8] text-xs flex items-center gap-0.5">
                            <Users size={10} />{r.participants.toLocaleString()}
                          </span>
                          <span className="text-[#94A3B8] text-xs">{r.duration}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
