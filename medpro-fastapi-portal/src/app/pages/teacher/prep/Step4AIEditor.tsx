import { useState, useRef, useEffect, useCallback, type ElementType, type ReactNode } from 'react';
import {
  Sparkles, Save, Copy, ChevronDown, ChevronRight,
  FileText, FlaskConical, Monitor, ClipboardList,
  MessageSquare, Wand2, Send, Loader2, RefreshCw, CheckCircle2, LayoutList,
} from 'lucide-react';
import { saveLessonPrepStep, type LessonPrep, type OutlineNode } from '../../../../api/lesson-prep';
import {
  aiGenerateMdContent,
  aiGenerateQuiz,
  aiGenerateSlideHtml,
  aiGenerateExperimentMd,
  aiGeneralChat,
  aiOptimizeOutline,
  saveAiResource,
  streamSceneOutlines,
  type ChatMessage,
  type SceneOutline,
  type SceneOutlineEvent,
} from '../../../../api/ai-generate';
import { OutlinesEditor } from '../../../components/lesson/OutlinesEditor';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type AITab = 'md' | 'exp' | 'slide' | 'quiz' | 'chat' | 'outline' | 'scenes';

interface Props {
  prep: LessonPrep;
  onDone: (updated?: LessonPrep) => void;
}

interface SectionContent {
  sectionId: string;
  mdContent?: string;
  quizJson?: string;
  slideHtml?: string;
  experimentMd?: string;
}

interface TabDef {
  id: AITab;
  label: string;
  Icon: ElementType;
  color: string;
  badge: (c: SectionContent | null | undefined) => boolean;
  badgeBg: string;
  badgeText: string;
  sectionBased: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Simple Markdown → HTML (no external lib)
// ─────────────────────────────────────────────────────────────────────────────

function applyInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(
      /`(.+?)`/g,
      '<code style="background:#F1F5F9;padding:0.1em 0.35em;border-radius:3px;font-family:monospace;font-size:0.85em">$1</code>',
    );
}

