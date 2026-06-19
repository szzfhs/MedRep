/**
 * OutlinesEditor — 场景大纲编辑器
 *
 * Ported from OpenMAIC/components/generation/outlines-editor.tsx
 * Adapted for:
 *  - React 18 (no `use()` hook)
 *  - Chinese UI strings (no i18n)
 *  - medpro-fastapi-portal shadcn components at @/app/components/ui/...
 */

import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Check,
  ChevronDown,
  GripVertical,
  Loader2,
  Minimize2,
  Minus,
  Plus,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { nanoid } from 'nanoid';
import { Button } from '@/app/components/ui/button';
import { Checkbox } from '@/app/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover';
import type { SceneOutline, SceneType } from '@/api/ai-generate';

// ────────────────────────────────────────────────────────────────────────────────
// Types & theme
// ────────────────────────────────────────────────────────────────────────────────

function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(' ');
}

const SCENE_TYPES: SceneType[] = ['slide', 'quiz', 'interactive', 'pbl'];

const TYPE_LABELS: Record<SceneType, string> = {
  slide: '讲授',
  quiz: '测验',
  interactive: '互动',
  pbl: 'PBL',
};

const TYPE_THEME: Record<SceneType, { chip: string; chipHover: string; accent: string; dot: string }> = {
  slide: {
    chip: 'bg-blue-50 text-blue-600',
    chipHover: 'hover:bg-blue-100/80',
    accent: 'bg-blue-500',
    dot: 'bg-blue-400',
  },
  quiz: {
    chip: 'bg-purple-50 text-purple-600',
    chipHover: 'hover:bg-purple-100/80',
    accent: 'bg-purple-500',
    dot: 'bg-purple-400',
  },
  interactive: {
    chip: 'bg-emerald-50 text-emerald-600',
    chipHover: 'hover:bg-emerald-100/80',
    accent: 'bg-emerald-500',
    dot: 'bg-emerald-400',
  },
  pbl: {
    chip: 'bg-amber-50 text-amber-700',
    chipHover: 'hover:bg-amber-100/80',
    accent: 'bg-amber-500',
    dot: 'bg-amber-400',
  },
};

// ────────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────────

function normalizeOrder(outlines: SceneOutline[]): SceneOutline[] {
  return outlines.map((outline, index) => ({ ...outline, order: index + 1 }));
}

function useAutoResize(ref: React.RefObject<HTMLTextAreaElement | null>, value: string) {
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const frame = requestAnimationFrame(() => {
      node.style.height = 'auto';
      node.style.height = `${node.scrollHeight}px`;
    });
    return () => cancelAnimationFrame(frame);
  }, [ref, value]);
}

// ────────────────────────────────────────────────────────────────────────────────
// Props
// ────────────────────────────────────────────────────────────────────────────────

export interface OutlinesEditorProps {
  outlines: SceneOutline[];
  onChange: (outlines: SceneOutline[]) => void;
  onConfirm: () => void;
  onBack: () => void;
  isLoading?: boolean;
  /** SSE is still pumping outlines — render read-only. */
  isStreaming?: boolean;
  onCollapse?: () => void;
}

// ────────────────────────────────────────────────────────────────────────────────
// Main component
// ────────────────────────────────────────────────────────────────────────────────

