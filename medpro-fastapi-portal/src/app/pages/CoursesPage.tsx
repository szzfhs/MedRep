import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import {
  Search, BookOpen, Users, Star, Clock, ChevronRight,
  X, Play, GraduationCap, Award, LayoutGrid, List
} from 'lucide-react';
import { getCourseList, type Course } from '../../api/course';

const COURSE_CATEGORY_MAP: Record<string, string> = { '1': '理论课', '2': '实验课', '3': '理实一体化课' };

export function CoursesPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('全部');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [courses, setCourses] = useState<Course[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getCourseList({ pageNum: 1, pageSize: 100, status: '2' })
      .then((res) => { setCourses(res.rows); setTotal(res.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = ['全部', ...Object.values(COURSE_CATEGORY_MAP)];

  const filtered = courses.filter((c) => {
    const name = c.courseName ?? '';
    const desc = c.description ?? '';
    const matchSearch = name.includes(search) || desc.includes(search);
    const catLabel = COURSE_CATEGORY_MAP[c.courseCategory ?? ''] ?? '';
    const matchCat = activeCategory === '全部' || catLabel === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen bg-[#F0F4F8]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0B3A6B] to-[#0B5394] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-center gap-2 text-white/50 text-sm mb-3">
            <Link to="/" className="hover:text-white">首页</Link>
            <ChevronRight size={14} />
            <span className="text-white/80">实验课程</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <BookOpen size={22} className="text-[#42A5F5]" />
                </div>
                <h1 className="text-white" style={{ fontSize: '1.75rem', fontWeight: 700 }}>
                  实验课程
                </h1>
              </div>
              <p className="text-white/60 text-sm">
                共 {total} 门系统化实验课程，覆盖基础医学到临床实践全体系
              </p>
            </div>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="搜索课程名称…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-64 pl-9 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 text-sm focus:outline-none focus:bg-white/20 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Filter */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 mb-6 flex flex-wrap items-center gap-3">
          <span className="text-[#64748B] text-xs font-medium">课程类别</span>
          <div className="flex gap-2 flex-wrap flex-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeCategory === cat
                    ? 'bg-[#0B5394] text-white'
                    : 'bg-[#F0F4F8] text-[#64748B] hover:bg-[#E3F2FD] hover:text-[#0B5394]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex border border-[#E2E8F0] rounded-lg overflow-hidden ml-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-[#0B5394] text-white' : 'bg-white text-[#64748B]'} transition-colors`}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-[#0B5394] text-white' : 'bg-white text-[#64748B]'} transition-colors`}
            >
              <List size={15} />
            </button>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="h-48 bg-[#E2E8F0]" />
                <div className="p-5 space-y-2">
                  <div className="h-4 bg-[#E2E8F0] rounded w-3/4" />
                  <div className="h-3 bg-[#E2E8F0] rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((course, i) => (
              <motion.div
                key={course.courseId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="group bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden hover:shadow-lg hover:border-[#1E88E5]/30 transition-all duration-300"
              >
                {/* Cover */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={course.coverImage || '/placeholder.svg'}
                    alt={course.courseName ?? ''}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-[#0B5394] rounded-lg text-xs font-medium">
                      {COURSE_CATEGORY_MAP[course.courseCategory ?? ''] ?? '课程'}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center gap-2 text-white/70 text-xs">
                      <GraduationCap size={13} />
                      {course.teacherName ?? '暂无教师'}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <Link to={`/courses/${course.courseId}`}>
                    <h3 className="text-[#1A2332] font-semibold mb-2 line-clamp-1 group-hover:text-[#0B5394] transition-colors">
                      {course.courseName}
                    </h3>
                  </Link>
                  <p className="text-[#64748B] text-xs line-clamp-2 mb-4 leading-relaxed">
                    {course.description}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4 py-3 border-y border-[#E2E8F0]">
                    <div className="text-center">
                      <div className="text-[#1A2332] font-semibold text-sm">{course.totalSections ?? 0}</div>
                      <div className="text-[#94A3B8] text-xs">章节</div>
                    </div>
                    <div className="text-center border-x border-[#E2E8F0]">
                      <div className="text-[#1A2332] font-semibold text-sm">{course.totalResources ?? 0}</div>
                      <div className="text-[#94A3B8] text-xs">资源</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[#1A2332] font-semibold text-sm">
                        {(course.enrollCount ?? 0) >= 1000
                          ? `${((course.enrollCount ?? 0) / 1000).toFixed(1)}k`
                          : course.enrollCount ?? 0}
                      </div>
                      <div className="text-[#94A3B8] text-xs">学员</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      to={`/courses/${course.courseId}`}
                      className="flex-1 text-center py-2.5 border border-[#0B5394] text-[#0B5394] rounded-xl text-xs font-medium hover:bg-[#E3F2FD] transition-colors"
                    >
                      查看详情
                    </Link>
                    <Link
                      to={`/courses/${course.courseId}/learn`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#0B5394] text-white rounded-xl text-xs font-medium hover:bg-[#1565C0] transition-colors"
                    >
                      <Play size={12} /> 开始学习
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((course, i) => (
              <motion.div
                key={course.courseId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden hover:shadow-md transition-all"
              >
                <div className="flex">
                  <div className="relative w-48 sm:w-64 flex-shrink-0">
                    <img
                      src={course.coverImage || '/placeholder.svg'}
                      alt={course.courseName ?? ''}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="px-2.5 py-0.5 bg-[#E3F2FD] text-[#0B5394] rounded-lg text-xs font-medium">
                          {COURSE_CATEGORY_MAP[course.courseCategory ?? ''] ?? '课程'}
                        </span>
                      </div>
                      <Link to={`/courses/${course.courseId}`}>
                        <h3 className="text-[#1A2332] font-semibold text-lg mb-1 group-hover:text-[#0B5394] transition-colors">
                          {course.courseName}
                        </h3>
                      </Link>
                      <p className="text-[#64748B] text-sm mb-3 flex items-center gap-1.5">
                        <GraduationCap size={14} className="text-[#94A3B8]" />
                        {course.teacherName ?? '暂无教师'}
                      </p>
                      <p className="text-[#64748B] text-sm line-clamp-2">{course.description}</p>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
                      <div className="flex items-center gap-4 text-xs text-[#94A3B8]">
                        <span className="flex items-center gap-1"><BookOpen size={12} />{course.totalSections ?? 0}章节</span>
                        <span className="flex items-center gap-1"><Users size={12} />{(course.enrollCount ?? 0).toLocaleString()}学员</span>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          to={`/courses/${course.courseId}`}
                          className="px-4 py-2 border border-[#0B5394] text-[#0B5394] rounded-xl text-xs hover:bg-[#E3F2FD] transition-colors"
                        >
                          课程详情
                        </Link>
                        <Link
                          to={`/courses/${course.courseId}/learn`}
                          className="flex items-center gap-1.5 px-4 py-2 bg-[#0B5394] text-white rounded-xl text-xs hover:bg-[#1565C0] transition-colors"
                        >
                          <Play size={12} /> 开始学习
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
