import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import {
  FlaskConical, Users, BookOpen, Clock, ArrowRight,
  ChevronRight, Play, Download, Eye, Star, Newspaper,
  Microscope, Activity, Brain, Shield, Award, Monitor,
  Cpu, Zap, GraduationCap
} from 'lucide-react';
import { experiments, news, courses, regulations } from '../data/mockData';

const HERO_BG = 'https://images.unsplash.com/photo-1758691462620-9018c602ed3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1920';

const statsData = [
  { label: '虚拟实验项目', value: 52, unit: '个', icon: FlaskConical, color: '#0B5394', bg: '#E3F2FD' },
  { label: '实验课程', value: 18, unit: '门', icon: BookOpen, color: '#00897B', bg: '#E0F2F1' },
  { label: '注册用户', value: 12847, unit: '人', icon: Users, color: '#6A1B9A', bg: '#F3E5F5' },
  { label: '实验总学时', value: 86400, unit: '时', icon: Clock, color: '#E65100', bg: '#FFF3E0' },
];

const techFeatures = [
  { icon: Monitor, title: 'WebGL 3D实验', desc: '浏览器直接运行，无需安装', color: '#0B5394' },
  { icon: Cpu, title: 'VR沉浸体验', desc: '支持主流VR头显设备', color: '#00897B' },
  { icon: Zap, title: '实时交互反馈', desc: '智能评分与纠错指导', color: '#F57F17' },
  { icon: GraduationCap, title: '课程体系完整', desc: '从基础到临床全覆盖', color: '#6A1B9A' },
];

function CountUp({ end, duration = 2000 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration]);

  return <span>{count.toLocaleString()}</span>;
}