export function OutlinesEditor({
  outlines,
  onChange,
  onConfirm,
  onBack,
  isLoading = false,
  isStreaming = false,
  onCollapse,
}: OutlinesEditorProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const lastScrollTargetRef = useRef<string | null>(null);
  const editingDisabled = isLoading || isStreaming;
  const lastOutlineId = outlines.length > 0 ? outlines[outlines.length - 1].id : null;

  // Auto-scroll to latest streamed scene
  useEffect(() => {
    if (!isStreaming || !lastOutlineId) return;
    if (lastScrollTargetRef.current === lastOutlineId) return;
    lastScrollTargetRef.current = lastOutlineId;
    const node = document.getElementById(`outline-scene-${lastOutlineId}`);
    if (node) node.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [isStreaming, lastOutlineId]);

  const addOutline = () => {
    if (editingDisabled) return;
    onChange(normalizeOrder([
      ...outlines,
      { id: nanoid(8), type: 'slide', title: '', description: '', keyPoints: [], order: outlines.length + 1 },
    ]));
  };

  const updateOutline = (index: number, updates: Partial<SceneOutline>) => {
    const next = [...outlines];
    next[index] = { ...next[index], ...updates };
    onChange(normalizeOrder(next));
  };

  const removeOutline = (index: number) => {
    if (editingDisabled) return;
    onChange(normalizeOrder(outlines.filter((_, i) => i !== index)));
  };

  const insertOutlineAt = (atIndex: number) => {
    if (editingDisabled) return;
    const next = [...outlines];
    next.splice(atIndex, 0, { id: nanoid(8), type: 'slide', title: '', description: '', keyPoints: [], order: atIndex + 1 });
    onChange(normalizeOrder(next));
  };

  const moveOutline = (index: number, direction: 'up' | 'down') => {
    if (editingDisabled) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= outlines.length) return;
    const next = [...outlines];
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    onChange(normalizeOrder(next));
  };

  const reorderOutline = (fromIndex: number, toIndex: number) => {
    if (editingDisabled || fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;
    const next = [...outlines];
    const [item] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, item);
    onChange(normalizeOrder(next));
  };

  const headerSubtitle = useMemo(() => {
    if (isStreaming) {
      return outlines.length > 0
        ? `已生成 ${outlines.length} 个场景，正在继续…`
        : '正在生成场景大纲，请稍候…';
    }
    return `共 ${outlines.length} 个场景`;
  }, [isStreaming, outlines.length]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-lg">
      {/* Header */}
      <div className="relative flex items-start gap-3 px-6 pt-6 pb-4">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-[#94A3B8]">
            <Sparkles className="size-3 text-blue-500" />
            场景大纲
          </div>
          <h2 className="text-xl font-semibold text-[#0F172A]">AI 生成场景大纲</h2>
          <p className="flex min-h-[1.5rem] items-center gap-2 text-sm text-[#64748B]">
            {isStreaming && (
              <motion.span
                aria-hidden
                className="inline-flex size-1.5 rounded-full bg-blue-500"
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
            )}
            {headerSubtitle}
          </p>
        </div>
        {onCollapse && (
          <button
            type="button"
            onClick={onCollapse}
            disabled={isLoading}
            title="收起编辑器"
            className="mt-1 inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#475569] transition-colors disabled:opacity-50"
          >
            <Minimize2 className="size-3.5" />
            <span>收起</span>
          </button>
        )}
      </div>

      {/* Scene list */}
      <div className="relative max-h-[60vh] overflow-y-auto px-3 pb-2">
        {outlines.length === 0 ? (
          <EmptyState isStreaming={isStreaming} disabled={editingDisabled} onAdd={addOutline} />
        ) : (
          <ol className="flex flex-col py-1">
            {!isStreaming && (
              <InsertDivider onClick={() => insertOutlineAt(0)} disabled={editingDisabled} position="edge" />
            )}
            <AnimatePresence initial={false}>
              {outlines.map((outline, index) => {
                const isLast = outline.id === lastOutlineId;
                const isStreamingTip = isStreaming && isLast;
                return (
                  <Fragment key={outline.id}>
                    <SceneRow
                      index={index}
                      outline={outline}
                      onUpdate={(updates) => updateOutline(index, updates)}
                      onRemove={() => removeOutline(index)}
                      onMoveUp={() => moveOutline(index, 'up')}
                      onMoveDown={() => moveOutline(index, 'down')}
                      canMoveUp={index > 0}
                      canMoveDown={index < outlines.length - 1}
                      disabled={editingDisabled}
                      isStreamingTip={isStreamingTip}
                      isDragging={draggingId === outline.id}
                      isDragTarget={dragOverId === outline.id && draggingId !== outline.id}
                      onDragStart={() => setDraggingId(outline.id)}
                      onDragEnd={() => { setDraggingId(null); setDragOverId(null); }}
                      onDragEnter={() => { if (draggingId && draggingId !== outline.id) setDragOverId(outline.id); }}
                      onDrop={(sourceId) => {
                        const fromIndex = outlines.findIndex((item) => item.id === sourceId);
                        if (fromIndex >= 0) reorderOutline(fromIndex, index);
                        setDraggingId(null);
                        setDragOverId(null);
                      }}
                    />
                    {!isStreaming && (
                      <InsertDivider
                        onClick={() => insertOutlineAt(index + 1)}
                        disabled={editingDisabled}
                        position={isLast ? 'edge' : 'between'}
                      />
                    )}
                  </Fragment>
                );
              })}
            </AnimatePresence>
            {isStreaming && <StreamingPlaceholder />}
          </ol>
        )}
      </div>

      {/* Footer */}
      <div className="relative flex flex-wrap items-center justify-between gap-3 border-t border-[#E2E8F0] bg-[#F8FAFC]/80 px-6 py-4">
        <button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className="text-sm text-[#94A3B8] hover:text-[#475569] disabled:opacity-50 transition-colors"
        >
          ← 返回
        </button>

        <Button
          onClick={onConfirm}
          disabled={isLoading || isStreaming || outlines.length === 0}
          className="rounded-full px-6"
        >
          {isLoading ? (
            <><Loader2 className="size-4 animate-spin mr-1" />生成中…</>
          ) : isStreaming ? (
            <><Loader2 className="size-4 animate-spin mr-1" />等待大纲完成…</>
          ) : (
            <><Check className="size-4 mr-1" />确认并生成场景内容</>
          )}
        </Button>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// Scene row
// ────────────────────────────────────────────────────────────────────────────────

interface SceneRowProps {
  index: number;
  outline: SceneOutline;
  onUpdate: (updates: Partial<SceneOutline>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  disabled: boolean;
  isStreamingTip: boolean;
  isDragging: boolean;
  isDragTarget: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDragEnter: () => void;
  onDrop: (sourceId: string) => void;
}

function SceneRow({
  index,
  outline,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  disabled,
  isStreamingTip,
  isDragging,
  isDragTarget,
  onDragStart,
  onDragEnd,
  onDragEnter,
  onDrop,
}: SceneRowProps) {
  const theme = TYPE_THEME[outline.type] ?? TYPE_THEME.slide;
  const [keyPointDraft, setKeyPointDraft] = useState('');
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);

  useAutoResize(titleRef, outline.title);
  useAutoResize(descRef, outline.description);

  const addKeyPoint = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    onUpdate({ keyPoints: [...(outline.keyPoints ?? []), trimmed] });
    setKeyPointDraft('');
  };

  const removeKeyPoint = (idx: number) => {
    onUpdate({ keyPoints: (outline.keyPoints ?? []).filter((_, i) => i !== idx) });
  };

  const handleKeyPointKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addKeyPoint(keyPointDraft);
    } else if (event.key === 'Backspace' && !keyPointDraft && (outline.keyPoints?.length ?? 0) > 0) {
      removeKeyPoint((outline.keyPoints?.length ?? 0) - 1);
    }
  };

  return (
    <motion.li
      id={`outline-scene-${outline.id}`}
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
      onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; }}
      onDragEnter={onDragEnter}
      onDrop={(event) => {
        event.preventDefault();
        const sourceId = event.dataTransfer.getData('text/plain');
        if (sourceId) onDrop(sourceId);
      }}
      className={cn(
        'group/scene relative rounded-xl px-3 py-3 transition-colors',
        'hover:bg-[#F8FAFC]',
        isDragging && 'opacity-40',
        isDragTarget && 'bg-blue-500/5 ring-1 ring-blue-400/40',
      )}
    >
      <div className="flex items-start gap-2.5">
        {/* Drag handle + number */}
        <div className="flex shrink-0 items-center gap-0.5 pt-1">
          <button
            type="button"
            draggable={!disabled}
            title="拖动排序"
            onDragStart={(event) => {
              event.dataTransfer.effectAllowed = 'move';
              event.dataTransfer.setData('text/plain', outline.id);
              onDragStart();
            }}
            onDragEnd={onDragEnd}
            onKeyDown={(event) => {
              if (disabled || !(event.ctrlKey || event.metaKey)) return;
              if (event.key === 'ArrowUp' && canMoveUp) { event.preventDefault(); onMoveUp(); }
              else if (event.key === 'ArrowDown' && canMoveDown) { event.preventDefault(); onMoveDown(); }
            }}
            disabled={disabled}
            className={cn(
              'flex size-7 shrink-0 cursor-grab items-center justify-center rounded-md',
              'text-[#CBD5E1] hover:bg-[#F1F5F9] hover:text-[#64748B] transition-colors active:cursor-grabbing',
              disabled && 'pointer-events-none opacity-30',
            )}
          >
            <GripVertical className="size-4" />
          </button>
          <span className={cn(
            'relative flex size-7 items-center justify-center rounded-full text-xs font-semibold',
            'bg-[#F1F5F9] text-[#64748B]',
          )}>
            {index + 1}
            {isStreamingTip && (
              <motion.span
                aria-hidden
                className={cn('absolute -right-0.5 -top-0.5 size-2 rounded-full', theme.dot)}
                animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
            )}
          </span>
        </div>

        {/* Body */}
        <div className="min-w-0 flex-1 space-y-1.5">
          {/* Title row */}
          <div className="flex items-start justify-between gap-2">
            <textarea
              ref={titleRef}
              value={outline.title}
              onChange={(event) => onUpdate({ title: event.target.value })}
              placeholder="场景标题…"
              disabled={disabled}
              rows={1}
              spellCheck={false}
              className={cn(
                'flex-1 resize-none border-none bg-transparent p-0 text-base font-semibold leading-7 text-[#0F172A]',
                'placeholder:font-normal placeholder:text-[#CBD5E1] focus:outline-none focus:ring-0',
                disabled && 'cursor-default',
              )}
            />
            <div className="flex shrink-0 items-center gap-1 pt-0.5">
              <TypePill
                type={outline.type}
                onChange={(type) => onUpdate({ type })}
                disabled={disabled}
                theme={theme}
              />
              {!disabled && <DeleteSceneButton onConfirm={onRemove} />}
            </div>
          </div>

          {/* Description */}
          <textarea
            ref={descRef}
            value={outline.description}
            onChange={(event) => onUpdate({ description: event.target.value })}
            placeholder="场景描述…"
            disabled={disabled}
            rows={1}
            className={cn(
              'block w-full resize-none border-none bg-transparent p-0 text-sm leading-relaxed text-[#64748B]',
              'placeholder:text-[#CBD5E1] focus:outline-none focus:ring-0 focus:text-[#475569]',
              disabled && 'cursor-default',
            )}
          />

          {/* Key points */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <AnimatePresence initial={false}>
              {(outline.keyPoints ?? []).filter(Boolean).map((point, idx) => (
                <motion.span
                  key={`${outline.id}-kp-${idx}-${point}`}
                  layout
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.15 }}
                  className="group/chip inline-flex max-w-[18rem] items-center gap-1 rounded-full px-2.5 py-1 text-xs bg-[#F1F5F9] text-[#475569]"
                >
                  <span className="truncate">{point}</span>
                  {!disabled && (
                    <button
                      type="button"
                      onClick={() => removeKeyPoint(idx)}
                      className="ml-0.5 inline-flex size-3.5 shrink-0 items-center justify-center rounded-full text-transparent hover:bg-[#E2E8F0] hover:text-[#64748B] group-hover/chip:text-[#94A3B8] transition-colors"
                    >
                      <X className="size-2.5" />
                    </button>
                  )}
                </motion.span>
              ))}
            </AnimatePresence>
            {!disabled && (
              <KeyPointInput
                value={keyPointDraft}
                onChange={setKeyPointDraft}
                onKeyDown={handleKeyPointKeyDown}
              />
            )}
          </div>
        </div>
      </div>
    </motion.li>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────────────────────────

