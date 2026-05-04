import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import {
  ChevronRight, Award, Users, FlaskConical, BookOpen,
  MapPin, Phone, Mail, Star, Building2, Loader2
} from 'lucide-react';
import {
  getFullCenterInfo,
  parseAchievements,
  parseFunctions,
  type FullCenterData,
  type OrgMember,
  type TeamMember,
} from '../../api/center';

/** 图标名称 → Lucide 组件映射 */
const ICON_MAP: Record<string, React.ComponentType<{ size?: number; style?: React.CSSProperties }>> = {
  Award,
  Building2,
  BookOpen,
  Star,
  Users,
  FlaskConical,
};

const DEFAULT_ORG_COLORS = ['#0B5394', '#00897B', '#6A1B9A', '#E65100', '#1565C0', '#2E7D32'];

export function LabIntroPage() {
  const [data, setData] = useState<FullCenterData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFullCenterInfo()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const info = data?.info ?? {};
  const orgMembers: OrgMember[] = data?.orgMembers ?? [];
  const teamMembers: TeamMember[] = data?.teamMembers ?? [];
  const achievements = parseAchievements(info.achievementsJson ?? null);
  const functions = parseFunctions(info.functionsJson ?? null);

  // 将 description 文本按换行拆分为段落
  const descParagraphs = (info.description ?? '')
    .split(/\n+/)
    .map(s => s.trim())
    .filter(Boolean);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#0B5394]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F4F8]">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          {info.bannerUrl ? (
            <img src={info.bannerUrl} alt="Lab Center" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#0B1929] to-[#0B3A6B]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B1929]/95 to-[#0B3A6B]/80" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <div className="flex items-center gap-2 text-white/50 text-sm mb-4">
            <Link to="/" className="hover:text-white">首页</Link>
            <ChevronRight size={13} />
            <span className="text-white/80">实验中心介绍</span>
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {info.heroBadge && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 border border-white/20 rounded-full mb-4">
                <Award size={14} className="text-[#FFD740]" />
                <span className="text-white/80 text-sm">{info.heroBadge}</span>
              </div>
            )}
            <h1 className="text-white mb-3" style={{ fontSize: '2.2rem', fontWeight: 700 }}>
              {info.centerName ?? '虚拟仿真实验教学中心'}
            </h1>
            {info.centerSlogan && (
              <p className="text-white/60 text-base max-w-xl leading-relaxed">{info.centerSlogan}</p>
            )}
          </motion.div>
        </div>
      </div>

      {/* Achievement Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl border border-[#E2E8F0] p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: info.statFoundedYear ?? '—', label: '中心成立年份' },
            { value: info.statExperiments ?? '—', label: '虚拟仿真实验项目' },
            { value: info.statStudents ?? '—', label: '年服务学生' },
            { value: info.statCourses ?? '—', label: '实验课程' },
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
              {descParagraphs.length > 0
                ? descParagraphs.map((p, i) => <p key={i}>{p}</p>)
                : <p className="text-[#94A3B8] italic">暂无介绍内容</p>
              }
            </div>

            {/* Achievements */}
            {achievements.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mt-6">
                {achievements.map((item) => {
                  const IconComp = ICON_MAP[item.iconName] ?? Award;
                  return (
                    <div key={item.label} className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: item.color + '15' }}>
                        <IconComp size={16} style={{ color: item.color }} />
                      </div>
                      <div>
                        <p className="text-[#1A2332] text-xs font-medium">{item.label}</p>
                        <p className="text-[#94A3B8] text-xs">{item.yearDesc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl overflow-hidden h-52 col-span-2 bg-[#E3F2FD] flex items-center justify-center">
                <FlaskConical size={48} className="text-[#0B5394]/30" />
              </div>
              <div className="rounded-2xl overflow-hidden h-36 bg-[#E0F2F1] flex items-center justify-center">
                <span className="text-[#00897B]/40 text-sm font-medium">VR Lab</span>
              </div>
              <div className="rounded-2xl overflow-hidden h-36 bg-[#F3E5F5] flex items-center justify-center">
                <span className="text-[#6A1B9A]/40 text-sm font-medium">Digital</span>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Org Chart */}
        {orgMembers.length > 0 && (
          <section className="bg-white rounded-2xl border border-[#E2E8F0] p-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-0.5 bg-[#0B5394]" />
              <span className="text-[#0B5394] text-sm font-medium uppercase tracking-wider">Organization</span>
            </div>
            <h2 className="text-[#1A2332] mb-6" style={{ fontSize: '1.4rem', fontWeight: 700 }}>组织架构</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {orgMembers.map((item, idx) => {
                const color = item.color ?? DEFAULT_ORG_COLORS[idx % DEFAULT_ORG_COLORS.length];
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center p-5 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]"
                  >
                    <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-3 text-white font-bold text-xl" style={{ backgroundColor: color }}>
                      {item.name.charAt(0)}
                    </div>
                    <p className="text-[#94A3B8] text-xs mb-0.5">{item.titleText}</p>
                    <p className="text-[#1A2332] text-sm font-semibold">{item.name}</p>
                    {item.dept && (
                      <span className="inline-block mt-1.5 px-2 py-0.5 rounded-md text-xs" style={{ backgroundColor: color + '15', color }}>
                        {item.dept}
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {/* Team */}
        {teamMembers.length > 0 && (
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
                  <div className="h-48 overflow-hidden bg-[#E3F2FD] flex items-center justify-center">
                    {member.imageUrl ? (
                      <img src={member.imageUrl} alt={member.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-[#0B5394]/20 flex items-center justify-center text-[#0B5394] font-bold text-3xl">
                        {member.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-[#1A2332] font-semibold mb-0.5">{member.name}</h3>
                    {member.titleRole && <p className="text-[#0B5394] text-xs mb-1">{member.titleRole}</p>}
                    {member.specialty && <p className="text-[#64748B] text-xs mb-3">{member.specialty}</p>}
                    {member.bio && <p className="text-[#64748B] text-xs leading-relaxed line-clamp-3">{member.bio}</p>}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Functions */}
        {functions.length > 0 && (
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
        )}

        {/* Contact */}
        {(info.contactAddress || info.contactPhone || info.contactEmail) && (
          <section className="bg-white rounded-2xl border border-[#E2E8F0] p-8">
            <h2 className="text-[#1A2332] mb-6" style={{ fontSize: '1.4rem', fontWeight: 700 }}>联系我们</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {info.contactAddress && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#0B5394' + '15' }}>
                    <MapPin size={18} style={{ color: '#0B5394' }} />
                  </div>
                  <div>
                    <p className="text-[#94A3B8] text-xs mb-1">地址</p>
                    <p className="text-[#1A2332] text-sm">{info.contactAddress}</p>
                  </div>
                </div>
              )}
              {info.contactPhone && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#00897B' + '15' }}>
                    <Phone size={18} style={{ color: '#00897B' }} />
                  </div>
                  <div>
                    <p className="text-[#94A3B8] text-xs mb-1">电话</p>
                    <p className="text-[#1A2332] text-sm">{info.contactPhone}</p>
                  </div>
                </div>
              )}
              {info.contactEmail && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#6A1B9A' + '15' }}>
                    <Mail size={18} style={{ color: '#6A1B9A' }} />
                  </div>
                  <div>
                    <p className="text-[#94A3B8] text-xs mb-1">邮箱</p>
                    <p className="text-[#1A2332] text-sm">{info.contactEmail}</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

