import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Settings, Bell, Shield, Database, Globe,
  Save, CheckCircle, Eye, EyeOff, RefreshCw,
  Server, Mail, Smartphone, Moon, Sun
} from 'lucide-react';
import { getSchoolSettings, updateSchoolSettings } from '@/api/school-admin';

const TABS = [
  { key: 'general', label: '基础设置', icon: Settings },
  { key: 'security', label: '安全设置', icon: Shield },
  { key: 'notification', label: '通知设置', icon: Bell },
  { key: 'storage', label: '存储配置', icon: Database },
  { key: 'about', label: '系统信息', icon: Server },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-[#0B5394]' : 'bg-[#CBD5E1]'}`}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );
}

function SaveBadge() {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }} className="flex items-center gap-1.5 text-[#2E7D32] text-sm bg-[#E8F5E9] px-3 py-1.5 rounded-lg">
      <CheckCircle size={13} /> 已保存
    </motion.div>
  );
}

export function SettingsPage() {
  const [tab, setTab] = useState('general');
  const [saved, setSaved] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const [general, setGeneral] = useState({
    siteName: 'SimHub 虚拟仿真实验平台',
    siteSubtitle: '医学院虚拟仿真实验教学中心',
    siteUrl: 'https://simhub.example.edu.cn',
    contactEmail: 'simlab@example.edu.cn',
    contactPhone: '0755-12345678',
    icp: '粤ICP备XXXXXXXX号',
    maintenanceMode: false,
    allowRegister: true,
    requireApproval: true,
  });

  const [security, setSecurity] = useState({
    sessionTimeout: '120',
    maxLoginAttempts: '5',
    enableCaptcha: true,
    enableTwoFactor: false,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notification, setNotification] = useState({
    emailNewUser: true,
    emailNewExperiment: true,
    emailSystemAlert: true,
    smsAlert: false,
    browserNotify: true,
    digestFreq: 'daily',
  });

  const [storage, setStorage] = useState({
    uploadLimit: '2048',
    allowedTypes: 'PDF,PPT,DOCX,MP4,AVI,ZIP',
    storagePath: '/data/simhub/uploads',
    backupEnabled: true,
    backupFreq: 'weekly',
  });

  const handleSave = async () => {
    try {
      await updateSchoolSettings({
        siteName: general.siteName,
        siteSubtitle: general.siteSubtitle,
        siteUrl: general.siteUrl,
        contactEmail: general.contactEmail,
        contactPhone: general.contactPhone,
        icp: general.icp,
        allowRegister: general.allowRegister,
        requireApproval: general.requireApproval,
        sessionTimeout: Number(security.sessionTimeout),
        maxLoginAttempts: Number(security.maxLoginAttempts),
        enableCaptcha: security.enableCaptcha,
        uploadLimit: Number(storage.uploadLimit),
        allowedTypes: storage.allowedTypes,
        emailNewUser: notification.emailNewUser,
        emailNewExperiment: notification.emailNewExperiment,
        emailSystemAlert: notification.emailSystemAlert,
        smsAlert: notification.smsAlert,
        browserNotify: notification.browserNotify,
      });
    } catch {/* ignore */}
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  useEffect(() => {
    getSchoolSettings().then(s => {
      setGeneral(prev => ({
        ...prev,
        siteName: s.siteName ?? prev.siteName,
        siteSubtitle: s.siteSubtitle ?? prev.siteSubtitle,
        siteUrl: s.siteUrl ?? prev.siteUrl,
        contactEmail: s.contactEmail ?? prev.contactEmail,
        contactPhone: s.contactPhone ?? prev.contactPhone,
        icp: s.icp ?? prev.icp,
        allowRegister: s.allowRegister ?? prev.allowRegister,
        requireApproval: s.requireApproval ?? prev.requireApproval,
      }));
      setSecurity(prev => ({
        ...prev,
        sessionTimeout: String(s.sessionTimeout ?? prev.sessionTimeout),
        maxLoginAttempts: String(s.maxLoginAttempts ?? prev.maxLoginAttempts),
        enableCaptcha: s.enableCaptcha ?? prev.enableCaptcha,
      }));
      setNotification(prev => ({
        ...prev,
        emailNewUser: s.emailNewUser ?? prev.emailNewUser,
        emailNewExperiment: s.emailNewExperiment ?? prev.emailNewExperiment,
        emailSystemAlert: s.emailSystemAlert ?? prev.emailSystemAlert,
        smsAlert: s.smsAlert ?? prev.smsAlert,
        browserNotify: s.browserNotify ?? prev.browserNotify,
      }));
      setStorage(prev => ({
        ...prev,
        uploadLimit: String(s.uploadLimit ?? prev.uploadLimit),
        allowedTypes: s.allowedTypes ?? prev.allowedTypes,
      }));
    }).catch(() => {/* ignore */});
  }, []);

  const inputCls = "w-full px-3 py-2.5 border border-[#E2E8F0] rounded-xl text-sm text-[#1A2332] focus:outline-none focus:border-[#0B5394] bg-white";
  const selectCls = "w-full px-3 py-2.5 border border-[#E2E8F0] rounded-xl text-sm text-[#1A2332] focus:outline-none focus:border-[#0B5394] bg-white";

  const Field = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => (
    <div className="flex items-start justify-between gap-4 py-4 border-b border-[#F0F4F8] last:border-0">
      <div className="flex-shrink-0 w-48">
        <div className="text-[#1A2332] text-sm font-medium">{label}</div>
        {hint && <div className="text-[#94A3B8] text-xs mt-0.5 leading-relaxed">{hint}</div>}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[#1A2332] font-bold" style={{ fontSize: '1.1rem' }}>系统设置</h1>
          <p className="text-[#64748B] text-sm mt-0.5">配置平台基础参数与系统选项</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && <SaveBadge />}
          <button onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#0B5394] text-white rounded-xl text-sm font-medium hover:bg-[#1565C0] transition-colors">
            <Save size={15} /> 保存设置
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-44 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-2 space-y-0.5">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-colors ${tab === t.key ? 'bg-[#0B5394] text-white' : 'text-[#64748B] hover:bg-[#F0F4F8] hover:text-[#1A2332]'}`}>
                <t.icon size={15} className="flex-shrink-0" />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl border border-[#E2E8F0]">

            {/* General */}
            {tab === 'general' && (
              <div className="p-6">
                <h2 className="text-[#1A2332] font-semibold mb-1">基础设置</h2>
                <p className="text-[#94A3B8] text-sm mb-6">配置平台名称、联系方式和基本运行参数</p>
                <Field label="平台名称" hint="显示在浏览器标签和顶部导航">
                  <input className={inputCls} value={general.siteName} onChange={e => setGeneral(g => ({ ...g, siteName: e.target.value }))} />
                </Field>
                <Field label="副标题" hint="显示在首页 Hero 区域">
                  <input className={inputCls} value={general.siteSubtitle} onChange={e => setGeneral(g => ({ ...g, siteSubtitle: e.target.value }))} />
                </Field>
                <Field label="平台网址" hint="用于生成对外链接">
                  <input className={inputCls} value={general.siteUrl} onChange={e => setGeneral(g => ({ ...g, siteUrl: e.target.value }))} />
                </Field>
                <Field label="联系邮箱" hint="系统通知和用户联系方式">
                  <input type="email" className={inputCls} value={general.contactEmail} onChange={e => setGeneral(g => ({ ...g, contactEmail: e.target.value }))} />
                </Field>
                <Field label="联系电话" hint="显示在页脚联系方式">
                  <input className={inputCls} value={general.contactPhone} onChange={e => setGeneral(g => ({ ...g, contactPhone: e.target.value }))} />
                </Field>
                <Field label="ICP备案号" hint="显示在页脚">
                  <input className={inputCls} value={general.icp} onChange={e => setGeneral(g => ({ ...g, icp: e.target.value }))} />
                </Field>
                <Field label="允许用户注册" hint="关闭后新用户无法自行注册">
                  <Toggle checked={general.allowRegister} onChange={v => setGeneral(g => ({ ...g, allowRegister: v }))} />
                </Field>
                <Field label="注册需要审核" hint="开启后新注册用户需管理员审核">
                  <Toggle checked={general.requireApproval} onChange={v => setGeneral(g => ({ ...g, requireApproval: v }))} />
                </Field>
                <Field label="维护模式" hint="开启后前台不可访问，仅管理员可登录">
                  <div className="flex items-center gap-3">
                    <Toggle checked={general.maintenanceMode} onChange={v => setGeneral(g => ({ ...g, maintenanceMode: v }))} />
                    {general.maintenanceMode && (
                      <span className="text-xs text-[#F57F17] bg-[#FFF8E1] px-2 py-0.5 rounded-lg font-medium">⚠ 前台已停服</span>
                    )}
                  </div>
                </Field>
              </div>
            )}

            {/* Security */}
            {tab === 'security' && (
              <div className="p-6">
                <h2 className="text-[#1A2332] font-semibold mb-1">安全设置</h2>
                <p className="text-[#94A3B8] text-sm mb-6">配置登录安全和访问控制参数</p>
                <Field label="会话超时（分钟）" hint="用户无操作后自动退出的时间">
                  <input type="number" className={inputCls} value={security.sessionTimeout}
                    onChange={e => setSecurity(s => ({ ...s, sessionTimeout: e.target.value }))} min="10" max="720" />
                </Field>
                <Field label="最大登录失败次数" hint="超过后账号临时锁定">
                  <input type="number" className={inputCls} value={security.maxLoginAttempts}
                    onChange={e => setSecurity(s => ({ ...s, maxLoginAttempts: e.target.value }))} min="3" max="10" />
                </Field>
                <Field label="启用图形验证码" hint="登录时要求填写验证码">
                  <Toggle checked={security.enableCaptcha} onChange={v => setSecurity(s => ({ ...s, enableCaptcha: v }))} />
                </Field>
                <Field label="启用双重认证" hint="管理员账号登录时发送短信验证码（可选）">
                  <Toggle checked={security.enableTwoFactor} onChange={v => setSecurity(s => ({ ...s, enableTwoFactor: v }))} />
                </Field>
                <div className="mt-6 pt-6 border-t border-[#E2E8F0]">
                  <h3 className="text-[#1A2332] font-medium mb-4">修改管理员密码</h3>
                  <div className="space-y-3 max-w-sm">
                    <div className="relative">
                      <input type={showPwd ? 'text' : 'password'} placeholder="当前密码" className={inputCls}
                        value={security.currentPassword} onChange={e => setSecurity(s => ({ ...s, currentPassword: e.target.value }))} />
                    </div>
                    <input type={showPwd ? 'text' : 'password'} placeholder="新密码（至少8位，含字母和数字）" className={inputCls}
                      value={security.newPassword} onChange={e => setSecurity(s => ({ ...s, newPassword: e.target.value }))} />
                    <input type={showPwd ? 'text' : 'password'} placeholder="确认新密码" className={inputCls}
                      value={security.confirmPassword} onChange={e => setSecurity(s => ({ ...s, confirmPassword: e.target.value }))} />
                    <button onClick={() => setShowPwd(p => !p)} className="flex items-center gap-1.5 text-[#64748B] text-xs hover:text-[#0B5394]">
                      {showPwd ? <EyeOff size={13} /> : <Eye size={13} />}
                      {showPwd ? '隐藏密码' : '显示密码'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notification */}
            {tab === 'notification' && (
              <div className="p-6">
                <h2 className="text-[#1A2332] font-semibold mb-1">通知设置</h2>
                <p className="text-[#94A3B8] text-sm mb-6">配置系统事件的通知渠道和频率</p>
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-[#F0F4F8]">
                  <Mail size={16} className="text-[#0B5394]" />
                  <span className="text-[#1A2332] font-medium text-sm">邮件通知</span>
                </div>
                <Field label="新用户注册" hint="有新用户注册时发送邮件提醒">
                  <Toggle checked={notification.emailNewUser} onChange={v => setNotification(n => ({ ...n, emailNewUser: v }))} />
                </Field>
                <Field label="新实验项目" hint="有新实验项目待审核时通知">
                  <Toggle checked={notification.emailNewExperiment} onChange={v => setNotification(n => ({ ...n, emailNewExperiment: v }))} />
                </Field>
                <Field label="系统告警" hint="存储空间、性能异常等告警">
                  <Toggle checked={notification.emailSystemAlert} onChange={v => setNotification(n => ({ ...n, emailSystemAlert: v }))} />
                </Field>
                <Field label="摘要发送频率" hint="定期汇总通知邮件">
                  <select className={selectCls} value={notification.digestFreq} onChange={e => setNotification(n => ({ ...n, digestFreq: e.target.value }))}>
                    <option value="realtime">实时发送</option>
                    <option value="daily">每日汇总</option>
                    <option value="weekly">每周汇总</option>
                    <option value="never">不发送摘要</option>
                  </select>
                </Field>
                <div className="flex items-center gap-2 mt-6 mb-4 pb-4 border-b border-[#F0F4F8]">
                  <Smartphone size={16} className="text-[#0B5394]" />
                  <span className="text-[#1A2332] font-medium text-sm">其他渠道</span>
                </div>
                <Field label="短信告警" hint="系统严重告警时发送短信（需配置短信服务）">
                  <Toggle checked={notification.smsAlert} onChange={v => setNotification(n => ({ ...n, smsAlert: v }))} />
                </Field>
                <Field label="浏览器推送" hint="管理员在线时的实时推送通知">
                  <Toggle checked={notification.browserNotify} onChange={v => setNotification(n => ({ ...n, browserNotify: v }))} />
                </Field>
              </div>
            )}

            {/* Storage */}
            {tab === 'storage' && (
              <div className="p-6">
                <h2 className="text-[#1A2332] font-semibold mb-1">存储配置</h2>
                <p className="text-[#94A3B8] text-sm mb-6">配置文件上传限制和备份策略</p>
                <Field label="单文件上传限制（MB）" hint="超过此大小的文件将被拒绝">
                  <input type="number" className={inputCls} value={storage.uploadLimit}
                    onChange={e => setStorage(s => ({ ...s, uploadLimit: e.target.value }))} min="1" />
                </Field>
                <Field label="允许文件类型" hint="用英文逗号分隔，如：PDF,MP4,ZIP">
                  <input className={inputCls} value={storage.allowedTypes} onChange={e => setStorage(s => ({ ...s, allowedTypes: e.target.value }))} />
                </Field>
                <Field label="上传存储路径" hint="服务器本地路径或对象存储Bucket">
                  <input className={inputCls} value={storage.storagePath} onChange={e => setStorage(s => ({ ...s, storagePath: e.target.value }))} />
                </Field>
                <Field label="自动备份" hint="定期备份数据库和上传文件">
                  <Toggle checked={storage.backupEnabled} onChange={v => setStorage(s => ({ ...s, backupEnabled: v }))} />
                </Field>
                <Field label="备份频率">
                  <select className={selectCls} value={storage.backupFreq} onChange={e => setStorage(s => ({ ...s, backupFreq: e.target.value }))}>
                    <option value="daily">每日</option>
                    <option value="weekly">每周</option>
                    <option value="monthly">每月</option>
                  </select>
                </Field>
                <div className="mt-6 pt-6 border-t border-[#E2E8F0]">
                  <h3 className="text-[#1A2332] font-medium text-sm mb-4">存储使用情况</h3>
                  <div className="space-y-3">
                    {[
                      { label: '教学视频', used: 18.4, total: 50, color: '#6A1B9A' },
                      { label: '文档资源', used: 3.2, total: 20, color: '#0B5394' },
                      { label: '实验程序包', used: 7.8, total: 30, color: '#00897B' },
                    ].map(s => (
                      <div key={s.label}>
                        <div className="flex justify-between text-xs text-[#64748B] mb-1">
                          <span>{s.label}</span>
                          <span>{s.used}GB / {s.total}GB</span>
                        </div>
                        <div className="h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${(s.used / s.total) * 100}%`, backgroundColor: s.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* About */}
            {tab === 'about' && (
              <div className="p-6">
                <h2 className="text-[#1A2332] font-semibold mb-1">系统信息</h2>
                <p className="text-[#94A3B8] text-sm mb-6">当前部署环境和版本信息</p>
                <div className="space-y-0 divide-y divide-[#F0F4F8]">
                  {[
                    { label: '平台版本', value: 'SimHub v2.5.0' },
                    { label: '前端框架', value: 'React 18 + TypeScript + Tailwind CSS v4' },
                    { label: '后端框架', value: 'Python / Flask（需配置）' },
                    { label: '数据库', value: 'PostgreSQL 15（需配置）' },
                    { label: '部署环境', value: 'Node.js 20 LTS / Linux Ubuntu 22.04' },
                    { label: '最后更新', value: '2025-05-01' },
                    { label: '运行时长', value: '正常运行（模拟）' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-3">
                      <span className="text-[#64748B] text-sm">{item.label}</span>
                      <span className="text-[#1A2332] text-sm font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-[#E3F2FD] rounded-xl">
                  <p className="text-[#0B5394] text-sm font-medium mb-1 flex items-center gap-2"><Server size={14} /> 系统状态</p>
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    {[
                      { label: 'CPU 使用率', value: '23%', ok: true },
                      { label: '内存使用率', value: '41%', ok: true },
                      { label: '存储使用率', value: '75%', ok: false },
                    ].map(s => (
                      <div key={s.label} className="bg-white rounded-xl p-3 text-center">
                        <div className={`text-lg font-bold ${s.ok ? 'text-[#2E7D32]' : 'text-[#F57F17]'}`}>{s.value}</div>
                        <div className="text-[#94A3B8] text-xs">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