function renderSimpleMd(text: string): string {
  if (!text) return '';
  const esc = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return esc
    .split('\n')
    .map(line => {
      if (line.startsWith('### '))
        return `<h3 style="font-size:0.95rem;font-weight:700;margin:0.6rem 0 0.2rem;color:#1E293B">${applyInline(line.slice(4))}</h3>`;
      if (line.startsWith('## '))
        return `<h2 style="font-size:1.05rem;font-weight:700;margin:0.8rem 0 0.3rem;color:#0F172A;border-bottom:1px solid #E2E8F0;padding-bottom:0.2rem">${applyInline(line.slice(3))}</h2>`;
      if (line.startsWith('# '))
        return `<h1 style="font-size:1.2rem;font-weight:800;margin:1rem 0 0.4rem;color:#0F172A">${applyInline(line.slice(2))}</h1>`;
      if (line.startsWith('- ') || line.startsWith('* '))
        return `<li style="margin:0.15rem 0;margin-left:1.2rem;list-style:disc">${applyInline(line.slice(2))}</li>`;
      if (/^\d+\. /.test(line))
        return `<li style="margin:0.15rem 0;margin-left:1.2rem;list-style:decimal">${applyInline(line.replace(/^\d+\. /, ''))}</li>`;
      if (line.startsWith('---'))
        return '<hr style="border:none;border-top:1px solid #E2E8F0;margin:0.6rem 0">';
      if (line === '') return '<div style="height:0.4rem"></div>';
      return `<p style="margin:0.15rem 0;line-height:1.6">${applyInline(line)}</p>`;
    })
    .join('');
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab definitions
// ─────────────────────────────────────────────────────────────────────────────

const AI_TABS: TabDef[] = [
  {
    id: 'md', label: '教案', Icon: FileText, color: '#7C3AED',
    badge: c => !!c?.mdContent, badgeBg: '#EDE9FE', badgeText: '#6D28D9',
    sectionBased: true,
  },
  {
    id: 'exp', label: '实验文档', Icon: FlaskConical, color: '#059669',
    badge: c => !!c?.experimentMd, badgeBg: '#D1FAE5', badgeText: '#065F46',
    sectionBased: true,
  },
  {
    id: 'slide', label: '课件幻灯', Icon: Monitor, color: '#2563EB',
    badge: c => !!c?.slideHtml, badgeBg: '#DBEAFE', badgeText: '#1D4ED8',
    sectionBased: true,
  },
  {
    id: 'quiz', label: '题库', Icon: ClipboardList, color: '#B45309',
    badge: c => !!c?.quizJson, badgeBg: '#FEF3C7', badgeText: '#B45309',
    sectionBased: true,
  },
  {
    id: 'chat', label: '通用对话', Icon: MessageSquare, color: '#0891B2',
    badge: () => false, badgeBg: '', badgeText: '',
    sectionBased: false,
  },
  {
    id: 'outline', label: '大纲优化', Icon: Wand2, color: '#DC2626',
    badge: () => false, badgeBg: '', badgeText: '',
    sectionBased: false,
  },
  {
    id: 'scenes', label: '场景大纲', Icon: LayoutList, color: '#7C3AED',
    badge: () => false, badgeBg: '', badgeText: '',
    sectionBased: false,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export function Step4AIEditor({ prep, onDone }: Props) {
  const outline: OutlineNode[] = prep.outlineJson ? JSON.parse(prep.outlineJson) : [];
  const basicInfo = prep.basicInfoJson ? JSON.parse(prep.basicInfoJson) : {};
  const courseName: string = basicInfo.courseName ?? '';

  const allSections = outline.flatMap(ch =>
    (ch.children ?? []).map(s => ({
      id: s.id,
      title: s.title,
      chapterId: ch.id,
      chapterTitle: ch.title,
    })),
  );

  // ── State ──────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<AITab>('md');
  const [activeSectionId, setActiveSectionId] = useState<string | null>(
    allSections[0]?.id ?? null,
  );
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
    new Set(outline.map(c => c.id)),
  );
  const [contents, setContents] = useState<Record<string, SectionContent>>({});
  const [generating, setGenerating] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Save-as-resource state: key = `${sectionId}_${tab}`
  const [savingResource, setSavingResource] = useState<Record<string, boolean>>({});
  const [savedResource, setSavedResource] = useState<Record<string, number>>({}); // key → resourceId
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // ── Scenes (场景大纲) ─────────────────────────────────────────────────────
  const [sceneOutlines, setSceneOutlines] = useState<SceneOutline[]>([]);
  const [scenesStreaming, setScenesStreaming] = useState(false);
  const scenesAbortRef = useRef<AbortController | null>(null);

  // Chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatStreaming, setChatStreaming] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatAbortRef = useRef<AbortController | null>(null);

  // Outline optimization
  const [outlineResult, setOutlineResult] = useState('');
  const [outlineGenerating, setOutlineGenerating] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  const activeSection = allSections.find(s => s.id === activeSectionId);
  const activeContent = activeSectionId
    ? (contents[activeSectionId] ?? { sectionId: activeSectionId })
    : null;
  const currentTabDef = AI_TABS.find(t => t.id === activeTab)!;

  const setContent = useCallback(
    (sectionId: string, field: keyof SectionContent, val: string) => {
      setContents(prev => ({
        ...prev,
        [sectionId]: { ...prev[sectionId], sectionId, [field]: val },
      }));
    },
    [],
  );

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // ── Section-based generators ───────────────────────────────────────────────
  const handleGenerate = useCallback(
    async (tab: AITab) => {
      if (!activeSectionId || !activeSection) return;
      abortRef.current?.abort();
      abortRef.current = new AbortController();
      setGenerating(tab);
      let buf = '';
      try {
        if (tab === 'md') {
          const stream = aiGenerateMdContent(
            { sectionTitle: activeSection.title, courseName },
            abortRef.current.signal,
          );
          for await (const chunk of stream) {
            buf += chunk;
            setContent(activeSectionId, 'mdContent', buf);
          }
        } else if (tab === 'exp') {
          const stream = aiGenerateExperimentMd(
            { sectionTitle: activeSection.title, courseName },
            abortRef.current.signal,
          );
          for await (const chunk of stream) {
            buf += chunk;
            setContent(activeSectionId, 'experimentMd', buf);
          }
        } else if (tab === 'slide') {
          const existingMd = contents[activeSectionId]?.mdContent ?? '';
          const stream = aiGenerateSlideHtml(
            { sectionTitle: activeSection.title, courseName, mdContent: existingMd },
            abortRef.current.signal,
          );
          for await (const chunk of stream) {
            buf += chunk;
            setContent(activeSectionId, 'slideHtml', buf);
          }
        } else if (tab === 'quiz') {
          const questions = await aiGenerateQuiz({
            sectionTitle: activeSection.title,
            count: 5,
          });
          setContent(activeSectionId, 'quizJson', JSON.stringify(questions, null, 2));
        }
      } catch (e: unknown) {
        const isAbort = e instanceof Error && e.name === 'AbortError';
        if (!isAbort) {
          const errField: keyof SectionContent =
            tab === 'md' ? 'mdContent' :
            tab === 'exp' ? 'experimentMd' :
            tab === 'slide' ? 'slideHtml' : 'quizJson';
          if (!buf) setContent(activeSectionId, errField, '生成失败，请检查 AI 配置');
        }
      } finally {
        setGenerating(null);
      }
    },
    [activeSectionId, activeSection, courseName, contents, setContent],
  );

  // ── Generate scene outlines (SSE streaming) ────────────────────────────────
  const handleGenerateSceneOutlines = useCallback(async () => {
    if (scenesStreaming) return;
    setSceneOutlines([]);
    setScenesStreaming(true);
    scenesAbortRef.current?.abort();
    scenesAbortRef.current = new AbortController();
    try {
      for await (const raw of streamSceneOutlines(
        { sectionTitle: courseName || '本课程', courseName, sceneCount: 6 },
        scenesAbortRef.current.signal,
      )) {
        try {
          const event: SceneOutlineEvent = JSON.parse(raw);
          if (event.type === 'outline' && event.data) {
            setSceneOutlines(prev => [...prev, event.data as SceneOutline]);
          }
        } catch {
          // skip unparseable chunk
        }
      }
    } finally {
      setScenesStreaming(false);
    }
  }, [scenesStreaming, courseName]);

  // ── Save as resource ───────────────────────────────────────────────────────
  const handleSaveAsResource = useCallback(
    async (
      tab: AITab,
      contentType: 'md' | 'html' | 'quiz_json',
      resourceType: 'lesson_plan' | 'courseware' | 'extension',
      content: string,
    ) => {
      if (!activeSectionId || !activeSection || !content) return;
      const key = `${activeSectionId}_${tab}`;
      setSavingResource(prev => ({ ...prev, [key]: true }));
      try {
        const labelMap: Record<string, string> = {
          md: '教案',
          exp: '实验文档',
          slide: '课件幻灯',
          quiz: '试题',
        };
        const result = await saveAiResource({
          resourceName: `${activeSection.title}·${labelMap[tab] ?? tab}（AI生成）`,
          content,
          contentType,
          resourceType,
          sectionId: undefined, // 暂不自动绑定章节（section UUID 非数字 ID）
        });
        setSavedResource(prev => ({ ...prev, [key]: result.resourceId }));
        setSaveToast('已保存为资源');
        setTimeout(() => setSaveToast(null), 3000);
      } catch (e) {
        setSaveToast('保存失败，请检查 AI 配置');
        setTimeout(() => setSaveToast(null), 3000);
      } finally {
        setSavingResource(prev => ({ ...prev, [key]: false }));
      }
    },
    [activeSectionId, activeSection],
  );

  // ── Chat ───────────────────────────────────────────────────────────────────
  const handleSendChat = useCallback(async () => {
    const text = chatInput.trim();
    if (!text || chatStreaming) return;
    const newMessages: ChatMessage[] = [...chatMessages, { role: 'user', content: text }];
    setChatMessages(newMessages);
    setChatInput('');
    setChatStreaming(true);
    setChatMessages(prev => [...prev, { role: 'assistant', content: '' }]);
    chatAbortRef.current?.abort();
    chatAbortRef.current = new AbortController();
    try {
      let buf = '';
      const stream = aiGeneralChat(newMessages, '', chatAbortRef.current.signal);
      for await (const chunk of stream) {
        buf += chunk;
        setChatMessages(prev => [
          ...prev.slice(0, -1),
          { role: 'assistant', content: buf },
        ]);
      }
    } catch (e: unknown) {
      const isAbort = e instanceof Error && e.name === 'AbortError';
      if (!isAbort) {
        setChatMessages(prev => [
          ...prev.slice(0, -1),
          { role: 'assistant', content: '⚠️ 对话失败，请检查 AI 配置' },
        ]);
      }
    } finally {
      setChatStreaming(false);
    }
  }, [chatInput, chatMessages, chatStreaming]);

  // ── Outline optimization ───────────────────────────────────────────────────
  const handleOptimizeOutline = useCallback(async () => {
    setOutlineGenerating(true);
    setOutlineResult('');
    const abortCtrl = new AbortController();
    try {
      let buf = '';
      const stream = aiOptimizeOutline(outline as unknown[], courseName, abortCtrl.signal);
      for await (const chunk of stream) {
        buf += chunk;
        setOutlineResult(buf);
      }
    } catch (e: unknown) {
      const isAbort = e instanceof Error && e.name === 'AbortError';
      if (!isAbort) setOutlineResult('生成失败，请检查 AI 配置');
    } finally {
      setOutlineGenerating(false);
    }
  }, [outline, courseName]);

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      const aiContents = Object.values(contents);
      await saveLessonPrepStep(prep.prepId, 4, { aiContents });
      onDone({ ...prep, currentStep: Math.max(prep.currentStep, 5) });
    } finally {
      setSaving(false);
    }
  };

  // ── Empty state ────────────────────────────────────────────────────────────
  if (allSections.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-10 text-center">
        <p className="text-[#94A3B8] text-sm">请先完成步骤 2（课程大纲）后再进行 AI 辅助编辑</p>
      </div>
    );
  }

  const isSectionTab = AI_TABS.find(t => t.id === activeTab)?.sectionBased ?? false;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden flex flex-col">
      {/* Tab Bar */}
      <div className="border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 pt-3 pb-0 flex items-center gap-0.5">
        {AI_TABS.map(tab => {
          const Icon = tab.Icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-xs font-medium transition-all border border-b-0 ${
                active
                  ? 'bg-white border-[#E2E8F0] text-[#1A2332] -mb-px pb-[9px]'
                  : 'bg-transparent border-transparent text-[#64748B] hover:text-[#1A2332] hover:bg-white/60'
              }`}
            >
              <Icon size={12} style={{ color: active ? tab.color : undefined }} />
              {tab.label}
            </button>
          );
        })}
        <div className="ml-auto flex items-center gap-1.5 pb-2">
          <Sparkles size={11} className="text-[#7C3AED]" />
          <span className="text-[#94A3B8] text-[10px]">AI 辅助备课</span>
        </div>
      </div>

      {/* Body */}
      <div className="flex overflow-hidden" style={{ height: '62vh' }}>
        {/* Section Sidebar (section-based tabs only) */}
        {isSectionTab && (
          <div className="w-52 border-r border-[#E2E8F0] overflow-y-auto flex-shrink-0 bg-[#FAFBFD]">
            {outline.map(chapter => {
              const expanded = expandedChapters.has(chapter.id);
              const secs = chapter.children ?? [];
              return (
                <div key={chapter.id}>
                  <button
                    className="w-full flex items-center gap-1.5 px-3 py-2.5 bg-[#F1F5F9] text-[#1E293B] text-xs font-semibold hover:bg-[#E2E8F0] transition-colors"
                    onClick={() =>
                      setExpandedChapters(prev => {
                        const next = new Set(prev);
                        if (next.has(chapter.id)) next.delete(chapter.id);
                        else next.add(chapter.id);
                        return next;
                      })
                    }
                  >
                    {expanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                    <span className="truncate flex-1 text-left">
                      {chapter.title || '（未命名章）'}
                    </span>
                  </button>
                  {expanded &&
                    secs.map(sec => {
                      const sc = contents[sec.id];
                      const hasBadge = currentTabDef?.badge(sc);
                      const isActive = activeSectionId === sec.id;
                      return (
                        <button
                          key={sec.id}
                          onClick={() => setActiveSectionId(sec.id)}
                          className={`w-full text-left px-4 py-2.5 border-b border-[#F0F4F8] transition-colors flex items-center gap-1.5 ${
                            isActive
                              ? 'bg-[#EDE9FE] text-[#5B21B6]'
                              : 'hover:bg-[#F8FAFC] text-[#475569]'
                          }`}
                        >
                          <span className="text-xs truncate flex-1 leading-tight">
                            {sec.title || '（未命名节）'}
                          </span>
                          {hasBadge && currentTabDef && (
                            <span
                              className="text-[8px] px-1 py-0.5 rounded flex-shrink-0 font-medium"
                              style={{
                                background: currentTabDef.badgeBg,
                                color: currentTabDef.badgeText,
                              }}
                            >
                              ✓
                            </span>
                          )}
                        </button>
                      );
                    })}
                </div>
              );
            })}
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col min-w-0">
          {/* ── 教案 Tab ── */}
          {activeTab === 'md' && (
            <SectionContentPanel
              section={activeSection}
              onGenerate={() => handleGenerate('md')}
              generating={generating === 'md'}
              generateLabel="AI 生成教案"
              generatingLabel="生成中…"
              accentColor="#7C3AED"
              copyText={activeContent?.mdContent}
              onCopy={() => navigator.clipboard.writeText(activeContent?.mdContent ?? '')}
              onSaveAsResource={activeContent?.mdContent ? () => handleSaveAsResource('md', 'md', 'lesson_plan', activeContent.mdContent!) : undefined}
              savingResource={savingResource[`${activeSectionId}_md`]}
              savedResource={!!savedResource[`${activeSectionId}_md`]}
            >
              <textarea
                value={activeContent?.mdContent ?? ''}
                onChange={e =>
                  activeSectionId && setContent(activeSectionId, 'mdContent', e.target.value)
                }
                placeholder="AI 生成的教案内容（Markdown 格式）将显示在这里，也可手动编辑..."
                className="flex-1 px-4 py-3 border-0 text-sm font-mono text-[#1A2332] focus:outline-none resize-none bg-transparent"
              />
            </SectionContentPanel>
          )}

          {/* ── 实验文档 Tab ── */}
          {activeTab === 'exp' && (
            <SectionContentPanel
              section={activeSection}
              onGenerate={() => handleGenerate('exp')}
              generating={generating === 'exp'}
              generateLabel="AI 生成实验文档"
              generatingLabel="生成中…"
              accentColor="#059669"
              copyText={activeContent?.experimentMd}
              onCopy={() => navigator.clipboard.writeText(activeContent?.experimentMd ?? '')}
              onSaveAsResource={activeContent?.experimentMd ? () => handleSaveAsResource('exp', 'md', 'extension', activeContent.experimentMd!) : undefined}
              savingResource={savingResource[`${activeSectionId}_exp`]}
              savedResource={!!savedResource[`${activeSectionId}_exp`]}
            >
              <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 flex flex-col border-r border-[#E2E8F0]">
                  <div className="px-3 py-1.5 bg-[#F8FAFC] border-b border-[#E2E8F0] text-[10px] text-[#94A3B8] font-medium">
                    编辑
                  </div>
                  <textarea
                    value={activeContent?.experimentMd ?? ''}
                    onChange={e =>
                      activeSectionId &&
                      setContent(activeSectionId, 'experimentMd', e.target.value)
                    }
                    placeholder="AI 生成的实验指导文档（Markdown）..."
                    className="flex-1 px-4 py-3 border-0 text-sm font-mono text-[#1A2332] focus:outline-none resize-none bg-transparent"
                  />
                </div>
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="px-3 py-1.5 bg-[#F8FAFC] border-b border-[#E2E8F0] text-[10px] text-[#94A3B8] font-medium">
                    预览
                  </div>
                  <div
                    className="flex-1 overflow-y-auto px-5 py-4 text-sm text-[#1A2332]"
                    style={{ fontFamily: 'system-ui, sans-serif', lineHeight: 1.7 }}
                    dangerouslySetInnerHTML={{
                      __html: renderSimpleMd(activeContent?.experimentMd ?? ''),
                    }}
                  />
                </div>
              </div>
            </SectionContentPanel>
          )}

          {/* ── 课件幻灯 Tab ── */}
          {activeTab === 'slide' && (
            <SectionContentPanel
              section={activeSection}
              onGenerate={() => handleGenerate('slide')}
              generating={generating === 'slide'}
              generateLabel={
                activeContent?.mdContent ? 'AI 生成课件（含教案）' : 'AI 生成课件'
              }
              generatingLabel="生成 HTML 中…"
              accentColor="#2563EB"
              copyText={activeContent?.slideHtml}
              onCopy={() => navigator.clipboard.writeText(activeContent?.slideHtml ?? '')}
              copyLabel="复制 HTML"
              hint={
                activeContent?.mdContent
                  ? undefined
                  : '建议先在"教案" Tab 中生成内容，课件会更丰富'
              }
              onSaveAsResource={activeContent?.slideHtml ? () => handleSaveAsResource('slide', 'html', 'courseware', activeContent.slideHtml!) : undefined}
              savingResource={savingResource[`${activeSectionId}_slide`]}
              savedResource={!!savedResource[`${activeSectionId}_slide`]}
            >
              <div className="flex-1 overflow-hidden">
                {activeContent?.slideHtml ? (
                  <iframe
                    srcDoc={activeContent.slideHtml}
                    sandbox="allow-scripts"
                    className="w-full h-full border-0"
                    title="AI 课件预览"
                  />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-[#94A3B8] gap-3">
                    <Monitor size={40} className="opacity-30" />
                    <p className="text-sm">点击上方按钮生成课件 HTML 并在此预览</p>
                    <p className="text-xs opacity-60">支持带动画效果的完整幻灯片</p>
                  </div>
                )}
              </div>
            </SectionContentPanel>
          )}

          {/* ── 题库 Tab ── */}
          {activeTab === 'quiz' && (
            <SectionContentPanel
              section={activeSection}
              onGenerate={() => handleGenerate('quiz')}
              generating={generating === 'quiz'}
              generateLabel="AI 生成题库"
              generatingLabel="生成中…"
              accentColor="#B45309"
              copyText={activeContent?.quizJson}
              onCopy={() => navigator.clipboard.writeText(activeContent?.quizJson ?? '')}
              onSaveAsResource={activeContent?.quizJson ? () => handleSaveAsResource('quiz', 'quiz_json', 'courseware', activeContent.quizJson!) : undefined}
              savingResource={savingResource[`${activeSectionId}_quiz`]}
              savedResource={!!savedResource[`${activeSectionId}_quiz`]}
            >
              <QuizDisplay
                json={activeContent?.quizJson}
                onRawChange={val =>
                  activeSectionId && setContent(activeSectionId, 'quizJson', val)
                }
              />
            </SectionContentPanel>
          )}

          {/* ── 通用对话 Tab ── */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {chatMessages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-[#94A3B8] gap-3 text-center">
                    <MessageSquare size={40} className="opacity-30" />
                    <p className="text-sm">向 AI 助手提问课程设计、教学策略等问题</p>
                    <div className="flex flex-wrap gap-2 justify-center mt-2">
                      {[
                        '如何设计有趣的实验课程?',
                        '冠状动脉介入教学有哪些难点?',
                        '请推荐适合医学生的教学方法',
                      ].map(q => (
                        <button
                          key={q}
                          onClick={() => setChatInput(q)}
                          className="text-xs px-3 py-1.5 bg-[#F0F9FF] text-[#0284C7] rounded-full border border-[#BAE6FD] hover:bg-[#E0F2FE] transition-colors"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-full bg-[#EDE9FE] flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                        <Sparkles size={12} className="text-[#7C3AED]" />
                      </div>
                    )}
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-[#7C3AED] text-white rounded-tr-sm'
                          : 'bg-[#F8FAFC] text-[#1A2332] border border-[#E2E8F0] rounded-tl-sm'
                      }`}
                    >
                      {msg.role === 'assistant' ? (
                        <div
                          dangerouslySetInnerHTML={{ __html: renderSimpleMd(msg.content) }}
                        />
                      ) : (
                        <span style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</span>
                      )}
                      {chatStreaming &&
                        i === chatMessages.length - 1 &&
                        msg.role === 'assistant' && (
                          <span className="inline-block w-1.5 h-4 bg-current animate-pulse rounded-sm ml-0.5 align-middle" />
                        )}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <div className="px-4 py-3 border-t border-[#E2E8F0] bg-[#FAFBFD] flex items-end gap-2">
                {chatMessages.length > 0 && (
                  <button
                    onClick={() => setChatMessages([])}
                    className="px-2 py-2 text-[#94A3B8] hover:text-[#475569] transition-colors flex-shrink-0"
                    title="清空对话"
                  >
                    <RefreshCw size={13} />
                  </button>
                )}
                <textarea
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendChat();
                    }
                  }}
                  placeholder="输入问题（Enter 发送，Shift+Enter 换行）"
                  rows={2}
                  className="flex-1 px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm text-[#1A2332] focus:outline-none focus:border-[#7C3AED] resize-none bg-white"
                  disabled={chatStreaming}
                />
                <button
                  onClick={handleSendChat}
                  disabled={!chatInput.trim() || chatStreaming}
                  className="px-4 py-2.5 bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] text-white rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity flex-shrink-0"
                >
                  {chatStreaming ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Send size={15} />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ── 大纲优化 Tab ── */}
          {activeTab === 'outline' && (
            <div className="flex-1 flex overflow-hidden">
              <div className="w-64 border-r border-[#E2E8F0] overflow-y-auto bg-[#FAFBFD] p-4 flex-shrink-0">
                <h4 className="text-xs font-semibold text-[#475569] mb-3 uppercase tracking-wide">
                  当前大纲
                </h4>
                {outline.length === 0 ? (
                  <p className="text-[#94A3B8] text-xs">未设置大纲</p>
                ) : (
                  outline.map((ch, ci) => (
                    <div key={ch.id} className="mb-3">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1E293B] mb-1">
                        <span className="w-5 h-5 rounded bg-[#E0E7FF] text-[#6366F1] flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                          {ci + 1}
                        </span>
                        <span className="truncate">{ch.title || '（未命名章）'}</span>
                      </div>
                      {(ch.children ?? []).map((sec, si) => (
                        <div
                          key={sec.id}
                          className="flex items-center gap-1.5 pl-6 py-0.5 text-xs text-[#64748B]"
                        >
                          <span className="text-[10px] text-[#94A3B8]">
                            {ci + 1}.{si + 1}
                          </span>
                          <span className="truncate">{sec.title || '（未命名节）'}</span>
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </div>
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="px-5 py-3 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center gap-3 flex-shrink-0">
                  <span className="text-[#1A2332] font-medium text-sm flex-1">
                    {courseName ? `「${courseName}」大纲优化建议` : '大纲分析与优化'}
                  </span>
                  {outlineResult && (
                    <button
                      onClick={() => navigator.clipboard.writeText(outlineResult)}
                      className="flex items-center gap-1 text-xs text-[#94A3B8] hover:text-[#475569] transition-colors"
                    >
                      <Copy size={11} /> 复制
                    </button>
                  )}
                  <button
                    onClick={handleOptimizeOutline}
                    disabled={outlineGenerating || outline.length === 0}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium text-white hover:opacity-90 disabled:opacity-60 transition-opacity"
                    style={{ background: 'linear-gradient(to right, #DC2626, #B91C1C)' }}
                  >
                    {outlineGenerating ? (
                      <>
                        <Loader2 size={11} className="animate-spin" /> 分析中…
                      </>
                    ) : (
                      <>
                        <Wand2 size={11} /> AI 分析大纲
                      </>
                    )}
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto px-6 py-5">
                  {outlineResult ? (
                    <div
                      className="text-sm text-[#1A2332]"
                      style={{ fontFamily: 'system-ui, sans-serif', lineHeight: 1.8 }}
                      dangerouslySetInnerHTML={{ __html: renderSimpleMd(outlineResult) }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-[#94A3B8] gap-3 text-center">
                      <Wand2 size={40} className="opacity-30" />
                      <p className="text-sm">点击"AI 分析大纲"对现有课程大纲进行专业评估</p>
                      <p className="text-xs opacity-60">
                        AI 将从完整性、逻辑性、学时分配等维度给出具体建议
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── 场景大纲 ─────────────────────────────────────── */}
          {activeTab === 'scenes' && (
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {sceneOutlines.length === 0 && !scenesStreaming ? (
                <div className="flex flex-col items-center justify-center h-full text-[#94A3B8] gap-4 text-center">
                  <LayoutList size={40} className="opacity-30" />
                  <p className="text-sm">AI 根据章节大纲自动规划教学场景</p>
                  <p className="text-xs opacity-60">
                    支持讲授（slide）、测验（quiz）、互动（interactive）、PBL 四种场景类型
                  </p>
                  <button
                    onClick={handleGenerateSceneOutlines}
                    className="mt-2 flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-opacity"
                    style={{ background: 'linear-gradient(to right, #7C3AED, #6D28D9)' }}
                  >
                    <Sparkles size={14} /> AI 生成场景大纲
                  </button>
                </div>
              ) : (
                <OutlinesEditor
                  outlines={sceneOutlines}
                  onChange={setSceneOutlines}
                  isStreaming={scenesStreaming}
                  isLoading={false}
                  onConfirm={() => {/* TODO: trigger scene content generation */}}
                  onBack={() => setSceneOutlines([])}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-[#E2E8F0] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="text-[#94A3B8] text-xs">AI 内容仅供参考，请根据实际情况调整后再发布</p>
          {saveToast && (
            <span className="flex items-center gap-1 text-xs text-[#059669] bg-[#D1FAE5] px-3 py-1 rounded-full">
              <CheckCircle2 size={11} /> {saveToast}
            </span>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#00897B] text-white rounded-xl text-sm font-medium hover:bg-[#00796B] disabled:opacity-60 transition-colors"
        >
          <Save size={14} /> {saving ? '保存中…' : '保存并继续'}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SectionContentPanel
// ─────────────────────────────────────────────────────────────────────────────

interface SectionContentPanelProps {
  section: { title: string; chapterTitle: string } | undefined;
  onGenerate: () => void;
  generating: boolean;
  generateLabel: string;
  generatingLabel: string;
  accentColor: string;
  copyText?: string;
  onCopy?: () => void;
  copyLabel?: string;
  hint?: string;
  onSaveAsResource?: () => void;
  savingResource?: boolean;
  savedResource?: boolean;
  children: ReactNode;
}

function SectionContentPanel({
  section,
  onGenerate,
  generating,
  generateLabel,
  generatingLabel,
  accentColor,
  copyText,
  onCopy,
  copyLabel = '复制',
  hint,
  onSaveAsResource,
  savingResource,
  savedResource,
  children,
}: SectionContentPanelProps) {
  if (!section) {
    return (
      <div className="flex-1 flex items-center justify-center text-[#94A3B8] text-sm flex-col gap-2">
        <FileText size={32} className="opacity-30" />
        <p>请从左侧选择一个章节开始编辑</p>
      </div>
    );
  }
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-5 py-3 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center gap-2 flex-wrap flex-shrink-0">
        <div className="flex-1 min-w-0">
          <span className="text-[#1A2332] font-medium text-sm truncate block">
            {section.title || '（未命名节）'}
          </span>
          {hint && <span className="text-[10px] text-[#94A3B8]">{hint}</span>}
        </div>
        {copyText && onCopy && (
          <button
            onClick={onCopy}
            className="flex items-center gap-1 text-xs text-[#94A3B8] hover:text-[#475569] transition-colors"
          >
            <Copy size={11} /> {copyLabel}
          </button>
        )}
        {copyText && onSaveAsResource && (
          <button
            onClick={onSaveAsResource}
            disabled={savingResource}
            title={savedResource ? '已保存为资源' : '保存为教学资源'}
            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border transition-colors disabled:opacity-60"
            style={savedResource ? {
              borderColor: '#6EE7B7', color: '#059669', background: '#D1FAE5',
            } : {
              borderColor: '#E2E8F0', color: '#475569', background: '#F8FAFC',
            }}
          >
            {savingResource ? (
              <Loader2 size={11} className="animate-spin" />
            ) : savedResource ? (
              <CheckCircle2 size={11} />
            ) : (
              <Save size={11} />
            )}
            {savedResource ? '已保存' : '保存为资源'}
          </button>
        )}
        <button
          onClick={onGenerate}
          disabled={generating}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white hover:opacity-90 disabled:opacity-60 transition-opacity"
          style={{ background: `linear-gradient(to right, ${accentColor}, ${accentColor}CC)` }}
        >
          {generating ? (
            <>
              <Loader2 size={11} className="animate-spin" /> {generatingLabel}
            </>
          ) : (
            <>
              <Sparkles size={11} /> {generateLabel}
            </>
          )}
        </button>
      </div>
      <div className="flex-1 overflow-hidden flex flex-col">{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// QuizDisplay
// ─────────────────────────────────────────────────────────────────────────────

interface QuizDisplayProps {
  json?: string;
  onRawChange: (val: string) => void;
}

function QuizDisplay({ json, onRawChange }: QuizDisplayProps) {
  const [viewRaw, setViewRaw] = useState(false);

  if (!json) {
    return (
      <div className="flex-1 flex items-center justify-center text-[#94A3B8] text-sm flex-col gap-2">
        <ClipboardList size={32} className="opacity-30" />
        <p>点击"AI 生成题库"按钮自动生成试题</p>
      </div>
    );
  }

  let parsed: unknown[] = [];
  try {
    const r = JSON.parse(json);
    parsed = Array.isArray(r) ? r : [r];
  } catch {
    // show raw on parse error
  }

  if (viewRaw || !parsed.length) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-3 py-1.5 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center gap-2">
          {parsed.length > 0 && (
            <button
              onClick={() => setViewRaw(false)}
              className="text-[10px] text-[#7C3AED] hover:underline"
            >
              ← 返回题目视图
            </button>
          )}
        </div>
        <textarea
          value={json}
          onChange={e => onRawChange(e.target.value)}
          className="flex-1 px-4 py-3 border-0 text-xs font-mono text-[#475569] focus:outline-none resize-none bg-transparent"
        />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex items-center justify-between px-5 py-2 border-b border-[#E2E8F0] bg-[#F8FAFC]">
        <span className="text-xs text-[#475569]">共 {parsed.length} 道试题</span>
        <button
          onClick={() => setViewRaw(true)}
          className="text-[10px] text-[#94A3B8] hover:text-[#475569] transition-colors"
        >
          查看 JSON
        </button>
      </div>
      <div className="px-5 py-4 space-y-4">
        {(parsed as Record<string, unknown>[]).map((q, i) => {
          const options =
            (q.options as unknown[]) ?? (q.choices as unknown[]) ?? [];
          const correctKey =
            (q.answer as string) ??
            (q.correctAnswer as string) ??
            (q.correct_answer as string) ??
            '';
          return (
            <div key={i} className="border border-[#E2E8F0] rounded-xl p-4 bg-white">
              <div className="flex items-start gap-2 mb-3">
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309] font-medium flex-shrink-0">
                  Q{i + 1}
                </span>
                <p className="text-sm text-[#1A2332] font-medium flex-1">
                  {(q.question as string) ?? (q.stem as string) ?? '题目'}
                </p>
              </div>
              {options.length > 0 && (
                <div className="space-y-1.5 mb-3 pl-7">
                  {options.map((opt, oi) => {
                    const label =
                      typeof opt === 'string'
                        ? opt
                        : ((opt as Record<string, string>).text ??
                          (opt as Record<string, string>).content ??
                          String(opt));
                    const optKey =
                      typeof opt === 'string'
                        ? String.fromCharCode(65 + oi)
                        : ((opt as Record<string, string>).key ??
                          String.fromCharCode(65 + oi));
                    const isCorrect =
                      correctKey === optKey ||
                      correctKey === label ||
                      correctKey === String.fromCharCode(65 + oi);
                    return (
                      <div
                        key={oi}
                        className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg ${
                          isCorrect
                            ? 'bg-[#F0FDF4] text-[#166534] font-medium'
                            : 'text-[#475569]'
                        }`}
                      >
                        <span
                          className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 ${
                            isCorrect
                              ? 'bg-[#22C55E] text-white'
                              : 'bg-[#F1F5F9] text-[#94A3B8]'
                          }`}
                        >
                          {String.fromCharCode(65 + oi)}
                        </span>
                        {label}
                      </div>
                    );
                  })}
                </div>
              )}
              {q.explanation && (
                <div className="pl-7 text-xs text-[#64748B] bg-[#F8FAFC] rounded-lg px-3 py-2">
                  💡 {q.explanation as string}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

