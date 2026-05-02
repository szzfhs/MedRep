import { Link } from 'react-router';
import { FlaskConical, Phone, Mail, MapPin, ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#0B1929] text-white mt-auto">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#1E88E5] to-[#00897B] rounded-lg flex items-center justify-center">
                <FlaskConical size={22} className="text-white" />
              </div>
              <div>
                <div className="text-white font-semibold text-lg leading-tight">SimHub</div>
                <div className="text-[#94A3B8] text-xs">虚拟仿真实验平台</div>
              </div>
            </div>
            <p className="text-[#94A3B8] text-sm leading-relaxed mb-4">
              构建高质量医学虚拟仿真实验教学体系，以数字技术赋能医学教育，让每位学生都能获得优质实验教学资源。
            </p>
            <div className="flex gap-3">
              {['微信', '微博', 'B站'].map((item) => (
                <button key={item} className="px-3 py-1 text-xs text-[#94A3B8] border border-[#2D3F55] rounded-md hover:border-[#1E88E5] hover:text-[#1E88E5] transition-colors">
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-sm font-medium mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-[#1E88E5] rounded-full inline-block" />
              快速导航
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: '平台首页', path: '/' },
                { label: '实验中心介绍', path: '/lab-intro' },
                { label: '新闻资讯', path: '/news' },
                { label: '虚拟仿真实验', path: '/experiments' },
                { label: '实验课程', path: '/courses' },
                { label: '资源中心', path: '/resources' },
              ].map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className="text-[#94A3B8] text-sm hover:text-[#1E88E5] transition-colors flex items-center gap-1.5"
                  >
                    <span className="w-1 h-1 bg-[#2D3F55] rounded-full" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white text-sm font-medium mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-[#00897B] rounded-full inline-block" />
              帮助支持
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: '使用手册下载', path: '#' },
                { label: '常见问题解答', path: '#' },
                { label: '客户端下载中心', path: '#' },
                { label: '系统使用协议', path: '#' },
                { label: '隐私政策', path: '#' },
                { label: '技术支持工单', path: '#' },
              ].map((item) => (
                <li key={item.label}>
                  <a
                    href={item.path}
                    className="text-[#94A3B8] text-sm hover:text-[#00897B] transition-colors flex items-center gap-1.5"
                  >
                    <span className="w-1 h-1 bg-[#2D3F55] rounded-full" />
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white text-sm font-medium mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-[#F4A400] rounded-full inline-block" />
              联系我们
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin size={15} className="text-[#64748B] mt-0.5 flex-shrink-0" />
                <span className="text-[#94A3B8] text-sm">
                  某市某区大学路XX号 医学院楼A栋3层
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={15} className="text-[#64748B] flex-shrink-0" />
                <span className="text-[#94A3B8] text-sm">021-XXXX-XXXX</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={15} className="text-[#64748B] flex-shrink-0" />
                <span className="text-[#94A3B8] text-sm">simhub@medical.edu.cn</span>
              </li>
            </ul>

            {/* Friendly links */}
            <div className="mt-5 pt-4 border-t border-[#1E2D3D]">
              <p className="text-[#64748B] text-xs mb-2">友情链接</p>
              <div className="flex flex-wrap gap-2">
                {['教育部', '国家虚仿中心', '人卫出版社'].map((item) => (
                  <a
                    key={item}
                    href="#"
                    className="flex items-center gap-1 text-xs text-[#64748B] hover:text-[#1E88E5] transition-colors"
                  >
                    {item}
                    <ExternalLink size={10} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#1E2D3D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[#475569] text-xs">
            © 2025 SimHub 虚拟仿真实验平台 · 某医科大学实验教学中心
          </p>
          <div className="flex items-center gap-4">
            <span className="text-[#475569] text-xs">
              沪ICP备XXXXXXXX号-X
            </span>
            <span className="text-[#475569] text-xs flex items-center gap-1">
              <span className="w-2 h-2 bg-[#2E7D32] rounded-full animate-pulse" />
              系统运行正常
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
