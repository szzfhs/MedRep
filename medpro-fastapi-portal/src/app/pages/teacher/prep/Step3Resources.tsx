import { useState, useEffect, useCallback } from 'react';
import {
  Save, Plus, Trash2, FileVideo, FileText, BookOpen, Package,
  X, Search, Loader2, ChevronDown, ChevronRight, Library, GraduationCap,
} from 'lucide-react';
import { saveLessonPrepStep, type LessonPrep, type OutlineNode } from '../../../../api/lesson-prep';
import { getResourceList, type Resource } from '../../../../api/resource';

interface Props {
  prep: LessonPrep;
  onDone: (updated?: LessonPrep) => void;
}

/** 存入 resource_config_json 的资源条目 */
interface DraftResource {
  resourceId: number;
  resourceName: string;
  resourceType: string;
  fileFormat: string | null;
  fileUrl: string | null;
}

/** resource_config_json 格式：sectionUUID → DraftResource[] */
type ResourceConfigMap = Record<string, DraftResource[]>;

interface ChapterGroup {
  id: string;
  title: string;
  sections: OutlineNode[];
}

const RESOURCE_GROUPS: {
  type: string;
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}[] = [
  { type: 'courseware',  label: '课件',    icon: FileText,      color: '#3B82F6', bg: '#EFF6FF' },
  { type: 'micro_video', label: '微课视频', icon: FileVideo,     color: '#8B5CF6', bg: '#F5F3FF' },
  { type: 'lesson_plan', label: '教案',    icon: BookOpen,      color: '#10B981', bg: '#ECFDF5' },
  { type: 'ebook',       label: '电子书',  icon: GraduationCap, color: '#F59E0B', bg: '#FFFBEB' },
  { type: 'extension',   label: '拓展资源', icon: Package,      color: '#6366F1', bg: '#EEF2FF' },
];

function parseOutline(outline: OutlineNode[]): ChapterGroup[] {
  return outline.map(ch => ({ id: ch.id, title: ch.title, sections: ch.children ?? [] }));
}

function parseConfigMap(json: string | null): ResourceConfigMap {
  if (!json) return {};
  try {
    const parsed = JSON.parse(json);
    // 兼容旧版数组格式
    if (Array.isArray(parsed)) {
      const map: ResourceConfigMap = {};
      for (const item of parsed) {
        if (item.sectionId && Array.isArray(item.resources)) {
          map[item.sectionId] = item.resources;
        }
      }
      return map;
    }
    return parsed as ResourceConfigMap;
  } catch {
    return {};
  }
}

// ─────────────────────────────────────────
// 资源库选择弹窗
// ─────────────────────────────────────────
interface PickerProps {
  defaultType: string;
  alreadyBoundIds: number[];
  onConfirm: (resources: DraftResource[]) => void;
  onClose: () => void;
}

