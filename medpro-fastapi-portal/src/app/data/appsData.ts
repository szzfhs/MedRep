// Mock data based on vf_sim_system + vf_sim_system_image tables

export type HwSupport = 'helmet' | 'pc' | 'zspace' | 'webgl';

export interface SimSystemImage {
  image_id: number;
  sim_system_id: number;
  image_url: string;
  sort_order: number;
}

export interface SimSystem {
  sim_system_id: number;
  system_name: string;
  system_detail: string;
  cover_image: string;
  hw_recommend: string;
  hw_support: HwSupport[];
  sys_category: string;
  view_count: number;
  status: '0' | '1'; // 0=正常 1=停用
  create_by: string;
  create_time: string;
  images: SimSystemImage[];
  exp_count: number; // 关联实验数
  launch_url: string;
}

export const SYS_CATEGORIES = ['全部', '解剖学', '外科学', '细胞生物学', '药理学', '神经科学', '心脏病学', '病理学', '生理学'];

export const HW_LABELS: Record<HwSupport, { label: string; color: string; bg: string }> = {
  helmet: { label: 'VR头盔', color: 'text-[#6D28D9]', bg: 'bg-[#EDE9FE]' },
  pc:     { label: 'PC端',   color: 'text-[#0B5394]', bg: 'bg-[#DBEAFE]' },
  zspace: { label: 'zSpace', color: 'text-[#065F46]', bg: 'bg-[#D1FAE5]' },
  webgl:  { label: 'WebGL',  color: 'text-[#92400E]', bg: 'bg-[#FEF3C7]' },
};