export function HomePage() {
  const [activeCategory, setActiveCategory] = useState('全部');
  const categories = ['全部', '解剖学', '生理学', '药理学', '外科学', '微生物学'];

  const filteredExperiments = activeCategory === '全部'
    ? experiments
    : experiments.filter(e => e.category === activeCategory);

  return (
    <div className="bg-[#F0F4F8]">
      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-[calc(100vh-65px)] flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src={HERO_BG}
            alt="Medical Virtual Lab"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B1929]/95 via-[#0B2848]/85 to-[#0B3A6B]/60" />
          {/* Decorative grid */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: 'linear-gradient(#1E88E5 1px, transparent 1px), linear-gradient(90deg, #1E88E5 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />
        </div>

        {/* Animated dots */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-[#1E88E5]"
              style={{
                left: `${15 + i * 14}%`,
                top: `${20 + (i % 3) * 25}%`,
              }}
              animate={{ y: [-8, 8, -8], opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}
            />
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text content */}
          <div>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full backdrop-blur-sm mb-6"
            >
              <span className="w-2 h-2 bg-[#00E676] rounded-full animate-pulse" />
              <span className="text-white/90 text-sm">国家级虚拟仿真实验教学示范中心</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-white mb-4"
              style={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.2 }}
            >
              探索人体奥秘，
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#42A5F5] to-[#26C6DA]">
                虚拟仿真
              </span>
              赋能医学教育
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-white/70 text-lg mb-8 leading-relaxed"
            >
              基于WebGL与VR技术，提供52个高仿真医学虚拟实验项目，
              18门系统化实验课程，让实验不再受时间、空间和设备限制。
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-3 mb-10"
            >
              <Link
                to="/experiments"
                className="flex items-center gap-2 px-6 py-3 bg-[#1E88E5] hover:bg-[#1976D2] text-white rounded-xl transition-all shadow-lg shadow-[#1E88E5]/30 hover:shadow-[#1E88E5]/50"
              >
                <FlaskConical size={18} />
                进入实验大厅
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/courses"
                className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-xl transition-all backdrop-blur-sm"
              >
                <BookOpen size={18} />
                浏览实验课程
              </Link>
            </motion.div>

            {/* Stats mini */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-3 gap-4"
            >
              {[
                { value: '52+', label: '实验项目' },
                { value: '18', label: '实验课程' },
                { value: '1.2万+', label: '学生用户' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-white text-2xl font-bold">{stat.value}</div>
                  <div className="text-white/50 text-xs mt-0.5">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: Feature cards */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="hidden lg:grid grid-cols-2 gap-4"
          >
            {techFeatures.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 hover:bg-white/15 transition-all cursor-default"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: feature.color + '30' }}
                >
                  <feature.icon size={20} style={{ color: feature.color }} />
                </div>
                <h3 className="text-white text-sm font-semibold mb-1">{feature.title}</h3>
                <p className="text-white/50 text-xs">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center pt-2">
            <div className="w-1.5 h-3 bg-white/60 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* ===== STATS SECTION ===== */}
      <section className="relative z-10 -mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl shadow-xl border border-[#E2E8F0] p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            {statsData.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: stat.bg }}
                >
                  <stat.icon size={22} style={{ color: stat.color }} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#1A2332]">
                    <CountUp end={stat.value} />
                    <span className="text-sm font-normal text-[#64748B] ml-1">{stat.unit}</span>
                  </div>
                  <div className="text-xs text-[#64748B]">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CENTER INTRO SECTION ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="w-8 h-0.5 bg-[#0B5394]" />
              <span className="text-[#0B5394] text-sm font-medium uppercase tracking-wider">Center Overview</span>
            </div>
            <h2 className="text-[#1A2332] mb-4" style={{ fontSize: '1.75rem', fontWeight: 700 }}>
              实验中心概况
            </h2>
            <p className="text-[#64748B] leading-relaxed mb-4">
              某医科大学虚拟仿真实验教学中心成立于2018年，依托国家级医学实验教学示范中心，致力于以现代信息技术深度融合医学实验教学，打造"可重复、无风险、跨时空"的创新实验教学环境。
            </p>
            <p className="text-[#64748B] leading-relaxed mb-6">
              中心现已开发涵盖基础医学、临床医学、药学等专业的虚拟仿真实验项目52个，构建18门系统化实验课程，年服务学生逾1.2万人次，是教育部认定的国家级虚拟仿真实验教学示范中心。
            </p>
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              {['国家级示范中心', '省级重点实验室', '教育部认证', '国际合作基地'].map((badge) => (
                <span key={badge} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E3F2FD] text-[#0B5394] rounded-lg text-xs font-medium">
                  <Award size={12} />
                  {badge}
                </span>
              ))}
            </div>
            <Link
              to="/lab-intro"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0B5394] text-white rounded-xl hover:bg-[#1565C0] transition-colors text-sm"
            >
              了解更多
              <ChevronRight size={16} />
            </Link>
          </motion.div>

          {/* Image grid */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-3"
          >
            <div className="col-span-2 rounded-2xl overflow-hidden h-48">
              <img
                src="https://images.unsplash.com/photo-1774277602359-d5dfed73aa98?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800"
                alt="Laboratory"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="rounded-2xl overflow-hidden h-36">
              <img
                src="https://images.unsplash.com/photo-1743767588158-72174d1898a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400"
                alt="3D Anatomy"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="rounded-2xl overflow-hidden h-36">
              <img
                src="https://images.unsplash.com/photo-1658555012297-edb48f0c2d4c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400"
                alt="VR Experience"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== EXPERIMENTS SECTION ===== */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-8 h-0.5 bg-[#0B5394]" />
                <span className="text-[#0B5394] text-sm font-medium uppercase tracking-wider">Virtual Experiments</span>
              </div>
              <h2 className="text-[#1A2332]" style={{ fontSize: '1.75rem', fontWeight: 700 }}>
                精选虚拟仿真实验
              </h2>
            </div>
            <Link
              to="/experiments"
              className="flex items-center gap-1.5 text-[#0B5394] text-sm hover:text-[#1565C0] transition-colors whitespace-nowrap"
            >
              查看全部实验 <ArrowRight size={15} />
            </Link>
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm transition-all ${
                  activeCategory === cat
                    ? 'bg-[#0B5394] text-white shadow-sm'
                    : 'bg-[#F0F4F8] text-[#64748B] hover:bg-[#E3F2FD] hover:text-[#0B5394]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Experiment cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {(filteredExperiments.length > 0 ? filteredExperiments : experiments).slice(0, 8).map((exp, i) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden hover:shadow-lg hover:border-[#1E88E5]/30 transition-all duration-300"
              >
                {/* Image */}
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={exp.image}
                    alt={exp.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  {/* Type badge */}
                  <span
                    className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-xs font-medium"
                    style={{ backgroundColor: exp.categoryColor, color: exp.categoryText }}
                  >
                    {exp.category}
                  </span>
                  {/* Type indicator */}
                  <span className={`absolute top-3 right-3 px-2 py-1 rounded-md text-xs font-medium text-white ${
                    exp.type === 'WebGL' ? 'bg-[#0B5394]' : 'bg-[#6A1B9A]'
                  }`}>
                    {exp.typeLabel}
                  </span>
                  {/* Hover overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-2">
                      <Link
                        to={`/experiments/${exp.id}`}
                        className="flex items-center gap-1.5 px-3 py-2 bg-white/90 backdrop-blur-sm text-[#0B5394] rounded-lg text-xs font-medium hover:bg-white transition-colors"
                      >
                        <Eye size={13} /> 查看详情
                      </Link>
                      <button className="flex items-center gap-1.5 px-3 py-2 bg-[#0B5394] text-white rounded-lg text-xs font-medium hover:bg-[#1565C0] transition-colors">
                        <Play size={13} /> 启动实验
                      </button>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <Link to={`/experiments/${exp.id}`}>
                    <h3 className="text-[#1A2332] text-sm font-semibold mb-1.5 line-clamp-1 group-hover:text-[#0B5394] transition-colors">
                      {exp.title}
                    </h3>
                  </Link>
                  <p className="text-[#64748B] text-xs line-clamp-2 mb-3 leading-relaxed">
                    {exp.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[#94A3B8] text-xs">
                      <Users size={12} />
                      <span>{exp.participants.toLocaleString()} 人参与</span>
                    </div>
                    <div className="flex items-center gap-1 text-[#94A3B8] text-xs">
                      <Clock size={12} />
                      <span>{exp.duration}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== NEWS & COURSES TWO-COLUMN ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* News - 3 columns */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Newspaper size={16} className="text-[#0B5394]" />
                  <span className="text-[#0B5394] text-sm font-medium uppercase tracking-wider">News & Updates</span>
                </div>
                <h2 className="text-[#1A2332]" style={{ fontSize: '1.4rem', fontWeight: 700 }}>
                  工作动态
                </h2>
              </div>
              <Link to="/news" className="text-[#0B5394] text-sm hover:text-[#1565C0] flex items-center gap-1">
                更多 <ChevronRight size={15} />
              </Link>
            </div>

            {/* Featured news */}
            {news[0] && (
              <Link to={`/news/${news[0].id}`} className="group block mb-4">
                <div className="bg-white rounded-2xl overflow-hidden border border-[#E2E8F0] hover:shadow-md hover:border-[#1E88E5]/30 transition-all">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={news[0].image}
                      alt={news[0].title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <span className="inline-block px-2 py-0.5 bg-[#0B5394] text-white text-xs rounded mb-2">
                        {news[0].category}
                      </span>
                      <h3 className="text-white text-sm font-semibold line-clamp-2">
                        {news[0].title}
                      </h3>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* News list */}
            <div className="space-y-0">
              {news.slice(1, 5).map((item, i) => (
                <Link
                  key={item.id}
                  to={`/news/${item.id}`}
                  className="group flex items-start gap-3 py-3.5 border-b border-[#E2E8F0] last:border-0 hover:bg-[#F0F4F8] -mx-3 px-3 rounded-lg transition-colors"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-[#E3F2FD] rounded-lg flex items-center justify-center">
                    <Newspaper size={14} className="text-[#0B5394]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#1A2332] text-sm line-clamp-1 group-hover:text-[#0B5394] transition-colors mb-1">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="text-[#94A3B8] text-xs">{item.date}</span>
                      <span className="text-[#64748B] text-xs px-1.5 py-0.5 bg-[#F0F4F8] rounded">
                        {item.category}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-[#CBD5E1] flex-shrink-0 mt-1 group-hover:text-[#0B5394] transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          {/* Right column: Courses + Regulations */}
          <div className="lg:col-span-2 space-y-6">
            {/* Regulations */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-[#0B5394]" />
                  <h3 className="text-[#1A2332] font-semibold text-sm">规章制度</h3>
                </div>
                <Link to="/news" className="text-[#0B5394] text-xs hover:text-[#1565C0]">更多</Link>
              </div>
              <ul className="space-y-2.5">
                {regulations.slice(0, 4).map((reg) => (
                  <li key={reg.id} className="flex items-start gap-2 group cursor-pointer">
                    <div className="w-1.5 h-1.5 bg-[#0B5394] rounded-full mt-1.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-[#1A2332] text-xs group-hover:text-[#0B5394] transition-colors line-clamp-1">
                        {reg.title}
                      </p>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-[#94A3B8] text-xs">{reg.date}</span>
                        {reg.attachment && (
                          <span className="flex items-center gap-0.5 text-[#0B5394] text-xs">
                            <Download size={10} /> 附件
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Course spotlight */}
            <div className="bg-gradient-to-br from-[#0B1929] to-[#0B3A6B] rounded-2xl p-5 text-white">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen size={16} className="text-[#42A5F5]" />
                <h3 className="font-semibold text-sm">热门课程</h3>
              </div>
              <div className="space-y-3">
                {courses.slice(0, 3).map((course) => (
                  <Link
                    key={course.id}
                    to={`/courses/${course.id}`}
                    className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={course.image}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-medium line-clamp-1 group-hover:text-[#42A5F5] transition-colors">
                        {course.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-white/50 text-xs">{course.teacher}</span>
                        <span className="flex items-center gap-0.5 text-[#FFD740] text-xs">
                          <Star size={10} fill="currentColor" />
                          {course.rating}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className="text-white text-xs font-medium">
                        {course.students.toLocaleString()}
                      </div>
                      <div className="text-white/50 text-xs">学员</div>
                    </div>
                  </Link>
                ))}
              </div>
              <Link
                to="/courses"
                className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-[#1E88E5] rounded-xl text-white text-sm hover:bg-[#1976D2] transition-colors"
              >
                查看全部课程 <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== RESOURCE DOWNLOADS ===== */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Download size={16} className="text-[#0B5394]" />
                <span className="text-[#0B5394] text-sm font-medium uppercase tracking-wider">Resources</span>
              </div>
              <h2 className="text-[#1A2332]" style={{ fontSize: '1.4rem', fontWeight: 700 }}>
                资源快速下载
              </h2>
            </div>
            <Link to="/resources" className="text-[#0B5394] text-sm hover:text-[#1565C0] flex items-center gap-1">
              资源中心 <ChevronRight size={15} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'SimHub客户端', desc: 'v2.5.0 Windows', icon: Monitor, color: '#0B5394', size: '186MB' },
              { name: '平台使用手册', desc: '学生版 PDF', icon: BookOpen, color: '#00897B', size: '3.2MB' },
              { name: '解剖学教材', desc: '第九版 PDF', icon: Brain, color: '#6A1B9A', size: '45MB' },
              { name: 'VR驱动包', desc: 'SteamVR 2.0', icon: Cpu, color: '#E65100', size: '312MB' },
              { name: '实验报告模板', desc: 'DOCX格式', icon: Activity, color: '#1565C0', size: '568KB' },
              { name: '快速入门指南', desc: '教师版 PDF', icon: GraduationCap, color: '#2E7D32', size: '1.8MB' },
            ].map((item, i) => (
              <motion.a
                key={item.name}
                href="#"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group flex flex-col items-center text-center p-4 rounded-xl border border-[#E2E8F0] hover:border-[#1E88E5]/30 hover:shadow-md transition-all"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: item.color + '15' }}
                >
                  <item.icon size={22} style={{ color: item.color }} />
                </div>
                <p className="text-[#1A2332] text-xs font-medium mb-0.5">{item.name}</p>
                <p className="text-[#94A3B8] text-xs">{item.desc}</p>
                <p className="text-[#CBD5E1] text-xs mt-1">{item.size}</p>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-br from-[#0B1929] to-[#0B3A6B]">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, #1E88E5 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full mb-6">
              <Microscope size={14} className="text-[#42A5F5]" />
              <span className="text-white/80 text-sm">开始您的虚拟实验之旅</span>
            </div>
            <h2 className="text-white mb-4" style={{ fontSize: '2rem', fontWeight: 700 }}>
              加入 12,847 名医学生，
              <br />
              在虚拟实验室中探索医学奥秘
            </h2>
            <p className="text-white/60 text-base mb-8 max-w-2xl mx-auto">
              无论是基础解剖、生理仿真，还是临床手术技能训练，SimHub
              都为您提供安全、可重复、高仿真的实验学习环境。
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                to="/register"
                className="flex items-center gap-2 px-8 py-3.5 bg-[#1E88E5] hover:bg-[#1976D2] text-white rounded-xl transition-colors shadow-lg text-sm"
              >
                免费注册账号
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/experiments"
                className="flex items-center gap-2 px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl transition-colors text-sm backdrop-blur-sm"
              >
                <Play size={16} />
                立即体验实验
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}