function ResourcePickerModal({ defaultType, alreadyBoundIds, onConfirm, onClose }: PickerProps) {
  const PAGE_SIZE = 8;
  const [activeType, setActiveType] = useState(defaultType);
  const [search, setSearch] = useState('');
  const [pageNum, setPageNum] = useState(1);
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState<Resource[]>([]);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<Resource[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getResourceList({
        resourceType: activeType,
        resourceName: search || undefined,
        pageNum,
        pageSize: PAGE_SIZE,
        status: '1',
      });
      setResources(res.rows);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  }, [activeType, search, pageNum]);

  // 切换类型/搜索时重置到第 1 页
  useEffect(() => { setPageNum(1); }, [activeType, search]);
  useEffect(() => { load(); }, [load]);

  const toggleSelect = (r: Resource) => {
    if (alreadyBoundIds.includes(r.resourceId)) return;
    setSelected(prev =>
      prev.some(s => s.resourceId === r.resourceId)
        ? prev.filter(s => s.resourceId !== r.resourceId)
        : [...prev, r],
    );
  };

  const handleConfirm = () => {
    onConfirm(
      selected.map(r => ({
        resourceId: r.resourceId,
        resourceName: r.resourceName,
        resourceType: r.resourceType ?? activeType,
        fileFormat: r.fileFormat ?? null,
        fileUrl: r.fileUrl ?? null,
      })),
    );
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-[680px] max-h-[80vh] flex flex-col overflow-hidden">
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
          <h3 className="text-[#1A2332] font-semibold text-base">从资源库选择</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F1F5F9] transition-colors">
            <X size={16} className="text-[#94A3B8]" />
          </button>
        </div>

        {/* 资源类型 Tab */}
        <div className="flex gap-0.5 px-4 pt-3 border-b border-[#E2E8F0] overflow-x-auto">
          {RESOURCE_GROUPS.map(g => (
            <button
              key={g.type}
              onClick={() => setActiveType(g.type)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-t-lg text-xs font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                activeType === g.type
                  ? 'border-[#00897B] text-[#00897B] bg-[#E0F2F1]'
                  : 'border-transparent text-[#64748B] hover:text-[#1A2332]'
              }`}
            >
              <g.icon size={12} /> {g.label}
            </button>
          ))}
        </div>

        {/* 搜索栏 */}
        <div className="px-4 py-3 border-b border-[#F1F5F9]">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="搜索资源名称…"
              className="w-full pl-8 pr-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#00897B]"
            />
          </div>
        </div>

        {/* 资源列表 */}
        <div className="flex-1 overflow-y-auto px-4 py-2 min-h-[200px]">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 size={20} className="animate-spin text-[#00897B]" />
            </div>
          ) : resources.length === 0 ? (
            <div className="text-center py-12 text-[#94A3B8] text-sm">
              <Library size={32} className="mx-auto mb-2 text-[#CBD5E1]" />
              暂无该类型资源
            </div>
          ) : (
            <div className="space-y-1.5 py-1">
              {resources.map(r => {
                const isBound = alreadyBoundIds.includes(r.resourceId);
                const isSelected = selected.some(s => s.resourceId === r.resourceId);
                return (
                  <label
                    key={r.resourceId}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors cursor-pointer select-none ${
                      isBound
                        ? 'opacity-50 cursor-not-allowed'
                        : isSelected
                        ? 'bg-[#E0F2F1] border border-[#00897B]'
                        : 'hover:bg-[#F8FAFC] border border-transparent'
                    }`}
                  >
                    <input
                      type="checkbox"
                      disabled={isBound}
                      checked={isSelected || isBound}
                      onChange={() => toggleSelect(r)}
                      className="accent-[#00897B] flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[#1A2332] truncate">{r.resourceName}</div>
                      <div className="text-xs text-[#94A3B8] flex items-center gap-2 mt-0.5">
                        {r.fileFormat && <span className="uppercase">{r.fileFormat}</span>}
                        {r.duration ? <span>{Math.round(r.duration / 60)} 分钟</span> : null}
                        {isBound && <span className="text-[#00897B]">已添加</span>}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 px-4 py-2 border-t border-[#F1F5F9]">
            <button
              disabled={pageNum <= 1}
              onClick={() => setPageNum(p => p - 1)}
              className="px-2 py-1 text-xs text-[#64748B] disabled:opacity-40 hover:text-[#00897B]"
            >上一页</button>
            <span className="text-xs text-[#94A3B8]">{pageNum} / {totalPages}</span>
            <button
              disabled={pageNum >= totalPages}
              onClick={() => setPageNum(p => p + 1)}
              className="px-2 py-1 text-xs text-[#64748B] disabled:opacity-40 hover:text-[#00897B]"
            >下一页</button>
          </div>
        )}

        {/* 底部操作栏 */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#E2E8F0] bg-[#FAFAFA]">
          <span className="text-xs text-[#94A3B8]">已选 {selected.length} 个</span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-[#64748B] hover:bg-[#F1F5F9] rounded-xl transition-colors"
            >取消</button>
            <button
              onClick={handleConfirm}
              disabled={selected.length === 0}
              className="px-4 py-2 bg-[#00897B] text-white text-sm rounded-xl font-medium hover:bg-[#00796B] disabled:opacity-50 transition-colors"
            >添加{selected.length > 0 ? ` (${selected.length})` : ''}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// 主组件
// ─────────────────────────────────────────
export function Step3Resources({ prep, onDone }: Props) {
  const outline: OutlineNode[] = prep.outlineJson ? JSON.parse(prep.outlineJson) : [];
  const chapters: ChapterGroup[] = parseOutline(outline);

  const [configMap, setConfigMap] = useState<ResourceConfigMap>(() => parseConfigMap(prep.resourceConfigJson));
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
    () => new Set(chapters.map(c => c.id)),
  );
  const [activeSection, setActiveSection] = useState<string | null>(
    chapters[0]?.sections[0]?.id ?? null,
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerType, setPickerType] = useState('courseware');
  const [saving, setSaving] = useState(false);

  const hasSections = chapters.some(c => c.sections.length > 0);

  if (!hasSections) {
    return (
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-10 text-center">
        <p className="text-[#94A3B8] text-sm">请先完成步骤 2（课程大纲），才能配置章节资源</p>
      </div>
    );
  }

  const toggleChapter = (id: string) => {
    setExpandedChapters(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const activeSectionResources: DraftResource[] = activeSection ? (configMap[activeSection] ?? []) : [];
  const totalResourceCount = Object.values(configMap).reduce((sum, arr) => sum + arr.length, 0);

  const openPicker = (type: string) => {
    setPickerType(type);
    setPickerOpen(true);
  };

  const handlePickerConfirm = (picked: DraftResource[]) => {
    if (!activeSection) return;
    setConfigMap(prev => {
      const existing = prev[activeSection] ?? [];
      const newOnes = picked.filter(r => !existing.some(e => e.resourceId === r.resourceId));
      return { ...prev, [activeSection]: [...existing, ...newOnes] };
    });
    setPickerOpen(false);
  };

  const removeResource = (resourceId: number) => {
    if (!activeSection) return;
    setConfigMap(prev => ({
      ...prev,
      [activeSection]: (prev[activeSection] ?? []).filter(r => r.resourceId !== resourceId),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveLessonPrepStep(prep.prepId, 3, configMap);
      onDone({
        ...prep,
        resourceConfigJson: JSON.stringify(configMap),
        currentStep: Math.max(prep.currentStep, 4),
      });
    } finally {
      setSaving(false);
    }
  };

  // 当前激活章节名称
  const activeSectionLabel = (() => {
    for (const ch of chapters) {
      const s = ch.sections.find(s => s.id === activeSection);
      if (s) return `${ch.title} › ${s.title}`;
    }
    return '章节资源配置';
  })();

  return (
    <>
      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
        <div className="flex h-[62vh]">

          {/* ─── 左侧：章节导航 ─── */}
          <div className="w-56 border-r border-[#E2E8F0] overflow-y-auto flex-shrink-0 bg-[#FAFBFC]">
            <div className="px-3 py-3 border-b border-[#E2E8F0] flex items-center justify-between">
              <h4 className="text-[#1A2332] font-semibold text-xs">章节导航</h4>
              <span className="text-xs text-[#94A3B8]">{totalResourceCount} 个</span>
            </div>

            {chapters.map((chapter, ci) => {
              const isExpanded = expandedChapters.has(chapter.id);
              const chapterCount = chapter.sections.reduce(
                (sum, s) => sum + (configMap[s.id]?.length ?? 0),
                0,
              );
              return (
                <div key={chapter.id}>
                  {/* 章标题行 */}
                  <button
                    onClick={() => toggleChapter(chapter.id)}
                    className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-[#F1F5F9] transition-colors"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      {isExpanded
                        ? <ChevronDown size={12} className="text-[#94A3B8] flex-shrink-0" />
                        : <ChevronRight size={12} className="text-[#94A3B8] flex-shrink-0" />}
                      <span className="text-xs font-semibold text-[#1A2332] truncate">
                        第{ci + 1}章 {chapter.title || '未命名'}
                      </span>
                    </div>
                    {chapterCount > 0 && (
                      <span className="text-[9px] px-1.5 py-0.5 bg-[#00897B] text-white rounded-full flex-shrink-0 ml-1">
                        {chapterCount}
                      </span>
                    )}
                  </button>

                  {/* 节列表 */}
                  {isExpanded && chapter.sections.map((section, si) => {
                    const secCount = configMap[section.id]?.length ?? 0;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center justify-between pl-6 pr-3 py-2.5 border-b border-[#F0F4F8] text-left transition-colors ${
                          activeSection === section.id
                            ? 'bg-[#E0F2F1] text-[#00695C]'
                            : 'hover:bg-[#F8FAFC] text-[#475569]'
                        }`}
                      >
                        <span className="text-xs truncate">{si + 1}. {section.title || '未命名'}</span>
                        {secCount > 0 && (
                          <span className="text-[9px] px-1.5 py-0.5 bg-[#E0F2F1] text-[#00695C] rounded-full flex-shrink-0 ml-1">
                            {secCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* ─── 右侧：资源配置面板 ─── */}
          <div className="flex-1 overflow-y-auto">
            {!activeSection ? (
              <div className="flex items-center justify-center h-full text-[#94A3B8] text-sm">
                请从左侧选择一个章节
              </div>
            ) : (
              <div className="p-5 space-y-3">
                <h4 className="text-[#1A2332] font-semibold text-sm pb-1 border-b border-[#F1F5F9]">
                  {activeSectionLabel}
                </h4>

                {/* 五类资源分组 */}
                {RESOURCE_GROUPS.map(group => {
                  const groupResources = activeSectionResources.filter(
                    r => r.resourceType === group.type,
                  );
                  const Icon = group.icon;
                  return (
                    <div key={group.type} className="border border-[#E2E8F0] rounded-xl overflow-hidden">
                      {/* 组标题行 */}
                      <div
                        className="flex items-center justify-between px-4 py-2.5 border-b border-[#E2E8F0]"
                        style={{ backgroundColor: group.bg }}
                      >
                        <div className="flex items-center gap-2">
                          <Icon size={14} style={{ color: group.color }} />
                          <span className="text-sm font-medium text-[#1A2332]">{group.label}</span>
                          {groupResources.length > 0 && (
                            <span
                              className="text-[10px] px-1.5 py-0.5 rounded-full text-white"
                              style={{ backgroundColor: group.color }}
                            >
                              {groupResources.length}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => openPicker(group.type)}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-white border border-[#E2E8F0] text-[#64748B] hover:border-[#00897B] hover:text-[#00897B] transition-colors"
                        >
                          <Plus size={11} /> 从资源库选择
                        </button>
                      </div>

                      {/* 资源卡片列表 */}
                      <div className="p-3 bg-white">
                        {groupResources.length === 0 ? (
                          <p className="text-xs text-[#CBD5E1] py-0.5 px-1">
                            暂无资源，点击右上角从资源库选择
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {groupResources.map(r => (
                              <div
                                key={r.resourceId}
                                className="flex items-center gap-3 px-3 py-2.5 bg-[#FAFAFA] border border-[#E2E8F0] rounded-lg group hover:border-[#CBD5E1] transition-colors"
                              >
                                <Icon size={14} style={{ color: group.color }} className="flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm text-[#1A2332] truncate">{r.resourceName}</div>
                                  {r.fileFormat && (
                                    <div className="text-xs text-[#94A3B8] uppercase mt-0.5">
                                      {r.fileFormat}
                                    </div>
                                  )}
                                </div>
                                <button
                                  onClick={() => removeResource(r.resourceId)}
                                  className="p-1.5 rounded opacity-0 group-hover:opacity-100 hover:bg-[#FEE2E2] text-[#CBD5E1] hover:text-[#EF4444] transition-all"
                                  title="移除"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 底部保存栏 */}
        <div className="px-6 py-4 border-t border-[#E2E8F0] flex items-center justify-between">
          <span className="text-xs text-[#94A3B8]">共配置 {totalResourceCount} 个资源</span>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#00897B] text-white rounded-xl text-sm font-medium hover:bg-[#00796B] disabled:opacity-60 transition-colors"
          >
            <Save size={14} /> {saving ? '保存中…' : '保存并继续'}
          </button>
        </div>
      </div>

      {/* 资源库选择弹窗 */}
      {pickerOpen && (
        <ResourcePickerModal
          defaultType={pickerType}
          alreadyBoundIds={activeSectionResources.map(r => r.resourceId)}
          onConfirm={handlePickerConfirm}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </>
  );
}
