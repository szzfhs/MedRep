import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Save, Plus, Trash2, Edit, X, FlaskConical,
  Users, Image, CheckCircle, Eye, RefreshCw
} from 'lucide-react';
import { teamMembers as initialTeam, stats as initialStats } from '../../data/mockData';

type TeamMember = typeof initialTeam[0];
type StatItem = { label: string; value: string; unit: string; icon: string };

const defaultIntro = {
  title: '虚拟仿真实验教学中心',
  subtitle: 'Virtual Simulation Experimental Teaching Center',
  description: `本中心成立于2018年，是集虚拟仿真实验教学资源建设、开放共享与应用推广于一体的综合性教学平台。中心依托学校基础医学、临床医学、药学等优势学科，自主研发和引进了涵盖解剖学、生理学、药理学、外科学等多个学科领域的虚拟仿真实验项目超过52个，构建了完整的医学虚拟仿真实验教学资源体系。

中心秉承"以学生为中心"的教育理念，充分发挥虚拟仿真技术在医学实验教学中的独特优势，为学生提供安全、可重复、高效的实验学习环境。平台现已服务在校生及社会学习者超过12,000人次，与省内多所高校建立了资源共享合作关系，并于2025年荣获"国家级虚拟仿真实验教学示范中心"称号。`,
  vision: '打造国内一流的医学虚拟仿真实验教学平台，推动医学教育现代化与数字化转型，为培养高素质医学人才贡献力量。',
  mission: '利用先进的虚拟仿真技术，创建高质量、可重复使用的医学实验教学资源，让每一位医学生都能获得充分、规范的实验训练机会。',
};

type FormMode = null | 'intro' | 'member' | 'stat';

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
          <h3 className="text-[#1A2332] font-semibold">{title}</h3>
          <button onClick={onClose} className="p-2 text-[#94A3B8] hover:text-[#1A2332] hover:bg-[#F0F4F8] rounded-lg"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </motion.div>
    </div>
  );
}

