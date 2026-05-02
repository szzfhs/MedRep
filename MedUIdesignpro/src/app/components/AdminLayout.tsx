import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router';
import {
  FlaskConical, LayoutDashboard, Users, BookOpen, Newspaper,
  Shield, FolderOpen, Settings, ChevronLeft, ChevronRight,
  Bell, User, LogOut, Microscope, ChevronDown, AppWindow,
} from 'lucide-react';

const menuGroups = [
  {
    label: '概览',
    items: [
      { path: '/admin', label: '仪表盘', icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: '用户管理',
    items: [
      { path: '/admin/users', label: '账户管理', icon: Users },
    ],
  },
  {
    label: '内容管理',
    items: [
      { path: '/admin/news', label: '新闻资讯', icon: Newspaper },
      { path: '/admin/regulations', label: '规章制度', icon: Shield },
      { path: '/admin/lab-intro', label: '中心介绍', icon: FlaskConical },
    ],
  },
  {
    label: '教学资源',
    items: [
      { path: '/admin/experiments', label: '实验项目管理', icon: Microscope },
      { path: '/admin/courses', label: '课程管理', icon: BookOpen },
      { path: '/admin/resources', label: '资源中心管理', icon: FolderOpen },
      { path: '/admin/apps', label: '应用管理', icon: AppWindow },
    ],
  },
  {
    label: '系统',
    items: [
      { path: '/admin/settings', label: '系统设置', icon: Settings },
    ],
  },
];

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex bg-[#F0F4F8]">
      {/* Sidebar */}
      <aside
        className={`${collapsed ? 'w-16' : 'w-60'} flex-shrink-0 bg-[#0B1929] flex flex-col transition-all duration-300 sticky top-0 h-screen`}
      >
        {/* Logo */}
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3 px-5'} py-4 border-b border-[#1E2D3D] h-16`}>
          <div className="w-8 h-8 bg-gradient-to-br from-[#1E88E5] to-[#00897B] rounded-lg flex items-center justify-center flex-shrink-0">
            <FlaskConical size={17} className="text-white" />
          </div>
          {!collapsed && (
            <div>
              <div className="text-white text-sm font-bold leading-tight">SimHub</div>
              <div className="text-[#64748B] text-xs">后台管理系统</div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {menuGroups.map((group) => (
            <div key={group.label} className="mb-4">
              {!collapsed && (
                <div className="text-[#475569] text-xs font-medium px-3 mb-1.5 uppercase tracking-wider">
                  {group.label}
                </div>
              )}
              {group.items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-xl mb-0.5 transition-all text-sm ${
                    isActive(item.path, item.exact)
                      ? 'bg-[#0B5394] text-white'
                      : 'text-[#94A3B8] hover:bg-[#1E2D3D] hover:text-white'
                  }`}
                >
                  <item.icon size={17} className="flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {/* Collapse button */}
        <div className="border-t border-[#1E2D3D] p-3">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`w-full flex items-center ${collapsed ? 'justify-center' : 'gap-2'} px-3 py-2 text-[#64748B] hover:text-white hover:bg-[#1E2D3D] rounded-xl transition-colors text-xs`}
          >
            {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /> 收起侧栏</>}
          </button>

          {/* Back to frontend */}
          {!collapsed && (
            <Link
              to="/"
              className="flex items-center gap-2 px-3 py-2 text-[#64748B] hover:text-white hover:bg-[#1E2D3D] rounded-xl transition-colors text-xs mt-1"
            >
              <LogOut size={16} /> 返回前台
            </Link>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-[#E2E8F0] h-16 flex items-center justify-between px-6 sticky top-0 z-10">
          <div>
            <h2 className="text-[#1A2332] text-sm font-semibold">后台管理系统</h2>
            <p className="text-[#94A3B8] text-xs">
              {location.pathname === '/admin' ? '系统概览' :
               location.pathname.includes('users') ? '账户管理' :
               location.pathname.includes('experiments') ? '实验项目管理' :
               location.pathname.includes('courses') ? '课程管理' :
               location.pathname.includes('news') ? '新闻资讯管理' :
               location.pathname.includes('resources') ? '资源管理' : '管理控制台'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-[#64748B] hover:text-[#0B5394] hover:bg-[#F0F4F8] rounded-lg transition-colors">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#E53935] rounded-full" />
            </button>
            <div className="flex items-center gap-2 px-3 py-2 hover:bg-[#F0F4F8] rounded-xl cursor-pointer transition-colors">
              <div className="w-8 h-8 bg-gradient-to-br from-[#0B5394] to-[#1E88E5] rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">管</span>
              </div>
              <div className="hidden sm:block">
                <div className="text-[#1A2332] text-xs font-medium">管理员</div>
                <div className="text-[#94A3B8] text-xs">超级管理员</div>
              </div>
              <ChevronDown size={14} className="text-[#94A3B8]" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}