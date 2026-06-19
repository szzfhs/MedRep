import request from '../lib/request';

export interface AIGenerateParams {
  topic?: string;
  courseName?: string;
  sectionTitle?: string;
  totalSections?: number;
  questionType?: 'single' | 'multiple' | 'fill' | 'essay';
  questionCount?: number;
  difficulty?: 1 | 2 | 3;
  contentType?: 'md' | 'slide';
  extraPrompt?: string;
}

export interface QuizQuestion {
  stem: string;
  questionType: string;
  options?: Array<{ key: string; text: string }>;
  answer: string;
  explanation?: string;
  difficulty?: number;
}

// ——— SSE 流式读取通用工具 ———
async function* streamSSE(
  url: string,
  body: object,
  signal?: AbortSignal,
): AsyncIterable<string> {
  const token = localStorage.getItem('portal_token');
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
    signal,
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`AI接口请求失败: ${res.status}`);
  const reader = res.body?.getReader();
  if (!reader) return;
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const chunk = line.slice(6);
        if (chunk === '[DONE]') return;
        yield chunk;
      }
    }
  }
}

const AI_BASE = '/dev-api/ai/lesson-prep';

/**
 * AI 生成课程基本信息（SSE 流式）
 * 每次 yield 一段 JSON 字符串增量，最终拼接为完整 JSON
 */
export function aiGenerateCourseInfo(
  topic: string,
  signal?: AbortSignal,
): AsyncIterable<string> {
  return streamSSE(`${AI_BASE}/generate-course-info`, { topic }, signal);
}

/**
 * AI 生成课程大纲（SSE 流式）
 * 最终输出为大纲 JSON 字符串
 */
export function aiGenerateOutline(
  params: { courseName: string; totalSections?: number; courseCategory?: string },
  signal?: AbortSignal,
): AsyncIterable<string> {
  return streamSSE(`${AI_BASE}/generate-outline`, params, signal);
}

/**
 * AI 生成章节 MD 教学内容（SSE 流式）
 */
export function aiGenerateMdContent(
  params: { sectionTitle: string; courseName?: string; extraPrompt?: string },
  signal?: AbortSignal,
): AsyncIterable<string> {
  return streamSSE(`${AI_BASE}/generate-md-content`, params, signal);
}

/**
 * AI 批量生成试题（同步 JSON）
 */
export async function aiGenerateQuiz(
  params: {
    sectionTitle: string;
    questionType?: string;
    count?: number;
    difficulty?: number;
  },
): Promise<QuizQuestion[]> {
  const res = await request.post(`${AI_BASE}/generate-quiz`, params);
  return (res as any).data?.data ?? [];
}

/**
 * AI 生成课件 HTML（SSE 流式）
 */
export function aiGenerateSlideHtml(
  params: { sectionTitle: string; courseName?: string; mdContent?: string },
  signal?: AbortSignal,
): AsyncIterable<string> {
  return streamSSE(`${AI_BASE}/generate-slide-html`, params, signal);
}

/**
 * AI 生成实验操作指导文档（SSE 流式）
 */
export function aiGenerateExperimentMd(
  params: { sectionTitle: string; courseName?: string },
  signal?: AbortSignal,
): AsyncIterable<string> {
  return streamSSE(`${AI_BASE}/generate-experiment-md`, params, signal);
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * AI 通用多轮对话（SSE 流式）
 */
export function aiGeneralChat(
  messages: ChatMessage[],
  systemHint?: string,
  signal?: AbortSignal,
): AsyncIterable<string> {
  return streamSSE(`${AI_BASE}/general-chat`, { messages, systemHint: systemHint ?? '' }, signal);
}

/**
 * AI 大纲优化建议（SSE 流式）
 */
export function aiOptimizeOutline(
  outline: unknown[],
  courseName?: string,
  signal?: AbortSignal,
): AsyncIterable<string> {
  return streamSSE(`${AI_BASE}/optimize-outline`, { outline, courseName: courseName ?? '' }, signal);
}

// ===== 任务 9-8/9-9：AI 生成内容持久化为资源 =====

export interface SaveAiResourceParams {
  resourceName: string;
  content: string;
  contentType: 'md' | 'html' | 'quiz_json';
  resourceType: 'lesson_plan' | 'courseware' | 'extension';
  sectionId?: number;
}

export interface SaveAiResourceResult {
  resourceId: number;
  fileUrl: string;
}

/**
 * 将AI生成的内容保存为 vf_resource 记录，可选自动绑定到章节
 */
export async function saveAiResource(params: SaveAiResourceParams): Promise<SaveAiResourceResult> {
  const res = await request.post(`${AI_BASE}/save-resource`, params);
  return (res as any).data?.data as SaveAiResourceResult;
}

// ===== 任务 9-10/9-11：OpenMAIC 场景大纲生成管道 =====

export type SceneType = 'slide' | 'quiz' | 'interactive' | 'pbl';

export interface SceneOutline {
  id: string;
  type: SceneType;
  title: string;
  description: string;
  keyPoints: string[];
  teachingObjective?: string;
  order: number;
}

export interface SceneOutlineEvent {
  type: 'outline' | 'done' | 'error';
  data?: SceneOutline;
  index?: number;
  total?: number;
  message?: string;
}

/**
 * AI 流式生成场景大纲（SSE 流式，每条消息为 SceneOutlineEvent JSON）
 */
export function streamSceneOutlines(
  params: { sectionTitle: string; courseName?: string; sceneCount?: number },
  signal?: AbortSignal,
): AsyncIterable<string> {
  return streamSSE(`${AI_BASE}/generate-scene-outlines`, params, signal);
}

/**
 * AI 生成场景内容（同步 JSON）
 */
export async function generateSceneContent(params: {
  outline: SceneOutline;
  allOutlines: SceneOutline[];
  sectionTitle?: string;
}): Promise<Record<string, unknown>> {
  const res = await request.post(`${AI_BASE}/generate-scene-content`, params);
  return (res as any).data?.data ?? {};
}