function EmptyState({ isStreaming, disabled, onAdd }: { isStreaming: boolean; disabled: boolean; onAdd: () => void }) {
  if (isStreaming) {
    return (
      <div className="flex min-h-[160px] flex-col items-center justify-center gap-3 py-10 text-center">
        <Loader2 className="size-5 animate-spin text-blue-500/70" />
        <p className="text-sm text-[#94A3B8]">正在生成场景大纲，请稍候…</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
      <p className="text-sm text-[#94A3B8]">暂无场景，点击添加</p>
      <Button variant="outline" onClick={onAdd} disabled={disabled} className="rounded-full">
        <Plus className="size-4 mr-1" />添加第一个场景
      </Button>
    </div>
  );
}

function TypePill({ type, onChange, disabled, theme }: {
  type: SceneType;
  onChange: (type: SceneType) => void;
  disabled: boolean;
  theme: (typeof TYPE_THEME)[SceneType];
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <button
          type="button"
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider transition-colors',
            theme.chip,
            !disabled && theme.chipHover,
            disabled && 'cursor-default',
          )}
        >
          {TYPE_LABELS[type]}
          {!disabled && <ChevronDown className="size-3 opacity-70" />}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[120px]">
        {SCENE_TYPES.map((option) => {
          const optionTheme = TYPE_THEME[option];
          return (
            <DropdownMenuItem
              key={option}
              onClick={() => onChange(option)}
              className="flex items-center justify-between gap-2"
            >
              <span className="flex items-center gap-2">
                <span className={cn('size-2 rounded-full', optionTheme.accent)} />
                {TYPE_LABELS[option]}
              </span>
              {option === type && <Check className="size-3.5 text-[#94A3B8]" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DeleteSceneButton({ onConfirm }: { onConfirm: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          title="删除场景"
          className={cn(
            'inline-flex size-7 items-center justify-center rounded-full text-[#CBD5E1] transition-all',
            'hover:bg-red-50 hover:text-red-500',
            'opacity-0 group-hover/scene:opacity-100 data-[state=open]:opacity-100',
            'focus-visible:opacity-100 focus-visible:outline-none',
          )}
        >
          <Trash2 className="size-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={4} className="w-52 p-3">
        <p className="text-sm font-medium text-[#0F172A]">确认删除此场景？</p>
        <p className="mt-1 text-xs text-[#94A3B8]">此操作无法撤销。</p>
        <div className="mt-3 flex justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)} className="h-7">取消</Button>
          <Button type="button" variant="destructive" size="sm" onClick={() => { onConfirm(); setOpen(false); }} className="h-7">删除</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function StreamingPlaceholder() {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ type: 'spring', stiffness: 360, damping: 32 }}
      className="relative flex items-start gap-2.5 px-3 py-3"
    >
      <div className="flex shrink-0 items-center gap-0.5 pt-1">
        <span className="size-7" />
        <span className="flex size-7 items-center justify-center rounded-full bg-blue-50 text-blue-500">
          <Loader2 className="size-3.5 animate-spin" />
        </span>
      </div>
      <div className="min-w-0 flex-1 space-y-2 pt-1.5">
        <motion.div
          animate={{ opacity: [0.35, 0.7, 0.35] }}
          transition={{ duration: 1.4, repeat: Infinity }}
          className="h-4 w-3/5 rounded-md bg-[#F1F5F9]"
        />
        <motion.div
          animate={{ opacity: [0.35, 0.7, 0.35] }}
          transition={{ duration: 1.4, repeat: Infinity, delay: 0.2 }}
          className="h-3 w-2/5 rounded bg-[#F1F5F9]"
        />
      </div>
    </motion.li>
  );
}

function InsertDivider({ onClick, disabled, position = 'between' }: {
  onClick: () => void;
  disabled: boolean;
  position?: 'between' | 'edge';
}) {
  const isEdge = position === 'edge';
  return (
    <li
      role="presentation"
      className="relative z-10 flex h-7 items-center justify-center px-3"
    >
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        title="在此处插入场景"
        className={cn(
          'group/insert relative flex h-full w-full items-center justify-center transition-opacity focus-visible:outline-none',
          isEdge ? 'opacity-25 hover:opacity-100' : 'opacity-0 hover:opacity-100',
          disabled && 'pointer-events-none opacity-20',
        )}
      >
        <span aria-hidden className={cn(
          'absolute top-1/2 h-px -translate-y-1/2 transition-colors',
          isEdge ? 'inset-x-16 bg-[#CBD5E1] group-hover/insert:bg-blue-400' : 'inset-x-8 bg-blue-200 group-hover/insert:bg-blue-400',
        )} />
        <span className={cn(
          'relative flex items-center justify-center rounded-full text-white transition-all',
          isEdge ? 'size-4 bg-[#94A3B8] group-hover/insert:size-5 group-hover/insert:bg-blue-500' : 'size-5 bg-blue-500 group-hover/insert:scale-110',
        )}>
          <Plus className={cn('transition-all', isEdge ? 'size-2.5' : 'size-3')} />
        </span>
      </button>
    </li>
  );
}

function KeyPointInput({ value, onChange, onKeyDown }: {
  value: string;
  onChange: (v: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
}) {
  const [width, setWidth] = useState(110);
  useEffect(() => { setWidth(Math.max(100, Math.min(260, value.length * 8 + 40))); }, [value]);

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      placeholder="添加知识点…"
      style={{ width }}
      className={cn(
        'inline-block rounded-full bg-transparent px-2.5 py-1 text-xs text-[#475569]',
        'placeholder:text-[#CBD5E1]',
        'border border-dashed border-transparent hover:border-[#E2E8F0] focus:border-blue-300 focus:bg-blue-50/30',
        'focus:outline-none focus:ring-0 transition-colors',
      )}
    />
  );
}
