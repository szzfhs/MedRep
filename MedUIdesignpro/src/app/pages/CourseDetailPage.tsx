import { useParams, Link } from 'react-router';
import { motion } from 'motion/react';
import {
  ChevronRight, BookOpen, Users, Star, Clock, Play,
  FlaskConical, FileText, HelpCircle, GraduationCap,
  Award, CheckCircle, Lock
} from 'lucide-react';
import { courses } from '../data/mockData';

export function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const course = courses.find((c) => c.id === id) || courses[0];

  return (
    <div className="min-h-screen bg-[#F0F4F8]">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0B1929] to-[#0B3A6B]">
        <div className="absolute inset-0">
          <img src={course.image} alt={course.title} className="w-full h-full object-cover opacity-20" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-center gap-2 text-white/50 text-sm mb-4">
            <Link to="/" className="hover:text-white">首页</Link>
            <ChevronRight size={13} />
            <Link to="/courses" className="hover:text-white">实验课程</Link>
            <ChevronRight size={13} />
            <span className="text-white/80 truncate max-w-xs">{course.title}</span>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Left: Info */}
            <div className="lg:col-span-2">
              <span className="inline-block px-3 py-1 bg-[#1E88E5]/20 border border-[#1E88E5]/30 text-[#42A5F5] rounded-lg text-xs mb-3">
                {course.category}
              </span>
              <h1 className="text-white mb-2" style={{ fontSize: '1.8rem', fontWeight: 700 }}>
                {course.title}
              </h1>
              <p className="text-white/60 text-sm mb-4">{course.subtitle}</p>
              <p className="text-white/70 text-sm leading-relaxed mb-5 max-w-2xl">
                {course.description}
              </p>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span className="flex items-center gap-2 text-white/70">
                  <GraduationCap size={16} className="text-[#42A5F5]" />
                  {course.teacher}
                </span>
                <span className="flex items-center gap-1.5 text-white/70">
                  <Award size={16} className="text-[#FFD740]" />
                  {course.department}
                </span>
                <span className="flex items-center gap-1.5 text-[#FFD740]">
                  <Star size={16} fill="currentColor" />
                  {course.rating} ({course.reviews}条评价)
                </span>
                <span className="flex items-center gap-1.5 text-white/70">
                  <Users size={16} className="text-[#42A5F5]" />
                  {course.students.toLocaleString()} 名学员
                </span>
              </div>
            </div>

            {/* Right: CTA Card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5">
              <div className="relative rounded-xl overflow-hidden h-40 mb-4">
                <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <Play size={22} className="text-[#0B5394] ml-1" fill="currentColor" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                <div>
                  <div className="text-white font-bold">{course.chapters}</div>
                  <div className="text-white/50 text-xs">章节</div>
                </div>
                <div className="border-x border-white/20">
                  <div className="text-white font-bold">{course.totalHours}h</div>
                  <div className="text-white/50 text-xs">总学时</div>
                </div>
                <div>
                  <div className="text-white font-bold">{(course.students / 1000).toFixed(1)}k</div>
                  <div className="text-white/50 text-xs">学员</div>
                </div>
              </div>
              <Link
                to={`/courses/${course.id}/learn`}
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
                <span className="text-[#64748B] text-sm">{course.chapters} 章节 · {course.totalHours} 学时</span>
              </div>

              {/* Legend */}
              <div className="px-5 py-3 bg-[#F0F4F8] border-b border-[#E2E8F0] flex items-center gap-4 text-xs text-[#64748B]">
                <span className="flex items-center gap-1.5"><FileText size={13} className="text-[#0B5394]" />课件资料</span>
                <span className="flex items-center gap-1.5"><FlaskConical size={13} className="text-[#00897B]" />虚拟实验</span>
                <span className="flex items-center gap-1.5"><HelpCircle size={13} className="text-[#F57F17]" />在线测试</span>
              </div>

              <div className="divide-y divide-[#E2E8F0]">
                {course.outline.map((chapter, i) => (
                  <motion.div
                    key={chapter.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#F8FAFC] transition-colors group"
                  >
                    {/* Chapter number */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                      i < 2 ? 'bg-[#0B5394] text-white' : 'bg-[#F0F4F8] text-[#94A3B8]'
                    }`}>
                      {i < 2 ? <CheckCircle size={16} /> : i + 1}
                    </div>

                    {/* Title */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${i < 2 ? 'text-[#1A2332]' : 'text-[#4A5568]'} group-hover:text-[#0B5394] transition-colors`}>
                        {`第${i + 1}章 ${chapter.title}`}
                      </p>
                      <span className="text-[#94A3B8] text-xs">{chapter.hours}学时</span>
                    </div>

                    {/* Icons */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {chapter.hasResource && (
                        <span className="flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-[#E3F2FD] text-[#0B5394]">
                          <FileText size={11} /> 课件
                        </span>
                      )}
                      {chapter.hasExperiment && (
                        <span className="flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-[#E0F2F1] text-[#00695C]">
                          <FlaskConical size={11} /> 实验
                        </span>
                      )}
                      {chapter.hasTest && (
                        <span className="flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-[#FFF3E0] text-[#E65100]">
                          <HelpCircle size={11} /> 测试
                        </span>
                      )}
                      {i >= 2 && (
                        <Lock size={14} className="text-[#CBD5E1] ml-1" />
                      )}
                    </div>
                  </motion.div>
                ))}
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
                  { label: '主讲教师', value: course.teacher },
                  { label: '所属院系', value: course.department },
                  { label: '课程类别', value: course.category },
                  { label: '总章节数', value: `${course.chapters} 章` },
                  { label: '总学时', value: `${course.totalHours} 学时` },
                  { label: '开课时间', value: course.publishDate },
                  { label: '学习人数', value: `${course.students.toLocaleString()} 人` },
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
                to={`/courses/${course.id}/learn`}
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
