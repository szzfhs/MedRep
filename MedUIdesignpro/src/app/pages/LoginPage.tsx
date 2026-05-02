import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import {
  FlaskConical, Eye, EyeOff, Shield, ArrowRight,
  RefreshCw, User, Lock, Loader2
} from 'lucide-react';

const ROLES = [
  { key: 'student', label: '学生', icon: '👨‍🎓', desc: '使用学号登录' },
  { key: 'teacher', label: '教师', icon: '👨‍🏫', desc: '使用教工号登录' },
  { key: 'admin', label: '管理员', icon: '⚙️', desc: '后台管理账号' },
];

// Mock credentials for demo
const MOCK_ACCOUNTS: Record<string, { account: string; password: string; redirect: string }> = {
  student: { account: 'student001', password: '123456', redirect: '/student' },
  teacher: { account: 'teacher001', password: '123456', redirect: '/teacher' },
  admin:   { account: 'admin',      password: 'admin123', redirect: '/admin' },
};

export function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState('student');
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mockCaptcha = 'A8K2';

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!account) errs.account = '请输入账号';
    if (!password) errs.password = '请输入密码';
    if (password && password.length < 6) errs.password = '密码至少6位';
    if (!captcha) errs.captcha = '请输入验证码';
    if (captcha && captcha.toUpperCase() !== mockCaptcha) errs.captcha = '验证码不正确';

    // Credential check
    const mock = MOCK_ACCOUNTS[role];
    if (!errs.account && !errs.password && account && password) {
      if (account !== mock.account || password !== mock.password) {
        errs.password = '账号或密码不正确';
      }
    }
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setErrors({});
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    navigate(MOCK_ACCOUNTS[role].redirect);
  };

  // Auto-fill demo credentials
  const fillDemo = () => {
    const mock = MOCK_ACCOUNTS[role];
    setAccount(mock.account);
    setPassword(mock.password);
    setCaptcha(mockCaptcha);
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] flex">
      {/* Left: Decorative */}
      <div className="hidden lg:flex flex-col flex-1 bg-gradient-to-br from-[#0B1929] via-[#0B3A6B] to-[#0B1929] relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(#1E88E5 1px, transparent 1px), linear-gradient(90deg, #1E88E5 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="relative flex-1 flex flex-col items-center justify-center p-16 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-[#1E88E5] to-[#00897B] rounded-2xl flex items-center justify-center mb-6 shadow-2xl">
            <FlaskConical size={40} className="text-white" />
          </div>
          <h1 className="text-white mb-4" style={{ fontSize: '2rem', fontWeight: 700 }}>
            SimHub<br />虚拟仿真实验平台
          </h1>
          <p className="text-white/60 text-base mb-8 max-w-xs leading-relaxed">
            科技赋能医学教育，打造安全、高效、沉浸的虚拟实验学习环境
          </p>
          {/* Features */}
          <div className="space-y-3 w-full max-w-sm">
            {[
              { icon: '🔬', text: '52个高精度虚拟仿真实验项目' },
              { icon: '📚', text: '18门系统化实验课程体系' },
              { icon: '🎯', text: '智能化实验指导与评分系统' },
              { icon: '🥽', text: '支持WebGL与VR双模式运行' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3 text-left">
                <span className="text-xl">{item.icon}</span>
                <span className="text-white/70 text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="p-6 border-t border-white/10">
          <p className="text-white/30 text-xs text-center">
            © 2025 某医科大学虚拟仿真实验教学中心
          </p>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="w-full lg:w-[480px] flex flex-col justify-center p-8 lg:p-12 bg-white lg:shadow-2xl">
        <div className="max-w-sm mx-auto w-full">
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center gap-2.5 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-[#0B5394] to-[#1E88E5] rounded-xl flex items-center justify-center">
              <FlaskConical size={22} className="text-white" />
            </div>
            <div>
              <div className="text-[#0B5394] font-bold text-base">SimHub</div>
              <div className="text-[#64748B] text-xs">虚拟仿真实验平台</div>
            </div>
          </div>

          <h2 className="text-[#1A2332] mb-1" style={{ fontSize: '1.5rem', fontWeight: 700 }}>欢迎登录</h2>
          <p className="text-[#64748B] text-sm mb-7">请选择您的身份并填写登录信息</p>

          {/* Role selector */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {ROLES.map((r) => (
              <button
                key={r.key}
                onClick={() => { setRole(r.key); setErrors({}); }}
                className={`flex flex-col items-center py-3 px-2 rounded-xl border-2 transition-all ${
                  role === r.key
                    ? 'border-[#0B5394] bg-[#E3F2FD]'
                    : 'border-[#E2E8F0] hover:border-[#1E88E5]/50 hover:bg-[#F0F4F8]'
                }`}
              >
                <span className="text-2xl mb-1">{r.icon}</span>
                <span className={`text-xs font-medium ${role === r.key ? 'text-[#0B5394]' : 'text-[#4A5568]'}`}>
                  {r.label}
                </span>
              </button>
            ))}
          </div>

          {/* Demo credentials hint */}
          <div className="flex items-center justify-between bg-[#F0F9FF] border border-[#BAE6FD] rounded-xl px-4 py-3 mb-5">
            <div>
              <p className="text-[#0369A1] text-xs font-medium mb-0.5">演示账号</p>
              <p className="text-[#0284C7] text-xs font-mono">
                {MOCK_ACCOUNTS[role].account} / {MOCK_ACCOUNTS[role].password}
              </p>
              <p className="text-[#64748B] text-xs mt-0.5">验证码：{mockCaptcha}</p>
            </div>
            <button
              type="button"
              onClick={fillDemo}
              className="flex-shrink-0 px-3 py-1.5 bg-[#0B5394] text-white rounded-lg text-xs font-medium hover:bg-[#1565C0] transition-colors"
            >
              一键填入
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Account */}
            <div>
              <label className="block text-[#1A2332] text-sm font-medium mb-1.5">
                {role === 'student' ? '学号' : role === 'teacher' ? '教工号' : '管理员账号'}
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  type="text"
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  placeholder={role === 'student' ? '请输入学号' : role === 'teacher' ? '请输入教工号' : '请输入管理员账号'}
                  className={`w-full pl-10 pr-4 py-3 bg-[#F8FAFC] border rounded-xl text-sm text-[#1A2332] focus:outline-none focus:bg-white transition-all ${
                    errors.account ? 'border-red-400 focus:border-red-400' : 'border-[#E2E8F0] focus:border-[#0B5394]'
                  }`}
                />
              </div>
              {errors.account && <p className="text-red-500 text-xs mt-1">{errors.account}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-[#1A2332] text-sm font-medium">密码</label>
                <a href="#" className="text-[#0B5394] text-xs hover:underline">忘记密码？</a>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入登录密码"
                  className={`w-full pl-10 pr-12 py-3 bg-[#F8FAFC] border rounded-xl text-sm text-[#1A2332] focus:outline-none focus:bg-white transition-all ${
                    errors.password ? 'border-red-400' : 'border-[#E2E8F0] focus:border-[#0B5394]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Captcha */}
            <div>
              <label className="block text-[#1A2332] text-sm font-medium mb-1.5">图形验证码</label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Shield size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                  <input
                    type="text"
                    value={captcha}
                    onChange={(e) => setCaptcha(e.target.value)}
                    placeholder="请输入验证码"
                    maxLength={4}
                    className={`w-full pl-10 pr-4 py-3 bg-[#F8FAFC] border rounded-xl text-sm text-[#1A2332] focus:outline-none focus:bg-white transition-all ${
                      errors.captcha ? 'border-red-400' : 'border-[#E2E8F0] focus:border-[#0B5394]'
                    }`}
                  />
                </div>
                {/* Mock captcha image */}
                <div className="flex-shrink-0 w-28 h-12 bg-gradient-to-r from-[#E3F2FD] to-[#F0F4F8] border border-[#E2E8F0] rounded-xl flex items-center justify-center cursor-pointer relative overflow-hidden group"
                  onClick={() => {}}>
                  <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, #1E88E5, #1E88E5 2px, transparent 2px, transparent 10px)'
                  }} />
                  <span className="text-[#0B5394] font-bold text-lg tracking-[0.2em] select-none" style={{ fontFamily: 'monospace', transform: 'skew(-5deg)' }}>
                    {mockCaptcha}
                  </span>
                  <RefreshCw size={12} className="absolute bottom-1 right-1.5 text-[#94A3B8] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              {errors.captcha && <p className="text-red-500 text-xs mt-1">{errors.captcha}</p>}
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#0B5394] text-white rounded-xl font-medium text-sm hover:bg-[#1565C0] transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-[#0B5394]/20"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  登录中…
                </>
              ) : (
                <>
                  登录
                  <ArrowRight size={16} />
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-[#E2E8F0]" />
            <span className="text-[#94A3B8] text-xs">还没有账号？</span>
            <div className="flex-1 h-px bg-[#E2E8F0]" />
          </div>

          <Link
            to="/register"
            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-[#E2E8F0] text-[#1A2332] rounded-xl text-sm font-medium hover:border-[#0B5394] hover:text-[#0B5394] transition-all"
          >
            注册新账号
          </Link>

          <p className="text-[#94A3B8] text-xs text-center mt-6">
            登录即代表您同意
            <a href="#" className="text-[#0B5394] hover:underline mx-1">用户服务协议</a>
            和
            <a href="#" className="text-[#0B5394] hover:underline ml-1">隐私政策</a>
          </p>
        </div>
      </div>
    </div>
  );
}