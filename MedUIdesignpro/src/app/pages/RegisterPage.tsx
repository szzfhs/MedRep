import { useState } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  FlaskConical, ChevronRight, User, Phone, Mail, Lock,
  Eye, EyeOff, GraduationCap, BookOpen, Building2,
  ArrowRight, ArrowLeft, CheckCircle, Loader2, Upload
} from 'lucide-react';

type RoleType = 'student' | 'teacher' | 'institution' | null;

const STEPS = ['选择身份', '填写信息', '设置密码', '提交审核'];

export function RegisterPage() {
  const [role, setRole] = useState<RoleType>(null);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: '', id: '', dept: '', phone: '', email: '',
    password: '', confirmPassword: '', institution: '',
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const updateForm = (key: string, value: string) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleRoleSelect = (r: RoleType) => {
    setRole(r);
    setStep(1);
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    setLoading(false);
    setDone(true);
  };

  const roles = [
    {
      key: 'student' as RoleType,
      icon: GraduationCap,
      title: '学生注册',
      desc: '需提供学号及班级信息',
      color: '#0B5394',
      bg: '#E3F2FD',
    },
    {
      key: 'teacher' as RoleType,
      icon: BookOpen,
      title: '教师注册',
      desc: '需提供教工号及院系信息',
      color: '#00897B',
      bg: '#E0F2F1',
    },
    {
      key: 'institution' as RoleType,
      icon: Building2,
      title: '学校机构注册',
      desc: '供院校机构账号使用',
      color: '#6A1B9A',
      bg: '#F3E5F5',
    },
  ];

  if (done) {
    return (
      <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl border border-[#E2E8F0] p-10 max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-[#E0F2F1] rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={40} className="text-[#00897B]" />
          </div>
          <h2 className="text-[#1A2332] mb-2" style={{ fontSize: '1.4rem', fontWeight: 700 }}>注册申请已提交</h2>
          <p className="text-[#64748B] text-sm mb-2">
            您的{role === 'student' ? '学生' : role === 'teacher' ? '教师' : '机构'}账号注册申请已成功提交，
          </p>
          <p className="text-[#64748B] text-sm mb-6">
            管理员将在1-3个工作日内完成审核。审核通过后，系统将通过邮件 <strong className="text-[#0B5394]">{form.email}</strong> 通知您。
          </p>
          <div className="bg-[#FFF8E1] rounded-xl p-4 mb-6 text-left">
            <p className="text-[#F57F17] text-xs font-medium mb-1">📋 审核须知</p>
            <p className="text-[#64748B] text-xs leading-relaxed">
              请确保所填信息真实有效。如审核过程中需要补充材料，管理员会通过邮件联系您。
              如有紧急需求，可拨打实验中心联系电话：021-XXXX-XXXX。
            </p>
          </div>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#0B5394] text-white rounded-xl text-sm font-medium hover:bg-[#1565C0] transition-colors"
          >
            前往登录 <ArrowRight size={15} />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F4F8] py-12 px-4">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-8">
        <Link to="/" className="flex items-center gap-2 mb-6">
          <div className="w-9 h-9 bg-gradient-to-br from-[#0B5394] to-[#1E88E5] rounded-lg flex items-center justify-center">
            <FlaskConical size={18} className="text-white" />
          </div>
          <span className="text-[#0B5394] font-bold">SimHub</span>
        </Link>

        <h1 className="text-[#1A2332] mb-1" style={{ fontSize: '1.6rem', fontWeight: 700 }}>注册账号</h1>
        <p className="text-[#64748B] text-sm">创建您的虚拟仿真实验平台账号</p>

        {/* Progress steps */}
        {step > 0 && (
          <div className="flex items-center mt-6">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <div className={`flex items-center gap-2 ${i > 0 ? 'flex-1' : ''}`}>
                  {i > 0 && (
                    <div className={`flex-1 h-0.5 ${i <= step ? 'bg-[#0B5394]' : 'bg-[#E2E8F0]'}`} />
                  )}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    i < step ? 'bg-[#0B5394] text-white' :
                    i === step ? 'bg-[#1E88E5] text-white ring-4 ring-[#1E88E5]/20' :
                    'bg-[#E2E8F0] text-[#94A3B8]'
                  }`}>
                    {i < step ? <CheckCircle size={16} /> : i + 1}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {step > 0 && (
          <div className="flex justify-between mt-1.5">
            {STEPS.map((s, i) => (
              <span key={s} className={`text-xs ${i === step ? 'text-[#0B5394] font-medium' : 'text-[#94A3B8]'}`}>
                {s}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          {/* Step 0: Role Selection */}
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-8"
            >
              <h2 className="text-[#1A2332] font-semibold mb-2">请选择您的注册身份</h2>
              <p className="text-[#64748B] text-sm mb-6">不同身份类型需要提供不同的注册信息</p>
              <div className="grid gap-4">
                {roles.map((r) => (
                  <button
                    key={r.key}
                    onClick={() => handleRoleSelect(r.key)}
                    className="group flex items-center gap-5 p-5 border-2 border-[#E2E8F0] rounded-2xl hover:border-[#0B5394] hover:shadow-md transition-all text-left"
                  >
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform" style={{ backgroundColor: r.bg }}>
                      <r.icon size={26} style={{ color: r.color }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[#1A2332] font-semibold group-hover:text-[#0B5394] transition-colors">{r.title}</p>
                      <p className="text-[#64748B] text-sm mt-0.5">{r.desc}</p>
                    </div>
                    <ChevronRight size={20} className="text-[#CBD5E1] group-hover:text-[#0B5394] transition-colors flex-shrink-0" />
                  </button>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-[#E2E8F0] text-center">
                <span className="text-[#64748B] text-sm">已有账号？</span>
                <Link to="/login" className="text-[#0B5394] text-sm font-medium hover:underline ml-1">
                  立即登录
                </Link>
              </div>
            </motion.div>
          )}

          {/* Step 1: Fill Info */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-8"
            >
              <h2 className="text-[#1A2332] font-semibold mb-5">填写基本信息</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1A2332] mb-1.5">真实姓名 *</label>
                  <input type="text" value={form.name} onChange={e => updateForm('name', e.target.value)}
                    placeholder="请输入真实姓名" className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#0B5394] bg-[#F8FAFC]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1A2332] mb-1.5">
                    {role === 'student' ? '学号' : role === 'teacher' ? '教工号' : '机构统一代码'} *
                  </label>
                  <input type="text" value={form.id} onChange={e => updateForm('id', e.target.value)}
                    placeholder={role === 'student' ? '请输入学号' : role === 'teacher' ? '请输入教工号' : '请输入机构代码'}
                    className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#0B5394] bg-[#F8FAFC]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1A2332] mb-1.5">
                    {role === 'student' ? '所属班级' : role === 'teacher' ? '所属院系' : '机构名称'} *
                  </label>
                  <input type="text" value={form.dept} onChange={e => updateForm('dept', e.target.value)}
                    placeholder="请填写" className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#0B5394] bg-[#F8FAFC]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1A2332] mb-1.5">手机号码 *</label>
                  <input type="tel" value={form.phone} onChange={e => updateForm('phone', e.target.value)}
                    placeholder="请输入手机号" className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#0B5394] bg-[#F8FAFC]" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-[#1A2332] mb-1.5">电子邮箱 *</label>
                  <input type="email" value={form.email} onChange={e => updateForm('email', e.target.value)}
                    placeholder="审核结果将发送至此邮箱" className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#0B5394] bg-[#F8FAFC]" />
                </div>
                {/* File upload hint */}
                <div className="sm:col-span-2 p-4 border-2 border-dashed border-[#E2E8F0] rounded-xl flex flex-col items-center gap-2 cursor-pointer hover:border-[#0B5394] hover:bg-[#F0F4F8] transition-all">
                  <Upload size={22} className="text-[#94A3B8]" />
                  <p className="text-[#64748B] text-sm">上传身份证明材料（可选）</p>
                  <p className="text-[#94A3B8] text-xs">学生证、教职工证等，支持JPG/PNG/PDF</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Password */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-8"
            >
              <h2 className="text-[#1A2332] font-semibold mb-5">设置登录密码</h2>
              <div className="space-y-4 max-w-sm">
                <div>
                  <label className="block text-sm font-medium text-[#1A2332] mb-1.5">登录密码 *</label>
                  <div className="relative">
                    <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => updateForm('password', e.target.value)}
                      placeholder="至少8位，包含字母和数字" className="w-full px-4 pr-12 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#0B5394] bg-[#F8FAFC]" />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]">
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {/* Password strength */}
                  {form.password && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className={`flex-1 h-1 rounded-full ${
                            form.password.length >= i * 2
                              ? form.password.length >= 8 ? 'bg-[#2E7D32]' : 'bg-[#F57F17]'
                              : 'bg-[#E2E8F0]'
                          }`} />
                        ))}
                      </div>
                      <p className={`text-xs ${form.password.length >= 8 ? 'text-[#2E7D32]' : 'text-[#F57F17]'}`}>
                        {form.password.length < 4 ? '密码太弱' : form.password.length < 8 ? '密码强度一般' : '密码强度良好'}
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1A2332] mb-1.5">确认密码 *</label>
                  <input type="password" value={form.confirmPassword} onChange={e => updateForm('confirmPassword', e.target.value)}
                    placeholder="请再次输入密码" className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none bg-[#F8FAFC] ${
                      form.confirmPassword && form.password !== form.confirmPassword
                        ? 'border-red-400 focus:border-red-400'
                        : 'border-[#E2E8F0] focus:border-[#0B5394]'
                    }`} />
                  {form.confirmPassword && form.password !== form.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">两次密码不一致</p>
                  )}
                </div>

                <div className="bg-[#F0F4F8] rounded-xl p-4 text-xs text-[#64748B] space-y-1">
                  <p className="font-medium text-[#1A2332] mb-2">密码要求：</p>
                  {['长度不少于8位', '包含大小写字母', '包含数字', '不使用常见密码'].map(req => (
                    <p key={req} className="flex items-center gap-2">
                      <CheckCircle size={12} className={form.password.length >= 8 ? 'text-[#2E7D32]' : 'text-[#CBD5E1]'} />
                      {req}
                    </p>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Submit */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-8"
            >
              <h2 className="text-[#1A2332] font-semibold mb-5">确认注册信息</h2>
              <div className="bg-[#F8FAFC] rounded-xl p-5 space-y-3 mb-6">
                {[
                  { label: '注册身份', value: role === 'student' ? '学生' : role === 'teacher' ? '教师' : '学校机构' },
                  { label: '真实姓名', value: form.name || '（未填写）' },
                  { label: '证件号码', value: form.id || '（未填写）' },
                  { label: '联系手机', value: form.phone || '（未填写）' },
                  { label: '电子邮箱', value: form.email || '（未填写）' },
                ].map(item => (
                  <div key={item.label} className="flex justify-between">
                    <span className="text-[#94A3B8] text-sm">{item.label}</span>
                    <span className="text-[#1A2332] text-sm font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-start gap-3 p-4 bg-[#FFF8E1] rounded-xl border border-[#FFB74D]/30 mb-6">
                <span className="text-xl flex-shrink-0">ℹ️</span>
                <p className="text-[#64748B] text-xs leading-relaxed">
                  提交后，您的注册申请将进入管理员审核流程。审核通过后方可正式登录使用平台。
                  教师和机构账号通常需要1-3个工作日完成审核。
                </p>
              </div>
              <label className="flex items-start gap-3 cursor-pointer mb-6">
                <input type="checkbox" className="mt-0.5" />
                <span className="text-[#64748B] text-xs leading-relaxed">
                  我已阅读并同意
                  <a href="#" className="text-[#0B5394] hover:underline mx-1">《用户服务协议》</a>
                  和
                  <a href="#" className="text-[#0B5394] hover:underline ml-1">《隐私政策》</a>
                  ，同意平台对我的账号信息进行审核验证。
                </span>
              </label>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        {step > 0 && (
          <div className="flex justify-between mt-5">
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-2 px-5 py-2.5 border border-[#E2E8F0] text-[#64748B] rounded-xl text-sm hover:bg-[#F0F4F8] transition-colors"
            >
              <ArrowLeft size={15} /> 上一步
            </button>
            {step < 3 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#0B5394] text-white rounded-xl text-sm font-medium hover:bg-[#1565C0] transition-colors"
              >
                下一步 <ArrowRight size={15} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#0B5394] text-white rounded-xl text-sm font-medium hover:bg-[#1565C0] transition-colors disabled:opacity-70"
              >
                {loading ? <><Loader2 size={15} className="animate-spin" />提交中…</> : <>提交注册 <ArrowRight size={15} /></>}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
