import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  FlaskConical, Menu, X, ChevronDown, User, LogOut,
  Settings, BookOpen, Microscope, Bell, AppWindow, LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '@/stores/auth';

// Simple direct-link nav — no broken dropdown submenus
const navLinks = [
  { label: '首页', path: '/' },
  { label: '实验中心介绍', path: '/lab-intro' },
  { label: '新闻资讯', path: '/news' },
  { label: '虚拟仿真实验', path: '/experiments' },
  { label: '实验课程', path: '/courses' },
  { label: '资源中心', path: '/resources' },
  { label: '应用中心', path: '/apps' },
];

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, role, userInfo, logout } = useAuth();

  const userName = userInfo?.user?.nickName || userInfo?.user?.userName || '用户';

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  // Derive workbench link from role
  const workbenchPath = role === 'admin' ? '/admin' : role === 'teacher' ? '/teacher' : '/student';
  const workbenchLabel = role === 'admin' ? '后台管理' : role === 'teacher' ? '教师工作台' : '学生工作台';

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await logout();
    navigate('/login');
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white shadow-md border-b border-[#E2E8F0]'
          : 'bg-white/95 backdrop-blur-md border-b border-[#E2E8F0]'
      }`}
    >
      {/* Top accent bar */}
      <div className="h-1 bg-gradient-to-r from-[#0B5394] via-[#1E88E5] to-[#00897B]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-br from-[#0B5394] to-[#1E88E5] rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <FlaskConical size={20} className="text-white" />
            </div>
            <div className="hidden sm:block">
              <div className="text-[#0B5394] font-semibold text-base leading-tight tracking-tight">SimHub</div>
              <div className="text-[#64748B] text-xs leading-tight">虚拟仿真实验平台</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                  isActive(link.path)
                    ? 'text-[#0B5394] bg-[#E3F2FD]'
                    : 'text-[#1A2332] hover:text-[#0B5394] hover:bg-[#F0F4F8]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <>
                <button className="relative p-2 rounded-lg text-[#64748B] hover:text-[#0B5394] hover:bg-[#F0F4F8] transition-colors">
                  <Bell size={18} />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#E53935] rounded-full" />
                </button>
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#F0F4F8] transition-colors"
                  >
                    <div className="w-7 h-7 bg-gradient-to-br from-[#0B5394] to-[#1E88E5] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-medium">{userName.charAt(0)}</span>
                    </div>
                    <span className="hidden sm:block text-sm text-[#1A2332]">{userName}</span>
                    <ChevronDown size={14} className="text-[#64748B]" />
                  </button>
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-[#E2E8F0] overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-[#E2E8F0]">
                          <div className="text-sm font-medium text-[#1A2332]">{userName}</div>
                          <div className="text-xs text-[#64748B]">
                            {role === 'admin' ? '管理员' : role === 'teacher' ? '教师' : '学生'}
                          </div>
                        </div>
                        <Link
                          to={workbenchPath}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#1A2332] hover:bg-[#F0F4F8] transition-colors"
                        >
                          <LayoutDashboard size={14} className="text-[#64748B]" />
                          {workbenchLabel}
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#E53935] hover:bg-red-50 transition-colors"
                        >
                          <LogOut size={14} />
                          退出登录
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="hidden sm:flex items-center px-4 py-2 text-sm text-[#0B5394] border border-[#0B5394] rounded-lg hover:bg-[#E3F2FD] transition-colors"
                >
                  登录
                </Link>
                <Link
                  to="/register"
                  className="flex items-center px-4 py-2 text-sm text-white bg-[#0B5394] rounded-lg hover:bg-[#1565C0] transition-colors shadow-sm"
                >
                  注册
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="lg:hidden p-2 rounded-lg text-[#64748B] hover:bg-[#F0F4F8] transition-colors"
            >
              {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-[#E2E8F0] bg-white overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileOpen(false)}
                  className={`block px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive(link.path)
                      ? 'text-[#0B5394] bg-[#E3F2FD]'
                      : 'text-[#1A2332] hover:bg-[#F0F4F8]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {isLoggedIn ? (
                <Link
                  to={workbenchPath}
                  onClick={() => setIsMobileOpen(false)}
                  className="block px-3 py-2.5 rounded-lg text-sm text-[#0B5394] bg-[#E3F2FD]"
                >
                  {workbenchLabel}
                </Link>
              ) : (
                <div className="flex gap-2 pt-2">
                  <Link to="/login" onClick={() => setIsMobileOpen(false)} className="flex-1 text-center px-4 py-2 text-sm text-[#0B5394] border border-[#0B5394] rounded-lg">
                    登录
                  </Link>
                  <Link to="/register" onClick={() => setIsMobileOpen(false)} className="flex-1 text-center px-4 py-2 text-sm text-white bg-[#0B5394] rounded-lg">
                    注册
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}