export const mockApps: SimSystem[] = [
  {
    sim_system_id: 1,
    system_name: '人体解剖虚拟仿真系统',
    system_detail: `<p>本系统采用高精度三维重建技术，将人体各器官系统以沉浸式方式呈现。学生可在VR环境中自由探索人体内部结构，进行虚拟解剖操作，真实还原传统解剖学课程中的操作过程。</p><p>系统涵盖运动系统、消化系统、呼吸系统、循环系统、泌尿系统、神经系统、内分泌系统等全部人体系统，共包含超过1200个独立解剖结构，支持任意角度旋转、缩放与剖切操作。</p><p>内置AI语音助手，可实时解答解剖学相关问题，并提供标准化考核模块，支持教师自定义测评内容。</p>`,
    cover_image: '/placeholder.svg',
    hw_recommend: '推荐配置：Intel Core i7-10700K / NVIDIA RTX 3070 / 32GB RAM / VR头盔（Meta Quest 2或以上）',
    hw_support: ['helmet', 'pc', 'webgl'],
    sys_category: '解剖学',
    view_count: 4328,
    status: '0',
    create_by: 'admin',
    create_time: '2025-03-10 09:00:00',
    exp_count: 12,
    launch_url: 'https://demo.simhub.edu.cn/anatomy',
    images: [
      { image_id: 1, sim_system_id: 1, image_url: '/placeholder.svg', sort_order: 0 },
      { image_id: 2, sim_system_id: 1, image_url: '/placeholder.svg', sort_order: 1 },
      { image_id: 3, sim_system_id: 1, image_url: '/placeholder.svg', sort_order: 2 },
    ],
  },
  {
    sim_system_id: 2,
    system_name: '腹腔镜手术模拟训练系统',
    system_detail: `<p>专为外科住院医师培训设计的高保真腹腔镜手术模拟平台。系统配备力反馈手柄，完整模拟腹腔镜手术器械的操作手感，提供真实的组织形变与切割反馈。</p><p>包含胆囊切除术、阑尾切除术、疝修补术、结直肠切除术等12种标准术式的完整模拟流程，每种术式均提供初级、中级、高级三个难度等级。</p><p>系统自动记录操作时间、器械路径、组织损伤率等关键指标，生成详细的技能评估报告，助力住院医师快速提升手术技能。</p>`,
    cover_image: '/placeholder.svg',
    hw_recommend: '推荐配置：Intel Core i9 / NVIDIA RTX 4080 / 64GB RAM / 力反馈手柄套件 / VR头盔',
    hw_support: ['helmet', 'zspace'],
    sys_category: '外科学',
    view_count: 3156,
    status: '0',
    create_by: 'admin',
    create_time: '2025-03-15 10:30:00',
    exp_count: 8,
    launch_url: 'https://demo.simhub.edu.cn/laparoscopy',
    images: [
      { image_id: 4, sim_system_id: 2, image_url: '/placeholder.svg', sort_order: 0 },
      { image_id: 5, sim_system_id: 2, image_url: '/placeholder.svg', sort_order: 1 },
    ],
  },
  {
    sim_system_id: 3,
    system_name: '细胞生物学虚拟实验室',
    system_detail: `<p>基于WebGL技术构建的细胞生物学实验平台，无需安装任何客户端，直接通过浏览器即可访问。系统模拟了包括细胞培养、细胞染色、流式细胞术、电子显微镜观察等核心实验操作。</p><p>内置超过500张高分辨率电子显微镜图像，支持学生在虚拟显微镜下进行亚细胞结构识别训练。每个实验模块均配有实验前预习材料、实验操作指导和实验后评估习题。</p>`,
    cover_image: '/placeholder.svg',
    hw_recommend: '最低配置：Chrome/Firefox 最新版本，4GB RAM，1920×1080分辨率',
    hw_support: ['webgl', 'pc'],
    sys_category: '细胞生物学',
    view_count: 5892,
    status: '0',
    create_by: 'teacher001',
    create_time: '2025-02-20 14:00:00',
    exp_count: 15,
    launch_url: 'https://demo.simhub.edu.cn/cell-bio',
    images: [
      { image_id: 6, sim_system_id: 3, image_url: '/placeholder.svg', sort_order: 0 },
      { image_id: 7, sim_system_id: 3, image_url: '/placeholder.svg', sort_order: 1 },
    ],
  },
  {
    sim_system_id: 4,
    system_name: '药理学实验仿真平台',
    system_detail: `<p>模拟真实药理学实验室环境，支持药物剂量效应关系研究、药物代谢动力学实验、药物受体结合实验等多类核心实验。学生可在虚拟环境中安全地进行药物实验，无需担心实验动物伦理与实际安全风险。</p><p>平台内置了主要药物分类（心血管药、抗感染药、中枢神经药等）的完整药效动力学模型，可实时模拟不同给药方案下的血药浓度-时间曲线，培养学生的临床用药思维。</p>`,
    cover_image: '/placeholder.svg',
    hw_recommend: '推荐配置：Intel Core i5 / 8GB RAM / 独立显卡 / 1920×1080分辨率',
    hw_support: ['pc', 'webgl'],
    sys_category: '药理学',
    view_count: 2741,
    status: '0',
    create_by: 'teacher002',
    create_time: '2025-04-01 09:00:00',
    exp_count: 10,
    launch_url: 'https://demo.simhub.edu.cn/pharmacology',
    images: [
      { image_id: 8, sim_system_id: 4, image_url: '/placeholder.svg', sort_order: 0 },
    ],
  },
  {
    sim_system_id: 5,
    system_name: '神经系统疾病诊断训练系统',
    system_detail: `<p>利用zSpace裸眼3D技术，学生可在无需佩戴VR眼镜的情况下，直接与三维神经系统模型进行自然交互。系统包含大脑、脊髓、周围神经系统的高精度三维模型，支持多种神经系统疾病的诊断推理训练。</p><p>内置30个典型神经系统疾病病例，涵盖脑卒中、帕金森病、癫痫、脊髓损伤等常见病种，每个病例均提供完整的病史、体格检查、影像学资料，引导学生建立系统性的神经系统疾病诊断思维。</p>`,
    cover_image: '/placeholder.svg',
    hw_recommend: '必需设备：zSpace AIO Pro工作站，推荐搭配触控笔套件',
    hw_support: ['zspace', 'helmet'],
    sys_category: '神经科学',
    view_count: 1983,
    status: '0',
    create_by: 'admin',
    create_time: '2025-03-28 16:00:00',
    exp_count: 7,
    launch_url: 'https://demo.simhub.edu.cn/neurology',
    images: [
      { image_id: 9, sim_system_id: 5, image_url: '/placeholder.svg', sort_order: 0 },
      { image_id: 10, sim_system_id: 5, image_url: '/placeholder.svg', sort_order: 1 },
    ],
  },
  {
    sim_system_id: 6,
    system_name: '心脏病学三维可视化系统',
    system_detail: `<p>基于真实患者CT/MRI数据重建的心脏三维可视化平台，集成了心脏超声模拟、心电图分析、心导管介入手术模拟等功能模块。</p><p>系统收录50余例典型先天性心脏病、瓣膜病、冠心病的影像学资料，支持多平面重建与三维旋转展示，帮助学生理解复杂先心病的解剖结构，为未来的临床实践打下坚实基础。</p>`,
    cover_image: '/placeholder.svg',
    hw_recommend: '推荐配置：NVIDIA Quadro显卡 / 32GB RAM / 4K显示器 / 可选zSpace设备',
    hw_support: ['pc', 'zspace'],
    sys_category: '心脏病学',
    view_count: 2210,
    status: '0',
    create_by: 'teacher003',
    create_time: '2025-04-10 11:00:00',
    exp_count: 6,
    launch_url: 'https://demo.simhub.edu.cn/cardiology',
    images: [
      { image_id: 11, sim_system_id: 6, image_url: '/placeholder.svg', sort_order: 0 },
    ],
  },
  {
    sim_system_id: 7,
    system_name: '病理学切片虚拟分析平台',
    system_detail: `<p>数字化病理学教学平台，整合了超过2000张高质量数字病理切片，学生可通过浏览器直接进行虚拟镜检操作。支持40倍、100倍、400倍等多级放大，图像清晰度媲美实体显微镜。</p><p>AI辅助标注系统可帮助学生快速识别正常组织与病变组织的区别，系统支持教师圈注重要诊断特征并添加文字说明，适合自主学习与课堂教学双重场景。</p>`,
    cover_image: '/placeholder.svg',
    hw_recommend: '最低配置：任意现代浏览器，网络带宽 ≥10Mbps，推荐使用大屏显示器',
    hw_support: ['webgl', 'pc'],
    sys_category: '病理学',
    view_count: 3677,
    status: '0',
    create_by: 'teacher004',
    create_time: '2025-01-15 08:30:00',
    exp_count: 18,
    launch_url: 'https://demo.simhub.edu.cn/pathology',
    images: [
      { image_id: 12, sim_system_id: 7, image_url: '/placeholder.svg', sort_order: 0 },
      { image_id: 13, sim_system_id: 7, image_url: '/placeholder.svg', sort_order: 1 },
    ],
  },
  {
    sim_system_id: 8,
    system_name: '生理学综合实验仿真系统',
    system_detail: `<p>覆盖生理学核心实验内容的综合仿真平台，包括离体蛙心实验、神经肌肉接头实验、血液循环调节实验等经典动物实验的完整虚拟仿真。所有实验均以精确的生理学模型为基础，确保实验现象与真实情况高度吻合。</p><p>系统支持多种实验参数的实时调节与观察，学生可通过改变实验条件来探究生理学规律，培养科学实验思维和数据分析能力。</p>`,
    cover_image: '/placeholder.svg',
    hw_recommend: '推荐配置：Intel Core i5 / 16GB RAM / 独立显卡 / 支持VR头盔（可选）',
    hw_support: ['webgl', 'pc', 'helmet'],
    sys_category: '生理学',
    view_count: 1594,
    status: '1', // 停用示例
    create_by: 'admin',
    create_time: '2025-02-05 13:00:00',
    exp_count: 9,
    launch_url: 'https://demo.simhub.edu.cn/physiology',
    images: [
      { image_id: 14, sim_system_id: 8, image_url: '/placeholder.svg', sort_order: 0 },
    ],
  },
];
