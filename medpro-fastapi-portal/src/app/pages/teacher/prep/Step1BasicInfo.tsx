import { useState } from 'react';
import { Save, Sparkles } from 'lucide-react';
import { saveLessonPrepStep, type LessonPrep } from '../../../../api/lesson-prep';

interface Props {
  prep: LessonPrep;
  onDone: (updated?: LessonPrep) => void;
}

export function Step1BasicInfo({ prep, onDone }: Props) {
  const initial = prep.basicInfoJson ? JSON.parse(prep.basicInfoJson) : {};
  const [form, setForm] = useState({
    courseName: initial.courseName ?? prep.prepName ?? '',
    courseCategory: initial.courseCategory ?? '1',
    totalHours: initial.totalHours ?? 32,
    description: initial.description ?? '',
    learningOutcomes: (initial.learningOutcomes ?? ['']).join('\n'),
    certificateInfo: initial.certificateInfo ?? '',
    publishDate: initial.publishDate ?? '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = {
        ...form,
        totalHours: Number(form.totalHours),
        learningOutcomes: form.learningOutcomes.split('\n').filter(Boolean),
      };
      await saveLessonPrepStep(prep.prepId, 1, data);
      onDone({ ...prep, basicInfoJson: JSON.stringify(data), currentStep: Math.max(prep.currentStep, 2) });
    } finally {
      setSaving(false);
    }
  };

  const set = (key: string, val: string | number) => setForm(f => ({ ...f, [key]: val }));

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 space-y-5">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles size={16} className="text-[#00897B]" />
        <h3 className="text-[#1A2332] font-semibold">步骤 1 · 课程基本信息</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <label className="block text-[#475569] text-sm font-medium mb-1.5">课程名称 *</label>
          <input
            value={form.courseName}
            onChange={e => set('courseName', e.target.value)}
            placeholder="例如：心血管介入治疗虚拟仿真实验课程"
            className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#00897B]"
          />
        </div>

        <div>
          <label className="block text-[#475569] text-sm font-medium mb-1.5">课程类别</label>
          <select
            value={form.courseCategory}
            onChange={e => set('courseCategory', e.target.value)}
            className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#00897B]"
          >
            <option value="1">理论课</option>
            <option value="2">实验课</option>
            <option value="3">综合课</option>
          </select>
        </div>

        <div>
          <label className="block text-[#475569] text-sm font-medium mb-1.5">总学时</label>
          <input
            type="number"
            value={form.totalHours}
            onChange={e => set('totalHours', e.target.value)}
            min={1}
            className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#00897B]"
          />
        </div>

        <div>
          <label className="block text-[#475569] text-sm font-medium mb-1.5">预计开课时间</label>
          <input
            type="date"
            value={form.publishDate}
            onChange={e => set('publishDate', e.target.value)}
            className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#00897B]"
          />
        </div>

        <div>
          <label className="block text-[#475569] text-sm font-medium mb-1.5">证书信息</label>
          <input
            value={form.certificateInfo}
            onChange={e => set('certificateInfo', e.target.value)}
            placeholder="例如：完成课程可获得结业证书"
            className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#00897B]"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-[#475569] text-sm font-medium mb-1.5">课程简介</label>
          <textarea
            value={form.description}
            onChange={e => set('description', e.target.value)}
            rows={3}
            placeholder="简要介绍课程内容、教学目标和适用对象..."
            className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#00897B] resize-none"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-[#475569] text-sm font-medium mb-1.5">学习收获（每行一条）</label>
          <textarea
            value={form.learningOutcomes}
            onChange={e => set('learningOutcomes', e.target.value)}
            rows={4}
            placeholder="掌握冠脉造影基本操作步骤&#10;了解介入治疗并发症处理&#10;培养临床思维能力"
            className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#00897B] resize-none font-mono"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving || !form.courseName.trim()}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#00897B] text-white rounded-xl text-sm font-medium hover:bg-[#00796B] disabled:opacity-60 transition-colors"
        >
          <Save size={14} /> {saving ? '保存中…' : '保存并继续'}
        </button>
      </div>
    </div>
  );
}
