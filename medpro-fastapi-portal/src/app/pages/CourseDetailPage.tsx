import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { motion } from 'motion/react';
import {
  ChevronRight, BookOpen, Users, Star, Clock, Play,
  FlaskConical, FileText, HelpCircle, GraduationCap,
  Award, CheckCircle, Lock, ExternalLink, Loader2
} from 'lucide-react';
import { getCourseDetail, getPortalSectionResources, type Course, type CourseSection, type ResourceItem } from '../../api/course';

const COURSE_CATEGORY_MAP: Record<string, string> = { '1': '理论课', '2': '实验课', '3': '理实一体化课' };

export function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(new Set());
  // 小节资源：sectionId -> 资源列表（undefined=未加载，[]= 加载完无资源）
  const [sectionResources, setSectionResources] = useState<Record<number, ResourceItem[]>>({});
  const [loadingResources, setLoadingResources] = useState<Set<number>>(new Set());
  const [expandedResources, setExpandedResources] = useState<Set<number>>(new Set());

  // 点击小节：展开/收起资源，首次懒加载
  const toggleSectionResources = async (sectionId: number) => {
    if (expandedResources.has(sectionId)) {
      setExpandedResources(prev => { const n = new Set(prev); n.delete(sectionId); return n; });
      return;
    }
    setExpandedResources(prev => new Set([...prev, sectionId]));
    if (sectionId in sectionResources) return; // 已加载
    setLoadingResources(prev => new Set([...prev, sectionId]));
    try {
      const res = await getPortalSectionResources(sectionId);
      setSectionResources(prev => ({ ...prev, [sectionId]: res }));
    } finally {
      setLoadingResources(prev => { const n = new Set(prev); n.delete(sectionId); return n; });
    }
  };

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getCourseDetail(Number(id))
      .then((res) => {
        setCourse(res.course);
        const secs = res.sections ?? [];
        setSections(secs);
        // 默认展开所有章节
        setExpandedChapters(new Set(secs.map(s => s.sectionId)));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center">
        <div className="text-[#64748B]">加载中...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center">
        <div className="text-[#64748B]">课程不存在</div>
      </div>
    );
  }

  const categoryLabel = COURSE_CATEGORY_MAP[course.courseCategory ?? ''] ?? '课程';

  return (
    <div className="min-h-screen bg-[#F0F4F8]">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0B1929] to-[#0B3A6B]">
        <div className="absolute inset-0">
          <img src={course.coverImage || '/placeholder.svg'} alt={course.courseName ?? ''} className="w-full h-full object-cover opacity-20" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-center gap-2 text-white/50 text-sm mb-4">
            <Link to="/" className="hover:text-white">首页</Link>
            <ChevronRight size={13} />
            <Link to="/courses" className="hover:text-white">实验课程</Link>
            <ChevronRight size={13} />
            <span className="text-white/80 truncate max-w-xs">{course.courseName}</span>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Left: Info */}
            <div className="lg:col-span-2">
              <span className="inline-block px-3 py-1 bg-[#1E88E5]/20 border border-[#1E88E5]/30 text-[#42A5F5] rounded-lg text-xs mb-3">
                {categoryLabel}
              </span>
              <h1 className="text-white mb-2" style={{ fontSize: '1.8rem', fontWeight: 700 }}>
                {course.courseName}
              </h1>
              {course.subtitle && <p className="text-white/60 text-sm mb-4">{course.subtitle}</p>}
              <p className="text-white/70 text-sm leading-relaxed mb-5 max-w-2xl">
                {course.description}
              </p>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span className="flex items-center gap-2 text-white/70">
                  <GraduationCap size={16} className="text-[#42A5F5]" />
                  {course.teacherName ?? '暂无教师'}
                </span>
                {course.department && (
                  <span className="flex items-center gap-1.5 text-white/70">
                    <Award size={16} className="text-[#FFD740]" />
                    {course.department}
                  </span>
                )}
                {course.rating != null && (
                  <span className="flex items-center gap-1.5 text-[#FFD740]">
                    <Star size={16} fill="currentColor" />
                    {Number(course.rating).toFixed(1)} ({course.reviewCount ?? 0}条评价)
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-white/70">
                  <Users size={16} className="text-[#42A5F5]" />
                  {(course.enrollCount ?? 0).toLocaleString()} 名学员
                </span>
              </div>
            </div>

            {/* Right: CTA Card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5">
              <div className="relative rounded-xl overflow-hidden h-40 mb-4">
                <img src={course.coverImage || '/placeholder.svg'} alt={course.courseName ?? ''} className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <Play size={22} className="text-[#0B5394] ml-1" fill="currentColor" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                <div>
                  <div className="text-white font-bold">{course.totalSections ?? 0}</div>
                  <div className="text-white/50 text-xs">章节</div>
                </div>
                <div className="border-x border-white/20">
                  <div className="text-white font-bold">{course.totalHours ?? 0}h</div>
                  <div className="text-white/50 text-xs">总学时</div>
                </div>
                <div>
                  <div className="text-white font-bold">
                    {(course.enrollCount ?? 0) >= 1000 ? `${((course.enrollCount ?? 0) / 1000).toFixed(1)}k` : course.enrollCount ?? 0}
                  </div>
                  <div className="text-white/50 text-xs">学员</div>
                </div>
              </div>
              <Link
                to={`/courses/${course.courseId}/learn`}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#1E88E5] text-white rounded-xl font-medium text-sm hover:bg-[#1976D2] transition-colors"
              >
                <Play size={16} fill="currentColor" />
                开始学习
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Outline */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
              <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between">
                <h2 className="text-[#1A2332] font-semibold flex items-center gap-2">
                  <BookOpen size={18} className="text-[#0B5394]" />
                  课程大纲
                </h2>
                <span className="text-[#64748B] text-sm">{course.totalSections ?? 0} 章节 · {course.totalHours ?? 0} 学时</span>
              </div>

              {/* Legend */}
              <div className="px-5 py-3 bg-[#F0F4F8] border-b border-[#E2E8F0] flex items-center gap-4 text-xs text-[#64748B]">
                <span className="flex items-center gap-1.5"><FileText size={13} className="text-[#0B5394]" />课件资料</span>
                <span className="flex items-center gap-1.5"><FlaskConical size={13} className="text-[#00897B]" />虚拟实验</span>
                <span className="flex items-center gap-1.5"><HelpCircle size={13} className="text-[#F57F17]" />在线测试</span>
              </div>

              <div className="divide-y divide-[#E2E8F0]">
                {sections.map((chapter, i) => {
                  const isExpanded = expandedChapters.has(chapter.sectionId);
                  const hasChildren = (chapter.children?.length ?? 0) > 0;
                  const chapterHasResource = chapter.hasResource === '1' || chapter.hasExperiment === '1' || chapter.hasTest === '1';
                  const chapterResources = sectionResources[chapter.sectionId];
                  const isChapterResExpanded = expandedResources.has(chapter.sectionId);
                  const isChapterLoading = loadingResources.has(chapter.sectionId);
                  const toggleChapter = () => {
                    if (hasChildren) {
                      setExpandedChapters(prev => {
                        const next = new Set(prev);
                        if (next.has(chapter.sectionId)) next.delete(chapter.sectionId);
                        else next.add(chapter.sectionId);
                        return next;
                      });
                    } else {
                      // 叶子章节：始终展开资源
                      toggleSectionResources(chapter.sectionId);
                    }
                  };
                  return (
                    <div key={chapter.sectionId} className="border-b border-[#E2E8F0] last:border-0">
                      {/* 章行 */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#F8FAFC] transition-colors group cursor-pointer"
                        onClick={toggleChapter}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                          i < 2 ? 'bg-[#0B5394] text-white' : 'bg-[#F0F4F8] text-[#94A3B8]'
                        }`}>
                          {i < 2 ? <CheckCircle size={16} /> : i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${i < 2 ? 'text-[#1A2332]' : 'text-[#4A5568]'} group-hover:text-[#0B5394] transition-colors`}>
                            {`第${i + 1}章 ${chapter.title}`}
                          </p>
                          {(chapter.hours ?? 0) > 0 && (
                            <span className="text-[#94A3B8] text-xs">{chapter.hours}学时</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {chapter.hasResource === '1' ? (
                            <span className="flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-[#E3F2FD] text-[#0B5394]">
                              <FileText size={11} /> 课件
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-[#F1F5F9] text-[#CBD5E1]">
                              <FileText size={11} /> 课件
                            </span>
                          )}
                          {chapter.hasExperiment === '1' ? (
                            <span className="flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-[#E0F2F1] text-[#00695C]">
                              <FlaskConical size={11} /> 实验
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-[#F1F5F9] text-[#CBD5E1]">
                              <FlaskConical size={11} /> 实验
                            </span>
                          )}
                          {chapter.hasTest === '1' ? (
                            <span className="flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-[#FFF3E0] text-[#E65100]">
                              <HelpCircle size={11} /> 习题
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-[#F1F5F9] text-[#CBD5E1]">
                              <HelpCircle size={11} /> 习题
                            </span>
                          )}
                          {isChapterLoading ? (
                            <Loader2 size={14} className="text-[#94A3B8] animate-spin" />
                          ) : (
                            <ChevronRight
                              size={14}
                              className={`text-[#94A3B8] transition-transform duration-200 ${
                                hasChildren ? (isExpanded ? 'rotate-90' : '') : (isChapterResExpanded ? 'rotate-90' : '')
                              }`}
                            />
                          )}
                        </div>
                      </motion.div>

                      {/* 叶子章节的资源列表 */}
                      {!hasChildren && isChapterResExpanded && chapterResources !== undefined && (
                        <div className="pl-16 pr-5 pb-2 pt-1 bg-[#F5F7FA] border-t border-[#EEF0F4]">
                          {chapterResources.length === 0 ? (
                            <p className="text-xs text-[#94A3B8] py-1.5">暂无资源</p>
                          ) : (
                            chapterResources.map(res => {
                              const resIcon = res.resourceType === 'micro_video'
                                ? <Play size={11} />
                                : res.resourceType === 'ebook'
                                  ? <BookOpen size={11} />
                                  : <FileText size={11} />;
                              return (
                                <a
                                  key={res.bindId}
                                  href={res.fileUrl ?? '#'}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={e => e.stopPropagation()}
                                  className="flex items-center gap-2 py-1.5 text-xs text-[#4A5568] hover:text-[#0B5394] group/res transition-colors"
                                >
                                  <span className="text-[#94A3B8] group-hover/res:text-[#0B5394] flex-shrink-0">{resIcon}</span>
                                  <span className="flex-1 truncate">{res.resourceName}</span>
                                  <ExternalLink size={10} className="text-[#CBD5E1] group-hover/res:text-[#0B5394] flex-shrink-0" />
                                </a>
                              );
                            })
                          )}
                        </div>
                      )}

                      {/* 节列表 */}
                      {isExpanded && hasChildren && (
                        <div className="bg-[#FAFBFC]">
                          {chapter.children!.map((sec, j) => {
                            const secResources = sectionResources[sec.sectionId];
                            const isResExpanded = expandedResources.has(sec.sectionId);
                            const isLoading = loadingResources.has(sec.sectionId);
                            return (
                              <div key={sec.sectionId} className="border-t border-[#F0F4F8]">
                                {/* 节行 - 始终可点击展开资源 */}
                                <div
                                  className="flex items-center gap-3 pl-16 pr-5 py-2.5 hover:bg-[#F0F4F8] transition-colors group cursor-pointer"
                                  onClick={() => toggleSectionResources(sec.sectionId)}
                                >
                                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-medium text-[#94A3B8] bg-white border border-[#E2E8F0]">
                                    {j + 1}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs text-[#4A5568] group-hover:text-[#0B5394] transition-colors truncate">
                                      {sec.title}
                                    </p>
                                    {(sec.hours ?? 0) > 0 && (
                                      <span className="text-[#94A3B8] text-[10px]">{sec.hours}学时</span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1.5 flex-shrink-0">
                                    {/* 有资源时显示彩色徽章，无资源时显示灰色占位 */}
                                    {sec.hasResource === '1' ? (
                                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-[#E3F2FD] text-[#0B5394]">
                                        <FileText size={10} /> 课件
                                      </span>
                                    ) : (
                                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-[#F1F5F9] text-[#CBD5E1]">
                                        <FileText size={10} /> 课件
                                      </span>
                                    )}
                                    {sec.hasExperiment === '1' ? (
                                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-[#E0F2F1] text-[#00695C]">
                                        <FlaskConical size={10} /> 实验
                                      </span>
                                    ) : (
                                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-[#F1F5F9] text-[#CBD5E1]">
                                        <FlaskConical size={10} /> 实验
                                      </span>
                                    )}
                                    {sec.hasTest === '1' ? (
                                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-[#FFF3E0] text-[#E65100]">
                                        <HelpCircle size={10} /> 习题
                                      </span>
                                    ) : (
                                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-[#F1F5F9] text-[#CBD5E1]">
                                        <HelpCircle size={10} /> 习题
                                      </span>
                                    )}
                                    {isLoading ? (
                                      <Loader2 size={12} className="text-[#94A3B8] animate-spin ml-1" />
                                    ) : (
                                      <ChevronRight
                                        size={12}
                                        className={`text-[#94A3B8] transition-transform duration-200 ml-1 ${isResExpanded ? 'rotate-90' : ''}`}
                                      />
                                    )}
                                  </div>
                                </div>

                                {/* 资源列表 */}
                                {isResExpanded && secResources !== undefined && (
                                  <div className="pl-24 pr-5 pb-2 pt-1 bg-[#F5F7FA] border-t border-[#EEF0F4]">
                                    {secResources.length === 0 ? (
                                      <p className="text-[10px] text-[#94A3B8] py-1.5">暂无资源</p>
                                    ) : (
                                      secResources.map(res => {
                                        const resIcon = res.resourceType === 'micro_video'
                                          ? <Play size={10} />
                                          : res.resourceType === 'ebook'
                                            ? <BookOpen size={10} />
                                            : <FileText size={10} />;
                                        return (
                                          <a
                                            key={res.bindId}
                                            href={res.fileUrl ?? '#'}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={e => e.stopPropagation()}
                                            className="flex items-center gap-2 py-1.5 text-[11px] text-[#4A5568] hover:text-[#0B5394] group/res transition-colors"
                                          >
                                            <span className="text-[#94A3B8] group-hover/res:text-[#0B5394] flex-shrink-0">{resIcon}</span>
                                            <span className="flex-1 truncate">{res.resourceName}</span>
                                            <ExternalLink size={9} className="text-[#CBD5E1] group-hover/res:text-[#0B5394] flex-shrink-0" />
                                          </a>
                                        );
                                      })
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Course info */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
              <h3 className="text-[#1A2332] font-semibold mb-4 text-sm">课程信息</h3>
              <div className="space-y-3">
                {[
                  { label: '主讲教师', value: course.teacherName ?? '暂无' },
                  { label: '所属院系', value: course.department ?? '暂无' },
                  { label: '课程类别', value: categoryLabel },
                  { label: '总章节数', value: `${course.totalSections ?? 0} 章` },
                  { label: '总学时', value: `${course.totalHours ?? 0} 学时` },
                  { label: '开课时间', value: course.publishDate ? course.publishDate.slice(0, 10) : '暂无' },
                  { label: '学习人数', value: `${(course.enrollCount ?? 0).toLocaleString()} 人` },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between">
                    <span className="text-[#94A3B8] text-xs">{item.label}</span>
                    <span className="text-[#1A2332] text-xs font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* What you'll learn */}
            <div className="bg-[#E3F2FD] rounded-2xl p-5">
              <h3 className="text-[#0B5394] font-semibold mb-4 text-sm">学习收获</h3>
              <ul className="space-y-2.5">
                {[
                  '掌握系统化虚拟实验操作技能',
                  '理解核心医学知识与理论',
                  '培养科学思维与实验素养',
                  '获取课程完成认证证书',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-[#1A2332]">
                    <CheckCircle size={14} className="text-[#0B5394] flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <div className="bg-[#0B5394] rounded-2xl p-5 text-white text-center">
              <Award size={32} className="mx-auto mb-3 text-[#FFD740]" />
              <p className="font-semibold mb-1">完成课程获取证书</p>
              <p className="text-white/60 text-xs mb-4">完成所有章节并通过测试，即可获取课程完成证书</p>
              <Link
                to={`/courses/${course.courseId}/learn`}
                className="block w-full py-2.5 bg-white text-[#0B5394] rounded-xl text-sm font-medium hover:bg-blue-50 transition-colors"
              >
                立即开始学习
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
