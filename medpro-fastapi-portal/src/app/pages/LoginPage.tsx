import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import {
  FlaskConical, Eye, EyeOff, Shield, ArrowRight,
  RefreshCw, User, Lock, Loader2
} from 'lucide-react';
import { useAuth } from '@/stores/auth';
import { getCaptchaImage } from '@/api/auth';

const ROLES = [
  { key: 'student', label: '学生', icon: '👨‍🎓', desc: '使用学号登录' },
  { key: 'teacher', label: '教师', icon: '👨‍🏫', desc: '使用教工号登录' },
  { key: 'admin', label: '管理员', icon: '⚙️', desc: '后台管理账号' },
];

const REDIRECT_MAP: Record<string, string> = {
  admin: '/admin',
  teacher: '/teacher',
  student: '/student',
};

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoggedIn, role } = useAuth();

  const [selectedRole, setSelectedRole] = useState('student');
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 验证码状态
  const [captchaImg, setCaptchaImg] = useState('');
  const [captchaUuid, setCaptchaUuid] = useState('');
  const [captchaEnabled, setCaptchaEnabled] = useState(false);
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const [registerEnabled, setRegisterEnabled] = useState(true);

  // 已登录则直接跳转
  useEffect(() => {
    if (isLoggedIn && role) {
      navigate(REDIRECT_MAP[role] ?? '/', { replace: true });
    }
  }, [isLoggedIn, role, navigate]);

  // 获取验证码
  const fetchCaptcha = async () => {
    try {
      setCaptchaLoading(true);
      const data = await getCaptchaImage();
      setCaptchaEnabled(data.captchaEnabled);
      setRegisterEnabled(data.registerEnabled);
      if (data.captchaEnabled) {
        setCaptchaImg(data.img);
        setCaptchaUuid(data.uuid);
        setCaptcha('');
      }
    } catch {
      // 获取验证码失败不阻断登录
    } finally {
      setCaptchaLoading(false);
    }
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!account.trim()) errs.account = '请输入账号';
    if (!password) errs.password = '请输入密码';
    if (password && password.length < 5) errs.password = '密码至少5位';
    if (captchaEnabled && !captcha.trim()) errs.captcha = '请输入验证码';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setErrors({});
    try {
      await login({
        username: account.trim(),
        password,
        code: captchaEnabled ? captcha.trim() : undefined,
        uuid: captchaEnabled ? captchaUuid : undefined,
      });
      // 登录成功后 useEffect 会自动根据 role 跳转
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '登录失败，请重试';
      setErrors({ password: msg });
      fetchCaptcha();
    } finally {
      setLoading(false);
    }
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
          {/* Slogans */}
          <div className="w-full max-w-sm space-y-5">
            {[
              {
                title: '突破时空，随时随地实验',
                desc: '无需预约、不受场地限制，打开浏览器即可开始实验',
              },
              {
                title: '沉浸体验，真实操作感',
                desc: 'WebGL 三维交互与 VR 头显双模式，还原真实临床场景',
              },
              {
                title: '数据驱动，精准评估成长',
                desc: '全程记录实验轨迹，AI 实时评分与反馈，助力教学质量提升',
              },
              {
                title: '医教协同，服务临床教育',
                desc: '联合一线医学专家共同设计，内容符合执业医师培训标准',
              },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3 text-left">
                <div className="w-1 h-full min-h-[2.5rem] rounded-full bg-gradient-to-b from-[#1E88E5] to-[#00897B] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white/90 text-sm font-semibold leading-snug">{item.title}</p>
                  <p className="text-white/45 text-xs mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
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
                type="button"
                onClick={() => { setSelectedRole(r.key); setErrors({}); }}
                className={`flex flex-col items-center py-3 px-2 rounded-xl border-2 transition-all ${
                  selectedRole === r.key
                    ? 'border-[#0B5394] bg-[#E3F2FD]'
                    : 'border-[#E2E8F0] hover:border-[#1E88E5]/50 hover:bg-[#F0F4F8]'
                }`}
              >
                <span className="text-2xl mb-1">{r.icon}</span>
                <span className={`text-xs font-medium ${selectedRole === r.key ? 'text-[#0B5394]' : 'text-[#4A5568]'}`}>
                  {r.label}
                </span>
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Account */}
            <div>
              <label className="block text-[#1A2332] text-sm font-medium mb-1.5">
                {selectedRole === 'student' ? '学号' : selectedRole === 'teacher' ? '教工号' : '管理员账号'}
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  type="text"
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  placeholder={selectedRole === 'student' ? '请输入学号' : selectedRole === 'teacher' ? '请输入教工号' : '请输入管理员账号'}
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
            {captchaEnabled && (
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
                      maxLength={6}
                      className={`w-full pl-10 pr-4 py-3 bg-[#F8FAFC] border rounded-xl text-sm text-[#1A2332] focus:outline-none focus:bg-white transition-all ${
                        errors.captcha ? 'border-red-400' : 'border-[#E2E8F0] focus:border-[#0B5394]'
                      }`}
                    />
                  </div>
                  {/* 真实验证码图片 */}
                  <button
                    type="button"
                    onClick={fetchCaptcha}
                    disabled={captchaLoading}
                    className="flex-shrink-0 w-28 h-12 bg-[#F0F4F8] border border-[#E2E8F0] rounded-xl flex items-center justify-center cursor-pointer overflow-hidden hover:border-[#0B5394] transition-colors group"
                  >
                    {captchaLoading ? (
                      <Loader2 size={18} className="text-[#94A3B8] animate-spin" />
                    ) : captchaImg ? (
                      <img
                        src={captchaImg.startsWith('data:') ? captchaImg : `data:image/png;base64,${captchaImg}`}
                        alt="验证码"
                        className="w-full h-full object-fill"
                      />
                    ) : (
                      <RefreshCw size={16} className="text-[#94A3B8]" />
                    )}
                  </button>
                </div>
                {errors.captcha && <p className="text-red-500 text-xs mt-1">{errors.captcha}</p>}
              </div>
            )}

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

          {registerEnabled ? (
            <Link
              to="/register"
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-[#E2E8F0] text-[#1A2332] rounded-xl text-sm font-medium hover:border-[#0B5394] hover:text-[#0B5394] transition-all"
            >
              注册新账号
            </Link>
          ) : (
            <p className="text-center text-[#94A3B8] text-xs py-2">此平台暂未开放自主注册，请联系管理员开通账号</p>
          )}

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