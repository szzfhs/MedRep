import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import {
  ChevronLeft, ChevronRight, BookOpen, FlaskConical,
  HelpCircle, FileText, Play, CheckCircle, Menu, X,
  Maximize2, Volume2, Settings, ArrowLeft, ArrowRight
} from 'lucide-react';
import { getCourseDetail, type Course, type CourseSection } from '../../api/course';

export function CourseLearningPage() {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [activeTab, setActiveTab] = useState<'resource' | 'experiment' | 'test'>('resource');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getCourseDetail(Number(id))
      .then((res) => { setCourse(res.course); setSections(res.sections ?? []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="h-screen bg-[#0F1923] flex items-center justify-center">
        <div className="text-[#64748B]">加载中...</div>
      </div>
    );
  }

  if (!course || sections.length === 0) {
    return (
      <div className="h-screen bg-[#0F1923] flex items-center justify-center">
        <div className="text-[#64748B]">暂无章节内容</div>
      </div>
    );
  }

  const chapter = sections[currentChapter];

  const tabs = [
    { key: 'resource' as const, label: '课件讲义', icon: FileText, available: chapter.hasResource === '1' },
    { key: 'experiment' as const, label: '虚拟实验', icon: FlaskConical, available: chapter.hasExperiment === '1' },
    { key: 'test' as const, label: '在线测试', icon: HelpCircle, available: chapter.hasTest === '1' },
  ];

  return (
    <div className="h-screen flex flex-col bg-[#0F1923] overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#161F2A] border-b border-[#2D3F55] flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link
            to={`/courses/${id}`}
            className="flex items-center gap-1.5 text-[#94A3B8] hover:text-white text-sm transition-colors"
          >
            <ArrowLeft size={16} /> 返回课程
          </Link>
          <span className="text-[#2D3F55]">|</span>
          <div className="text-white text-sm">
            <span className="text-[#64748B]">{course.courseName}</span>
            <span className="text-[#64748B] mx-2">›</span>
            <span className="text-white">第{currentChapter + 1}章 {chapter.title}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Progress */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-[#64748B]">
            <div className="w-24 h-1.5 bg-[#2D3F55] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#1E88E5] to-[#00897B] rounded-full transition-all"
                style={{ width: `${((currentChapter + 1) / sections.length) * 100}%` }}
              />
            </div>
            <span>{currentChapter + 1}/{sections.length}</span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-[#64748B] hover:text-white transition-colors"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tab Bar */}
          <div className="flex items-center gap-1 px-4 py-2 bg-[#161F2A] border-b border-[#2D3F55] flex-shrink-0">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => tab.available && setActiveTab(tab.key)}
                disabled={!tab.available}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeTab === tab.key
                    ? 'bg-[#1E88E5] text-white'
                    : tab.available
                    ? 'text-[#64748B] hover:text-white hover:bg-[#2D3F55]'
                    : 'text-[#2D3F55] cursor-not-allowed'
                }`}
              >
                <tab.icon size={13} />
                {tab.label}
                {!tab.available && <span className="text-[#2D3F55] text-xs">(无)</span>}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto">
            {activeTab === 'resource' && (
              <div className="h-full flex flex-col">
                {/* Mock PDF viewer */}
                <div className="flex-1 bg-[#1A2332] p-8 overflow-auto">
                  <div className="max-w-3xl mx-auto">
                    {/* PDF-like content */}
                    <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
                      <div className="bg-[#F0F4F8] px-8 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
                        <span className="text-[#64748B] text-sm">第{currentChapter + 1}章 {chapter.title} - 课件讲义</span>
                        <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
                          <button className="px-3 py-1 border border-[#E2E8F0] rounded hover:bg-white transition-colors">上一页</button>
                          <span>1 / 24</span>
                          <button className="px-3 py-1 border border-[#E2E8F0] rounded hover:bg-white transition-colors">下一页</button>
                        </div>
                      </div>
                      <div className="p-8 sm:p-12">
                        <h2 className="text-[#1A2332] mb-6 text-center" style={{ fontSize: '1.4rem', fontWeight: 700 }}>
                          第{currentChapter + 1}章 {chapter.title}
                        </h2>
                        <div className="w-full h-px bg-[#E2E8F0] mb-6" />
                        <div className="space-y-4 text-[#4A5568] text-sm leading-relaxed">
                          <h3 className="text-[#1A2332] font-semibold text-base">学习目标</h3>
                          <ul className="list-disc pl-5 space-y-2">
                            <li>掌握本章核心概念与基础理论</li>
                            <li>理解相关医学知识的临床应用意义</li>
                            <li>能够运用所学知识分析实验现象</li>
                            <li>完成虚拟仿真实验操作并撰写实验报告</li>
                          </ul>
                          <h3 className="text-[#1A2332] font-semibold text-base mt-6">核心内容概述</h3>
                          <p>
                            本章系统介绍了{chapter.title}的基本原理与实验方法。
                            通过理论讲授与虚拟仿真实验相结合的教学方式，帮助学生深入理解
                            相关医学概念，建立完整的知识体系。
                          </p>
                          <p>
                            实验内容涵盖标准操作流程、数据采集与分析、结果解读等关键环节，
                            为后续临床实践奠定坚实基础。学生应认真完成每个实验步骤，
                            并详细记录实验数据，以便进行科学分析。
                          </p>
                          <div className="bg-[#E3F2FD] rounded-xl p-4 mt-4">
                            <p className="text-[#0B5394] text-sm font-medium mb-2">📖 课前预习提示</p>
                            <p className="text-[#0B5394] text-sm">
                              请在开始本章学习前，复习相关基础医学知识，确保已掌握前置课程的核心内容。
                              如有疑问，请参考教材对应章节或联系任课教师。
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* PDF Controls */}
                <div className="flex items-center justify-between px-6 py-3 bg-[#161F2A] border-t border-[#2D3F55]">
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 text-[#64748B] hover:text-white transition-colors">
                      <Settings size={16} />
                    </button>
                    <button className="p-1.5 text-[#64748B] hover:text-white transition-colors">
                      <Maximize2 size={16} />
                    </button>
                  </div>
                  <div className="text-[#64748B] text-xs">正在查看课件 · 共24页</div>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0B5394] text-white rounded-lg text-xs hover:bg-[#1565C0] transition-colors">
                    下载课件
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'experiment' && chapter.hasExperiment === '1' && (
              <div className="h-full flex items-center justify-center bg-[#0F1923]">
                <div className="text-center px-6">
                  <div className="w-20 h-20 bg-[#1E2D3D] rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <FlaskConical size={36} className="text-[#1E88E5]" />
                  </div>
                  <h3 className="text-white text-lg font-semibold mb-2">
                    {chapter.title} — 虚拟仿真实验
                  </h3>
                  <p className="text-[#64748B] text-sm mb-6 max-w-sm">
                    点击下方按钮启动本章配套的虚拟仿真实验，在沉浸式环境中完成实验操作。
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button className="flex items-center gap-2 px-6 py-3 bg-[#1E88E5] text-white rounded-xl text-sm font-medium hover:bg-[#1976D2] transition-colors">
                      <Play size={16} fill="currentColor" /> 启动Web实验
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 border border-[#2D3F55] text-[#94A3B8] rounded-xl text-sm hover:border-[#1E88E5] hover:text-white transition-colors">
                      <BookOpen size={16} /> 查看实验指导
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'test' && chapter.hasTest === '1' && (
              <div className="p-6 max-w-3xl mx-auto">
                <div className="bg-[#1A2332] rounded-2xl p-6">
                  <h3 className="text-white font-semibold text-lg mb-1">
                    第{currentChapter + 1}章 课后测试
                  </h3>
                  <p className="text-[#64748B] text-sm mb-6">共10道题，完成后自动评分</p>
                  <div className="space-y-6">
                    {[1, 2, 3].map((q) => (
                      <div key={q} className="bg-[#0F1923] rounded-xl p-5">
                        <p className="text-white text-sm mb-4">
                          {q}. 关于{chapter.title}的以下描述，哪项是正确的？
                        </p>
                        <div className="space-y-2.5">
                          {['A', 'B', 'C', 'D'].map((opt) => (
                            <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                              <div className="w-5 h-5 rounded-full border-2 border-[#2D3F55] group-hover:border-[#1E88E5] transition-colors flex items-center justify-center">
                                <div className="w-2.5 h-2.5 rounded-full bg-transparent group-hover:bg-[#1E88E5]/30 transition-colors" />
                              </div>
                              <span className="text-[#94A3B8] text-sm group-hover:text-white transition-colors">
                                {opt}. 示例选项内容 — {chapter.title}相关描述
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-6">
                    <span className="text-[#64748B] text-sm">已答 3/10 题</span>
                    <button className="px-6 py-2.5 bg-[#1E88E5] text-white rounded-xl text-sm font-medium hover:bg-[#1976D2] transition-colors">
                      提交答案
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Navigation */}
          <div className="flex items-center justify-between px-6 py-3 bg-[#161F2A] border-t border-[#2D3F55] flex-shrink-0">
            <button
              onClick={() => setCurrentChapter(Math.max(0, currentChapter - 1))}
              disabled={currentChapter === 0}
              className="flex items-center gap-2 px-4 py-2 text-sm text-[#64748B] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft size={16} /> 上一章
            </button>
            <div className="flex gap-1.5">
              {sections.slice(0, 10).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentChapter(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === currentChapter
                      ? 'bg-[#1E88E5] w-5'
                      : i < currentChapter
                      ? 'bg-[#00897B]'
                      : 'bg-[#2D3F55] hover:bg-[#3D4F65]'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => setCurrentChapter(Math.min(sections.length - 1, currentChapter + 1))}
              disabled={currentChapter === sections.length - 1}
              className="flex items-center gap-2 px-4 py-2 text-sm text-[#64748B] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              下一章 <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Sidebar - Chapter List */}
        {sidebarOpen && (
          <div className="w-72 bg-[#161F2A] border-l border-[#2D3F55] flex flex-col overflow-hidden flex-shrink-0">
            <div className="px-4 py-3 border-b border-[#2D3F55]">
              <p className="text-white text-sm font-medium">课程章节目录</p>
              <p className="text-[#64748B] text-xs mt-0.5">{course.totalSections ?? 0}章 · {course.totalHours ?? 0}学时</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {sections.map((ch, i) => (
                <button
                  key={ch.sectionId}
                  onClick={() => setCurrentChapter(i)}
                  className={`w-full text-left px-4 py-3 border-b border-[#1A2332] transition-colors ${
                    i === currentChapter
                      ? 'bg-[#0B3A6B]/50 border-l-2 border-l-[#1E88E5]'
                      : 'hover:bg-[#1A2332]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 text-xs font-medium mt-0.5 ${
                      i < currentChapter
                        ? 'bg-[#00897B]/20 text-[#00897B]'
                        : i === currentChapter
                        ? 'bg-[#1E88E5] text-white'
                        : 'bg-[#2D3F55] text-[#64748B]'
                    }`}>
                      {i < currentChapter ? <CheckCircle size={13} /> : i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium truncate ${
                        i === currentChapter ? 'text-white' : 'text-[#94A3B8]'
                      }`}>
                        {ch.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {ch.hasResource === '1' && <span className="w-1.5 h-1.5 rounded-full bg-[#1E88E5]" title="课件" />}
                        {ch.hasExperiment === '1' && <span className="w-1.5 h-1.5 rounded-full bg-[#00897B]" title="实验" />}
                        {ch.hasTest === '1' && <span className="w-1.5 h-1.5 rounded-full bg-[#F57F17]" title="测试" />}
                        <span className="text-[#475569] text-xs">{(ch.hours ?? 0) > 0 ? `${ch.hours}h` : ''}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Progress */}
            <div className="p-4 border-t border-[#2D3F55]">
              <div className="flex justify-between text-xs text-[#64748B] mb-2">
                <span>学习进度</span>
                <span>{Math.round(((currentChapter + 1) / sections.length) * 100)}%</span>
              </div>
              <div className="w-full h-2 bg-[#2D3F55] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#1E88E5] to-[#00897B] rounded-full transition-all"
                  style={{ width: `${((currentChapter + 1) / sections.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
