import { useState } from 'react';
import { Plus, Trash2, Save, GripVertical, ChevronRight, Sparkles } from 'lucide-react';
import { saveLessonPrepStep, type LessonPrep, type OutlineNode } from '../../../../api/lesson-prep';
import { aiGenerateOutline } from '../../../../api/ai-generate';

interface Props {
  prep: LessonPrep;
  onDone: (updated?: LessonPrep) => void;
}

function buildId() {
  return `n${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

function emptySection(): OutlineNode {
  return { id: buildId(), title: '', hours: 2 };
}

function emptyChapter(idx: number): OutlineNode {
  return {
    id: buildId(),
    title: `第${idx + 1}章`,
    hours: 4,
    children: [emptySection()],
  };
}

export function Step2Outline({ prep, onDone }: Props) {
  const initialOutline: OutlineNode[] = prep.outlineJson
    ? JSON.parse(prep.outlineJson)
    : [emptyChapter(0)];

  const [outline, setOutline] = useState<OutlineNode[]>(initialOutline);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [aiBuffer, setAiBuffer] = useState('');

  const basicInfo = prep.basicInfoJson ? JSON.parse(prep.basicInfoJson) : {};

  const handleAIGenerate = async () => {
    if (!basicInfo.courseName) { alert('请先完成步骤1填写课程名称'); return; }
    setGenerating(true);
    setAiBuffer('');
    let buffer = '';
    try {
      const stream = aiGenerateOutline({ courseName: basicInfo.courseName, totalSections: 5 });
      for await (const chunk of stream) {
        buffer += chunk;
        setAiBuffer(buffer);
      }
      // Try to parse as JSON
      const parsed = JSON.parse(buffer);
      setOutline(Array.isArray(parsed) ? parsed : []);
    } catch {
      // If AI not available, just show what we got
      if (buffer) {
        try { setOutline(JSON.parse(buffer)); } catch { /* ignore */ }
      }
    } finally {
      setGenerating(false);
      setAiBuffer('');
    }
  };

  const addChapter = () => setOutline(o => [...o, emptyChapter(o.length)]);

  const addSection = (chapterId: string) =>
    setOutline(o => o.map(ch => ch.id === chapterId
      ? { ...ch, children: [...(ch.children ?? []), emptySection()] }
      : ch
    ));

  const removeChapter = (chapterId: string) =>
    setOutline(o => o.filter(ch => ch.id !== chapterId));

  const removeSection = (chapterId: string, sectionId: string) =>
    setOutline(o => o.map(ch => ch.id === chapterId
      ? { ...ch, children: (ch.children ?? []).filter(s => s.id !== sectionId) }
      : ch
    ));

  const updateChapter = (chapterId: string, field: string, val: string | number) =>
    setOutline(o => o.map(ch => ch.id === chapterId ? { ...ch, [field]: val } : ch));

  const updateSection = (chapterId: string, sectionId: string, field: string, val: string | number) =>
    setOutline(o => o.map(ch => ch.id === chapterId
      ? {
          ...ch,
          children: (ch.children ?? []).map(s =>
            s.id === sectionId ? { ...s, [field]: val } : s
          ),
        }
      : ch
    ));

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveLessonPrepStep(prep.prepId, 2, outline);
      onDone({ ...prep, outlineJson: JSON.stringify(outline), currentStep: Math.max(prep.currentStep, 3) });
    } finally {
      setSaving(false);
    }
  };

  const totalHours = outline.reduce((s, ch) => s + (ch.hours ?? 0), 0);
  const totalSections = outline.reduce((s, ch) => s + (ch.children?.length ?? 0), 0);

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 space-y-5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-[#00897B]" />
          <h3 className="text-[#1A2332] font-semibold">步骤 2 · 课程大纲</h3>
          <span className="text-[#94A3B8] text-xs">({outline.length} 章 · {totalSections} 节 · {totalHours}学时)</span>
        </div>
        <button
          onClick={handleAIGenerate}
          disabled={generating}
          className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] text-white rounded-xl text-xs font-medium hover:opacity-90 disabled:opacity-60"
        >
          <Sparkles size={12} /> {generating ? 'AI生成中…' : 'AI 生成大纲'}
        </button>
      </div>

      {generating && (
        <div className="bg-[#F5F3FF] border border-[#DDD6FE] rounded-xl p-4 text-sm text-[#6D28D9] font-mono whitespace-pre-wrap max-h-40 overflow-auto">
          {aiBuffer || '正在生成大纲…'}
        </div>
      )}

      <div className="space-y-4 max-h-[60vh] overflow-y-auto">
        {outline.map((chapter, ci) => (
          <div key={chapter.id} className="border border-[#E2E8F0] rounded-xl overflow-hidden">
            {/* Chapter header */}
            <div className="bg-[#F8FAFC] px-4 py-3 flex items-center gap-3">
              <GripVertical size={14} className="text-[#CBD5E1] cursor-grab flex-shrink-0" />
              <span className="text-[#94A3B8] text-xs flex-shrink-0">第{ci + 1}章</span>
              <input
                value={chapter.title}
                onChange={e => updateChapter(chapter.id, 'title', e.target.value)}
                placeholder="章节标题"
                className="flex-1 bg-transparent text-[#1A2332] text-sm font-medium focus:outline-none placeholder-[#CBD5E1]"
              />
              <input
                type="number"
                value={chapter.hours}
                onChange={e => updateChapter(chapter.id, 'hours', Number(e.target.value))}
                min={0}
                className="w-16 text-center bg-white border border-[#E2E8F0] rounded-lg px-2 py-1 text-xs text-[#64748B] focus:outline-none"
              />
              <span className="text-[#94A3B8] text-xs">学时</span>
              <button onClick={() => removeChapter(chapter.id)} className="p-1 text-[#94A3B8] hover:text-[#E53935] transition-colors">
                <Trash2 size={14} />
              </button>
            </div>

            {/* Sections */}
            <div className="p-3 space-y-2">
              {(chapter.children ?? []).map((section, si) => (
                <div key={section.id} className="flex items-center gap-3 pl-6">
                  <ChevronRight size={12} className="text-[#CBD5E1] flex-shrink-0" />
                  <span className="text-[#94A3B8] text-xs flex-shrink-0">{si + 1}.</span>
                  <input
                    value={section.title}
                    onChange={e => updateSection(chapter.id, section.id, 'title', e.target.value)}
                    placeholder="小节标题"
                    className="flex-1 px-2 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-sm text-[#1A2332] focus:outline-none focus:border-[#00897B]"
                  />
                  <input
                    type="number"
                    value={section.hours}
                    onChange={e => updateSection(chapter.id, section.id, 'hours', Number(e.target.value))}
                    min={0}
                    className="w-14 text-center bg-white border border-[#E2E8F0] rounded-lg px-2 py-1 text-xs text-[#64748B] focus:outline-none"
                  />
                  <span className="text-[#94A3B8] text-xs">学时</span>
                  <button onClick={() => removeSection(chapter.id, section.id)} className="p-1 text-[#94A3B8] hover:text-[#E53935] transition-colors">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => addSection(chapter.id)}
                className="ml-8 flex items-center gap-1 text-xs text-[#0B5394] hover:text-[#1E88E5] transition-colors"
              >
                <Plus size={12} /> 添加小节
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={addChapter}
          className="flex items-center gap-1.5 px-4 py-2 border border-dashed border-[#CBD5E1] text-[#64748B] rounded-xl text-sm hover:border-[#00897B] hover:text-[#00897B] transition-colors"
        >
          <Plus size={14} /> 添加章节
        </button>
        <button
          onClick={handleSave}
          disabled={saving || outline.length === 0}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#00897B] text-white rounded-xl text-sm font-medium hover:bg-[#00796B] disabled:opacity-60 transition-colors"
        >
          <Save size={14} /> {saving ? '保存中…' : '保存并继续'}
        </button>
      </div>
    </div>
  );
}
