import { motion } from 'motion/react';
import { Link } from 'react-router';
import {
  ChevronRight, Award, Users, FlaskConical, BookOpen,
  MapPin, Phone, Mail, Star, Building2
} from 'lucide-react';
import { teamMembers } from '../data/mockData';

const orgChart = [
  {
    title: '实验教学中心主任',
    name: '王建华 教授',
    dept: '统筹管理',
    color: '#0B5394',
  },
  {
    title: '教学副主任',
    name: '李晓华 副教授',
    dept: '教学协调',
    color: '#00897B',
  },
  {
    title: '技术总监',
    name: '张国华 高工',
    dept: '技术支持',
    color: '#6A1B9A',
  },
  {
    title: '实验主管',
    name: '陈美玲 讲师',
    dept: '实验管理',
    color: '#E65100',
  },
];

const achievements = [
  { label: '国家级示范中心', year: '2022年获批', icon: Award, color: '#0B5394' },
  { label: '省级重点实验室', year: '2020年获批', icon: Building2, color: '#00897B' },
  { label: '国家级精品课程', year: '3门认定', icon: BookOpen, color: '#6A1B9A' },
  { label: '发表教学论文', year: '逾50篇', icon: Star, color: '#E65100' },
];

const functions = [
  '开发高质量虚拟仿真实验项目，替代高危险性、不可逆、不可重复的真实实验',
  '构建系统化虚拟实验课程体系，覆盖基础医学到临床实践全链条',
  '建设数字化教学资源库，提供电子教材、视频、课件等多类型资源',
  '为教师提供虚拟仿真实验教学技能培训与技术支持',
  '开展省内外高校间虚拟仿真实验教学资源共享与协作',
  '持续探索"线上虚拟+线下实体"混合式实验教学创新模式',
];