function ConfirmDialog({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4"><Trash2 size={22} className="text-[#E53935]" /></div>
        <h3 className="text-[#1A2332] font-semibold text-center mb-2">确认删除</h3>
        <p className="text-[#64748B] text-sm text-center mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 border border-[#E2E8F0] rounded-xl text-[#64748B] text-sm hover:bg-[#F0F4F8]">取消</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 bg-[#E53935] text-white rounded-xl text-sm font-medium hover:bg-[#C62828]">确认</button>
        </div>
      </motion.div>
    </div>
  );
}

export function LabIntroManagePage() {
  const [intro, setIntro] = useState(defaultIntro);
  const [introForm, setIntroForm] = useState(defaultIntro);
  const [team, setTeam] = useState<TeamMember[]>(initialTeam);
  const [stats, setStats] = useState<StatItem[]>(initialStats);
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [editMember, setEditMember] = useState<TeamMember | null>(null);
  const [editStat, setEditStat] = useState<StatItem | null>(null);
  const [deleteMember, setDeleteMember] = useState<TeamMember | null>(null);
  const [memberForm, setMemberForm] = useState({ name: '', title: '', specialty: '', bio: '', image: '' });
  const [statForm, setStatForm] = useState({ label: '', value: '', unit: '', icon: '' });
  const [savedIntro, setSavedIntro] = useState(false);

  const openEditIntro = () => { setIntroForm({ ...intro }); setFormMode('intro'); };
  const saveIntro = () => { setIntro({ ...introForm }); setFormMode(null); setSavedIntro(true); setTimeout(() => setSavedIntro(false), 2000); };

  const openAddMember = () => { setMemberForm({ name: '', title: '', specialty: '', bio: '', image: '' }); setEditMember(null); setFormMode('member'); };
  const openEditMember = (m: TeamMember) => { setMemberForm({ name: m.name, title: m.title, specialty: m.specialty, bio: m.bio, image: m.image }); setEditMember(m); setFormMode('member'); };
  const saveMember = () => {
    if (editMember) {
      setTeam(prev => prev.map(m => m.id === editMember.id ? { ...m, ...memberForm } : m));
    } else {
      setTeam(prev => [...prev, { ...memberForm, id: String(Date.now()) }]);
    }
    setFormMode(null);
  };

  const openEditStat = (s: StatItem) => { setStatForm({ ...s }); setEditStat(s); setFormMode('stat'); };
  const saveStat = () => {
    if (editStat) {
      setStats(prev => prev.map(s => s.label === editStat.label ? { ...statForm } : s));
    }
    setFormMode(null);
  };

  const inputCls = "w-full px-3 py-2.5 border border-[#E2E8F0] rounded-xl text-sm text-[#1A2332] focus:outline-none focus:border-[#0B5394] bg-white";
  const Field = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
    <div>
      <label className="block text-xs font-medium text-[#64748B] mb-1.5">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      {children}
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-[#1A2332] font-bold" style={{ fontSize: '1.1rem' }}>实验中心介绍管理</h1>
          <p className="text-[#64748B] text-sm mt-0.5">编辑前台展示的中心介绍、团队及统计数据</p>
        </div>
      </div>

      {/* Intro Section */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#E3F2FD] rounded-lg flex items-center justify-center">
              <FlaskConical size={16} className="text-[#0B5394]" />
            </div>
            <h2 className="text-[#1A2332] font-semibold">中心介绍文本</h2>
          </div>
          <div className="flex items-center gap-2">
            {savedIntro && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1.5 text-[#2E7D32] text-sm bg-[#E8F5E9] px-3 py-1.5 rounded-lg">
                <CheckCircle size={13} /> 已保存
              </motion.div>
            )}
            <button onClick={openEditIntro}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#0B5394] text-white rounded-xl text-sm font-medium hover:bg-[#1565C0] transition-colors">
              <Edit size={14} /> 编辑内容
            </button>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-[#94A3B8] mb-1">主标题</p>
            <p className="text-[#1A2332] font-semibold">{intro.title}</p>
            <p className="text-[#64748B] text-sm">{intro.subtitle}</p>
          </div>
          <div>
            <p className="text-xs text-[#94A3B8] mb-1">中心简介</p>
            <p className="text-[#64748B] text-sm leading-relaxed line-clamp-3">{intro.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-[#94A3B8] mb-1">愿景</p>
              <p className="text-[#64748B] text-sm line-clamp-2">{intro.vision}</p>
            </div>
            <div>
              <p className="text-xs text-[#94A3B8] mb-1">使命</p>
              <p className="text-[#64748B] text-sm line-clamp-2">{intro.mission}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[#1A2332] font-semibold flex items-center gap-2">
            <div className="w-8 h-8 bg-[#E0F2F1] rounded-lg flex items-center justify-center">
              <span className="text-[#00897B] text-sm font-bold">#</span>
            </div>
            数据统计展示
          </h2>
          <p className="text-[#94A3B8] text-xs">点击各项可直接编辑</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map((s) => (
            <motion.div key={s.label} whileHover={{ scale: 1.02 }}
              className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E2E8F0] cursor-pointer hover:border-[#0B5394] transition-colors group"
              onClick={() => openEditStat(s)}>
              <div className="text-[#1A2332] font-bold text-2xl">{s.value}<span className="text-[#64748B] text-sm font-normal ml-1">{s.unit}</span></div>
              <div className="text-[#94A3B8] text-xs mt-1">{s.label}</div>
              <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[#0B5394] text-xs flex items-center gap-1"><Edit size={10} /> 点击编辑</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[#1A2332] font-semibold flex items-center gap-2">
            <div className="w-8 h-8 bg-[#F3E5F5] rounded-lg flex items-center justify-center">
              <Users size={16} className="text-[#6A1B9A]" />
            </div>
            团队成员管理
          </h2>
          <button onClick={openAddMember}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#6A1B9A] text-white rounded-xl text-sm font-medium hover:bg-[#7B1FA2] transition-colors">
            <Plus size={14} /> 添加成员
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {team.map((m) => (
            <motion.div key={m.id} layout
              className="flex items-start gap-4 p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] hover:border-[#6A1B9A]/30 transition-colors group">
              <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-[#E3F2FD]">
                <img src={m.image} alt={m.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[#1A2332] font-semibold text-sm">{m.name}</div>
                    <div className="text-[#6A1B9A] text-xs">{m.title}</div>
                    <div className="text-[#94A3B8] text-xs">{m.specialty}</div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEditMember(m)} className="p-1.5 text-[#64748B] hover:text-[#6A1B9A] hover:bg-[#F3E5F5] rounded-lg transition-colors"><Edit size={13} /></button>
                    <button onClick={() => setDeleteMember(m)} className="p-1.5 text-[#E53935] hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={13} /></button>
                  </div>
                </div>
                <p className="text-[#64748B] text-xs mt-1.5 line-clamp-2">{m.bio}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Edit Intro Modal */}
      <AnimatePresence>
        {formMode === 'intro' && (
          <Modal title="编辑中心介绍" onClose={() => setFormMode(null)}>
            <div className="p-6 space-y-4">
              <Field label="主标题" required>
                <input className={inputCls} value={introForm.title} onChange={e => setIntroForm(f => ({ ...f, title: e.target.value }))} />
              </Field>
              <Field label="英文副标题">
                <input className={inputCls} value={introForm.subtitle} onChange={e => setIntroForm(f => ({ ...f, subtitle: e.target.value }))} />
              </Field>
              <Field label="中心简介" required>
                <textarea className={`${inputCls} resize-none`} rows={6} value={introForm.description}
                  onChange={e => setIntroForm(f => ({ ...f, description: e.target.value }))} />
              </Field>
              <Field label="愿景">
                <textarea className={`${inputCls} resize-none`} rows={2} value={introForm.vision}
                  onChange={e => setIntroForm(f => ({ ...f, vision: e.target.value }))} />
              </Field>
              <Field label="使命">
                <textarea className={`${inputCls} resize-none`} rows={2} value={introForm.mission}
                  onChange={e => setIntroForm(f => ({ ...f, mission: e.target.value }))} />
              </Field>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setFormMode(null)} className="flex-1 py-2.5 border border-[#E2E8F0] rounded-xl text-[#64748B] text-sm hover:bg-[#F0F4F8]">取消</button>
                <button onClick={saveIntro} className="flex-1 py-2.5 bg-[#0B5394] text-white rounded-xl text-sm font-medium hover:bg-[#1565C0] flex items-center justify-center gap-2">
                  <Save size={14} /> 保存
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Edit Member Modal */}
      <AnimatePresence>
        {formMode === 'member' && (
          <Modal title={editMember ? '编辑团队成员' : '添加团队成员'} onClose={() => setFormMode(null)}>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="姓名" required>
                  <input className={inputCls} value={memberForm.name} onChange={e => setMemberForm(f => ({ ...f, name: e.target.value }))} placeholder="请输入姓名" />
                </Field>
                <Field label="职位/职称" required>
                  <input className={inputCls} value={memberForm.title} onChange={e => setMemberForm(f => ({ ...f, title: e.target.value }))} placeholder="如：中心主任 · 教授" />
                </Field>
              </div>
              <Field label="研究专长">
                <input className={inputCls} value={memberForm.specialty} onChange={e => setMemberForm(f => ({ ...f, specialty: e.target.value }))} placeholder="如：解剖学 · 数字医学教育" />
              </Field>
              <Field label="头像图片URL">
                <input className={inputCls} value={memberForm.image} onChange={e => setMemberForm(f => ({ ...f, image: e.target.value }))} placeholder="https://..." />
              </Field>
              <Field label="个人简介">
                <textarea className={`${inputCls} resize-none`} rows={3} value={memberForm.bio}
                  onChange={e => setMemberForm(f => ({ ...f, bio: e.target.value }))} placeholder="请输入个人简介…" />
              </Field>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setFormMode(null)} className="flex-1 py-2.5 border border-[#E2E8F0] rounded-xl text-[#64748B] text-sm hover:bg-[#F0F4F8]">取消</button>
                <button onClick={saveMember} className="flex-1 py-2.5 bg-[#6A1B9A] text-white rounded-xl text-sm font-medium hover:bg-[#7B1FA2]">{editMember ? '保存修改' : '添加成员'}</button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Edit Stat Modal */}
      <AnimatePresence>
        {formMode === 'stat' && editStat && (
          <Modal title="编辑统计数据" onClose={() => setFormMode(null)}>
            <div className="p-6 space-y-4">
              <Field label="数据标签">
                <input className={inputCls} value={statForm.label} onChange={e => setStatForm(f => ({ ...f, label: e.target.value }))} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="数值">
                  <input className={inputCls} value={statForm.value} onChange={e => setStatForm(f => ({ ...f, value: e.target.value }))} />
                </Field>
                <Field label="单位">
                  <input className={inputCls} value={statForm.unit} onChange={e => setStatForm(f => ({ ...f, unit: e.target.value }))} />
                </Field>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setFormMode(null)} className="flex-1 py-2.5 border border-[#E2E8F0] rounded-xl text-[#64748B] text-sm hover:bg-[#F0F4F8]">取消</button>
                <button onClick={saveStat} className="flex-1 py-2.5 bg-[#0B5394] text-white rounded-xl text-sm font-medium hover:bg-[#1565C0]">保存</button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteMember && (
          <ConfirmDialog message={`确认删除团队成员「${deleteMember.name}」？`}
            onConfirm={() => { setTeam(prev => prev.filter(m => m.id !== deleteMember.id)); setDeleteMember(null); }}
            onCancel={() => setDeleteMember(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
