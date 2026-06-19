import { useState } from 'react';
import { Rocket, CheckCircle, XCircle, BookOpen, FileText, Package, Sparkles } from 'lucide-react';
import { publishLessonPrep, type LessonPrep } from '../../../../api/lesson-prep';

interface Props {
  prep: LessonPrep;
  onDone: (updated?: LessonPrep) => void;
  onClose: () => void;
}

export function Step5Publish({ prep, onDone, onClose }: Props) {
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(!!prep.courseId);
  const [error, setError] = useState('');
  const [courseId, setCourseId] = useState<number | undefined>(prep.courseId ?? undefined);

  const basicInfo = prep.basicInfoJson ? JSON.parse(prep.basicInfoJson) : null;
  const outline: any[] = prep.outlineJson ? JSON.parse(prep.outlineJson) : [];
  const resourceConfig: any[] = prep.resourceConfigJson ? JSON.parse(prep.resourceConfigJson) : [];

  const chapterCount = outline.length;
  const sectionCount = outline.reduce((s: number, ch: any) => s + (ch.children?.length ?? 0), 0);
  const resourceCount = resourceConfig.reduce((s: number, c: any) => s + (c.resources?.length ?? 0), 0);

  const validations: Array<{ label: string; ok: boolean; message?: string }> = [
    { label: '基本信息', ok: !!basicInfo?.courseName, message: '请完成步骤1填写课程名称' },
    { label: '课程大纲', ok: chapterCount > 0, message: '请完成步骤2添加至少一个章节' },
    { label: '教学资源', ok: true, message: undefined },
  ];

  const canPublish = validations.every(v => v.ok);

  const handlePublish = async () => {
    if (!canPublish) return;
    setPublishing(true);
    setError('');
    try {
      const result = await publishLessonPrep(prep.prepId);
      const newCourseId = (result as any)?.courseId ?? (result as any)?.data?.courseId;
      setCourseId(newCourseId);
      setPublished(true);
      onDone({ ...prep, status: '2', courseId: newCourseId });
    } catch (e: any) {
      setError(e?.message ?? '发布失败，请稍后重试');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Rocket size={16} className="text-[#00897B]" />
        <h3 className="text-[#1A2332] font-semibold">步骤 5 · 发布确认</h3>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#F0F4F8] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText size={14} className="text-[#00897B]" />
            <span className="text-xs font-medium text-[#64748B]">课程基本信息</span>
          </div>
          {basicInfo ? (
            <>
              <p className="text-[#1A2332] font-semibold text-sm truncate">{basicInfo.courseName}</p>
              <p className="text-[#94A3B8] text-xs mt-1">{basicInfo.totalHours} 学时 · {['', '理论课', '实验课', '综合课'][basicInfo.courseCategory] ?? '—'}</p>
            </>
          ) : (
            <p className="text-[#E53935] text-xs">未填写</p>
          )}
        </div>

        <div className="bg-[#F0F4F8] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen size={14} className="text-[#00897B]" />
            <span className="text-xs font-medium text-[#64748B]">课程大纲</span>
          </div>
          <p className="text-[#1A2332] font-semibold text-sm">{chapterCount} 章 · {sectionCount} 节</p>
          <p className="text-[#94A3B8] text-xs mt-1">
            {chapterCount > 0 ? outline.map((c: any) => c.title).slice(0, 2).join('、') + (chapterCount > 2 ? '…' : '') : '暂无'}
          </p>
        </div>

        <div className="bg-[#F0F4F8] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Package size={14} className="text-[#00897B]" />
            <span className="text-xs font-medium text-[#64748B]">教学资源</span>
          </div>
          <p className="text-[#1A2332] font-semibold text-sm">{resourceCount} 个</p>
          <p className="text-[#94A3B8] text-xs mt-1">已配置章节资源</p>
        </div>
      </div>

      {/* Validation checklist */}
      <div className="border border-[#E2E8F0] rounded-xl p-4 space-y-3">
        <h4 className="text-[#475569] text-xs font-medium">发布前检查</h4>
        {validations.map(v => (
          <div key={v.label} className="flex items-center gap-3">
            {v.ok
              ? <CheckCircle size={16} className="text-[#43A047] flex-shrink-0" />
              : <XCircle size={16} className="text-[#E53935] flex-shrink-0" />}
            <span className={`text-sm ${v.ok ? 'text-[#1A2332]' : 'text-[#E53935]'}`}>{v.label}</span>
            {!v.ok && <span className="text-xs text-[#E53935]">— {v.message}</span>}
          </div>
        ))}
      </div>

      {/* Published state */}
      {published && (
        <div className="bg-[#E8F5E9] border border-[#A5D6A7] rounded-xl p-4 flex items-start gap-3">
          <CheckCircle size={18} className="text-[#2E7D32] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[#1B5E20] font-semibold text-sm">课程已成功发布！</p>
            {courseId && <p className="text-[#2E7D32] text-xs mt-1">课程ID：{courseId}</p>}
            <p className="text-[#43A047] text-xs mt-1">学生可以在学习中心找到此课程</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-[#FFF5F5] border border-[#FECACA] rounded-xl p-4 text-[#E53935] text-sm">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-[#94A3B8] text-xs">发布后将创建正式课程，并通知已选课的学生</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-[#E2E8F0] text-[#64748B] rounded-xl text-sm hover:bg-[#F0F4F8] transition-colors"
          >
            关闭
          </button>
          {!published && (
            <button
              onClick={handlePublish}
              disabled={publishing || !canPublish}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#00897B] text-white rounded-xl text-sm font-medium hover:bg-[#00796B] disabled:opacity-60 transition-colors shadow-sm"
            >
              <Rocket size={14} /> {publishing ? '发布中…' : '立即发布'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
