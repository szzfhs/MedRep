import request from '../lib/request';

export interface AchievementItem {
  label: string;
  yearDesc: string;
  iconName: string;
  color: string;
}

export interface OrgMember {
  id: number;
  name: string;
  titleText: string | null;
  dept: string | null;
  color: string | null;
  sortOrder: number | null;
}

export interface TeamMember {
  id: number;
  name: string;
  titleRole: string | null;
  specialty: string | null;
  bio: string | null;
  imageUrl: string | null;
  sortOrder: number | null;
  status: string | null;
}

export interface CenterInfo {
  id: number | null;
  centerName: string | null;
  centerSlogan: string | null;
  heroBadge: string | null;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  statFoundedYear: string | null;
  statExperiments: string | null;
  statStudents: string | null;
  statCourses: string | null;
  achievementsJson: string | null;
  functionsJson: string | null;
  contactAddress: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  updateTime: string | null;
}

export interface FullCenterData {
  info: CenterInfo;
  orgMembers: OrgMember[];
  teamMembers: TeamMember[];
}

export function getFullCenterInfo(): Promise<FullCenterData> {
  return request.get('/simhub/portal/center').then((res: any) => {
    const data: FullCenterData = res.data?.data ?? { info: {}, orgMembers: [], teamMembers: [] };
    return data;
  });
}

/** 解析 achievementsJson 字符串为数组 */
export function parseAchievements(json: string | null): AchievementItem[] {
  if (!json) return [];
  try {
    return JSON.parse(json) as AchievementItem[];
  } catch {
    return [];
  }
}

/** 解析 functionsJson 字符串为数组 */
export function parseFunctions(json: string | null): string[] {
  if (!json) return [];
  try {
    return JSON.parse(json) as string[];
  } catch {
    return [];
  }
}