export function LabIntroPage() {
  return (
    <div className="min-h-screen bg-[#F0F4F8]">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/placeholder.svg"
            alt="Lab Center"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B1929]/95 to-[#0B3A6B]/80" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <div className="flex items-center gap-2 text-white/50 text-sm mb-4">
            <Link to="/" className="hover:text-white">首页</Link>
            <ChevronRight size={13} />
            <span className="text-white/80">实验中心介绍</span>
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 border border-white/20 rounded-full mb-4">
              <Award size={14} className="text-[#FFD740]" />
              <span className="text-white/80 text-sm">国家级虚拟仿真实验教学示范中心</span>
            </div>
            <h1 className="text-white mb-3" style={{ fontSize: '2.2rem', fontWeight: 700 }}>
              某医科大学<br />虚拟仿真实验教学中心
            </h1>
            <p className="text-white/60 text-base max-w-xl leading-relaxed">
              依托国家级医学实验教学示范中心，以现代信息技术深度融合医学实验教学，
              构建开放共享的虚拟仿真实验教学新生态。
            </p>
          </motion.div>
        </div>
      </div>

      {/* Achievement Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl border border-[#E2E8F0] p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: '2018', label: '中心成立年份', sub: 'Since' },
            { value: '52', label: '虚拟仿真实验项目', sub: '个' },
            { value: '1.2万+', label: '年服务学生', sub: '人次' },
            { value: '18', label: '实验课程', sub: '门' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="text-center"
            >
              <div className="text-[#0B5394] font-bold text-3xl">{stat.value}</div>
              <div className="text-[#64748B] text-sm mt-0.5">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        {/* Center Introduction */}
        <section className="grid lg:grid-cols-2 gap-10 items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-8 h-0.5 bg-[#0B5394]" />
              <span className="text-[#0B5394] text-sm font-medium uppercase tracking-wider">Center Introduction</span>
            </div>
            <h2 className="text-[#1A2332] mb-4" style={{ fontSize: '1.6rem', fontWeight: 700 }}>中心简介</h2>
            <div className="space-y-3 text-[#64748B] text-sm leading-relaxed">
              <p>
                某医科大学虚拟仿真实验教学中心成立于2018年，依托我校国家级基础医学实验教学示范中心建设而成，
                是教育部认定的国家级虚拟仿真实验教学示范中心之一。
              </p>
              <p>
                中心以"精准仿真、开放共享、创新发展"为建设理念，充分利用虚拟现实（VR）、
                增强现实（AR）、WebGL三维交互等技术，开发了涵盖人体解剖、临床技能、
                药物作用、微生物实验等多领域的高质量虚拟仿真实验项目。
              </p>
              <p>
                目前中心已建成52个虚拟仿真实验项目，开设18门系统化实验课程，
                配套数字教材、视频、课件等各类教学资源384件，年均服务在校生超过1.2万人次。
              </p>
              <p>
                中心积极推动省内外高校间教学资源开放共享，已与8所高校签署合作协议，
                共享优质实验教学资源，有效扩大了优质医学教育资源的辐射范围。
              </p>
            </div>

            {/* Achievements */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              {achievements.map((item) => (
                <div key={item.label} className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: item.color + '15' }}>
                    <item.icon size={16} style={{ color: item.color }} />
                  </div>
                  <div>
                    <p className="text-[#1A2332] text-xs font-medium">{item.label}</p>
                    <p className="text-[#94A3B8] text-xs">{item.year}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl overflow-hidden h-52 col-span-2">
                <img src="/placeholder.svg" alt="Lab" className="w-full h-full object-cover" />
              </div>
              <div className="rounded-2xl overflow-hidden h-36">
                <img src="/placeholder.svg" alt="VR Lab" className="w-full h-full object-cover" />
              </div>
              <div className="rounded-2xl overflow-hidden h-36">
                <img src="/placeholder.svg" alt="Digital" className="w-full h-full object-cover" />
              </div>
            </div>
          </motion.div>
        </section>

        {/* Org Chart */}
        <section className="bg-white rounded-2xl border border-[#E2E8F0] p-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-0.5 bg-[#0B5394]" />
            <span className="text-[#0B5394] text-sm font-medium uppercase tracking-wider">Organization</span>
          </div>
          <h2 className="text-[#1A2332] mb-6" style={{ fontSize: '1.4rem', fontWeight: 700 }}>组织架构</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {orgChart.map((item) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center p-5 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]"
              >
                <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-3 text-white font-bold text-xl" style={{ backgroundColor: item.color }}>
                  {item.name.charAt(0)}
                </div>
                <p className="text-[#94A3B8] text-xs mb-0.5">{item.title}</p>
                <p className="text-[#1A2332] text-sm font-semibold">{item.name}</p>
                <span className="inline-block mt-1.5 px-2 py-0.5 rounded-md text-xs" style={{ backgroundColor: item.color + '15', color: item.color }}>
                  {item.dept}
                </span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-0.5 bg-[#0B5394]" />
            <span className="text-[#0B5394] text-sm font-medium uppercase tracking-wider">Our Team</span>
          </div>
          <h2 className="text-[#1A2332] mb-6" style={{ fontSize: '1.4rem', fontWeight: 700 }}>核心团队</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {teamMembers.map((member, i) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden hover:shadow-lg transition-all"
              >
                <div className="h-48 overflow-hidden">
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-4">
                  <h3 className="text-[#1A2332] font-semibold mb-0.5">{member.name}</h3>
                  <p className="text-[#0B5394] text-xs mb-1">{member.title}</p>
                  <p className="text-[#64748B] text-xs mb-3">{member.specialty}</p>
                  <p className="text-[#64748B] text-xs leading-relaxed line-clamp-3">{member.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Functions */}
        <section className="bg-gradient-to-br from-[#0B1929] to-[#0B3A6B] rounded-2xl p-8 text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-0.5 bg-[#1E88E5]" />
            <span className="text-[#42A5F5] text-sm font-medium uppercase tracking-wider">Core Functions</span>
          </div>
          <h2 className="mb-6" style={{ fontSize: '1.4rem', fontWeight: 700 }}>基本职能</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {functions.map((fn, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="flex items-start gap-3 bg-white/5 rounded-xl p-4"
              >
                <div className="w-7 h-7 bg-[#1E88E5]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-[#42A5F5] text-xs font-bold">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <p className="text-white/80 text-sm leading-relaxed">{fn}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="bg-white rounded-2xl border border-[#E2E8F0] p-8">
          <h2 className="text-[#1A2332] mb-6" style={{ fontSize: '1.4rem', fontWeight: 700 }}>联系我们</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: MapPin, label: '地址', value: '某市某区大学路XX号 医学院A栋3层实验中心', color: '#0B5394' },
              { icon: Phone, label: '电话', value: '021-XXXX-XXXX（工作日 8:30-17:30）', color: '#00897B' },
              { icon: Mail, label: '邮箱', value: 'simhub@medical.edu.cn', color: '#6A1B9A' },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: item.color + '15' }}>
                  <item.icon size={18} style={{ color: item.color }} />
                </div>
                <div>
                  <p className="text-[#94A3B8] text-xs mb-1">{item.label}</p>
                  <p className="text-[#1A2332] text-sm">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
