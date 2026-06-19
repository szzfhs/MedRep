import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, BookOpen, Trash2, ChevronRight, Clock, FileText,
  CheckCircle, AlertCircle, Edit3, Rocket,
} from 'lucide-react';
import { getLessonPrepList, createLessonPrep, deleteLessonPrep, type LessonPrep } from '../../../api/lesson-prep';
import { Step1BasicInfo } from './prep/Step1BasicInfo';
import { Step2Outline } from './prep/Step2Outline';
import { Step3Resources } from './prep/Step3Resources';
import { Step4AIEditor } from './prep/Step4AIEditor';
import { Step5Publish } from './prep/Step5Publish';

const STEPS = [
  { step: 1, label: '基本信息', icon: FileText },
  { step: 2, label: '课程大纲', icon: BookOpen },
  { step: 3, label: '教学资源', icon: CheckCircle },
  { step: 4, label: 'AI辅助', icon: Edit3 },
  { step: 5, label: '发布确认', icon: Rocket },
];

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  '0': { label: '草稿', color: 'bg-[#F0F4F8] text-[#64748B]' },
  '1': { label: '待审核', color: 'bg-[#FEF3C7] text-[#B45309]' },
  '2': { label: '已发布', color: 'bg-[#E8F5E9] text-[#2E7D32]' },
};

interface WizardProps {
  prep: LessonPrep;
  onClose: () => void;
  onRefresh: () => void;
  onPublish?: () => void;
}

function PrepWizard({ prep, onClose, onRefresh, onPublish }: WizardProps) {
  const [currentStep, setCurrentStep] = useState(prep.currentStep ?? 1);
  const [prepData, setPrepData] = useState<LessonPrep>(prep);

  const handleStepDone = (updatedPrep?: LessonPrep) => {
    if (updatedPrep) setPrepData(updatedPrep);
    if (currentStep < 5) setCurrentStep(s => s + 1);
    onRefresh();
    // Step5 发布成功后，通知父组件刷新课程数据
    if (currentStep === 5) onPublish?.();
  };

  const stepProps = { prep: prepData, onDone: handleStepDone };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center overflow-y-auto py-6 px-4">
      <div className="w-full max-w-4xl bg-[#F0F4F8] rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-[#E2E8F0] px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-[#1A2332] font-bold text-lg">{prepData.prepName}</h2>
            <p className="text-[#64748B] text-xs mt-0.5">备课向导</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#F0F4F8] rounded-xl transition-colors text-[#94A3B8] hover:text-[#1A2332]">
            ✕
          </button>
        </div>

        {/* Step indicator */}
        <div className="bg-white border-b border-[#E2E8F0] px-6 py-3">
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => (
              <div key={s.step} className="flex items-center gap-2 flex-1">
                <button
                  onClick={() => setCurrentStep(s.step)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all flex-shrink-0 ${
                    currentStep === s.step
                      ? 'bg-[#00897B] text-white shadow-sm'
                      : s.step < currentStep
                      ? 'bg-[#E0F2F1] text-[#00695C]'
                      : 'bg-[#F0F4F8] text-[#94A3B8]'
                  }`}
                >
                  <s.icon size={12} />
                  {s.label}
                </button>
                {i < STEPS.length - 1 && (
                  <ChevronRight size={14} className="text-[#CBD5E1] flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {currentStep === 1 && <Step1BasicInfo {...stepProps} />}
              {currentStep === 2 && <Step2Outline {...stepProps} />}
              {currentStep === 3 && <Step3Resources {...stepProps} />}
              {currentStep === 4 && <Step4AIEditor {...stepProps} />}
              {currentStep === 5 && <Step5Publish {...stepProps} onClose={onClose} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export function LessonPrepManager({ onPublish }: { onPublish?: () => void } = {}) {
  const [preps, setPreps] = useState<LessonPrep[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newPrepName, setNewPrepName] = useState('');
  const [activePrepId, setActivePrepId] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadPreps = () => {
    setLoading(true);
    getLessonPrepList()
      .then(setPreps)
      .catch(() => setPreps([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadPreps(); }, []);

  const handleCreate = async () => {
    const name = newPrepName.trim();
    if (!name) return;
    setCreating(true);
    try {
      const { prepId } = await createLessonPrep(name);
      setNewPrepName('');
      setShowCreateModal(false);
      await loadPreps();
      setActivePrepId(prepId);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (prepId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('确定删除此备课草稿？')) return;
    await deleteLessonPrep(prepId);
    loadPreps();
  };

  const activePrepData = preps.find(p => p.prepId === activePrepId);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[#1A2332] font-semibold">备课管理</h3>
          <p className="text-[#64748B] text-xs mt-0.5">通过备课向导创建和管理课程，支持 AI 辅助生成教学内容</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#00897B] text-white rounded-xl text-sm font-medium hover:bg-[#00796B] transition-colors shadow-sm"
        >
          <Plus size={16} /> 新建备课
        </button>
      </div>

      {/* Create modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-40 bg-black/30 flex items-center justify-center px-4"
          >
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
              <h4 className="text-[#1A2332] font-semibold mb-4">新建备课草稿</h4>
              <input
                autoFocus
                value={newPrepName}
                onChange={e => setNewPrepName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                placeholder="请输入备课名称，例如：心肌梗死介入治疗"
                className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#00897B] mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowCreateModal(false); setNewPrepName(''); }}
                  className="flex-1 py-2.5 border border-[#E2E8F0] text-[#64748B] rounded-xl text-sm"
                >
                  取消
                </button>
                <button
                  onClick={handleCreate}
                  disabled={creating || !newPrepName.trim()}
                  className="flex-1 py-2.5 bg-[#00897B] text-white rounded-xl text-sm font-medium disabled:opacity-60"
                >
                  {creating ? '创建中…' : '开始备课'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Prep list */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-10 text-center text-[#94A3B8] text-sm">
          加载中…
        </div>
      ) : preps.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 text-center">
          <BookOpen size={40} className="text-[#CBD5E1] mx-auto mb-4" />
          <h4 className="text-[#1A2332] font-semibold mb-2">还没有备课草稿</h4>
          <p className="text-[#94A3B8] text-sm mb-4">点击「新建备课」开始创建您的第一个课程</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 bg-[#00897B] text-white rounded-xl text-sm font-medium"
          >
            <Plus size={14} className="inline mr-1.5" /> 新建备课
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {preps.map(prep => {
            const status = STATUS_MAP[prep.status] ?? STATUS_MAP['0'];
            const isPublished = prep.status === '2';
            const stepsDone = isPublished ? STEPS.length : prep.currentStep - 1;
            return (
              <div
                key={prep.prepId}
                onClick={() => setActivePrepId(prep.prepId)}
                className="bg-white rounded-2xl border border-[#E2E8F0] p-5 cursor-pointer hover:shadow-md hover:border-[#00897B]/30 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 pr-2">
                    <h4 className="text-[#1A2332] font-semibold text-sm truncate">{prep.prepName}</h4>
                    <p className="text-[#94A3B8] text-xs mt-0.5">
                      <Clock size={10} className="inline mr-1" />
                      {prep.updateTime?.slice(0, 10) ?? '—'}
                    </p>
                  </div>
                  <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                    {status.label}
                  </span>
                </div>

                {/* Step progress */}
                <div className="flex items-center gap-1 mb-4">
                  {STEPS.map(s => (
                    <div
                      key={s.step}
                      className={`flex-1 h-1.5 rounded-full ${s.step <= stepsDone ? 'bg-[#00897B]' : 'bg-[#E2E8F0]'}`}
                    />
                  ))}
                </div>
                <p className="text-[#64748B] text-xs mb-4">
                  进度：{stepsDone}/{STEPS.length} 步 · 当前步骤：{isPublished ? '已发布' : STEPS.find(s => s.step === prep.currentStep)?.label ?? '完成'}
                </p>

                <div className="flex gap-2">
                  {isPublished && prep.courseId ? (
                    <a
                      href={`/courses/${prep.courseId}`}
                      onClick={e => e.stopPropagation()}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#E0F2F1] text-[#00695C] rounded-xl text-xs font-medium hover:bg-[#00897B] hover:text-white transition-colors"
                    >
                      <BookOpen size={12} /> 查看课程
                    </a>
                  ) : (
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#E0F2F1] text-[#00695C] rounded-xl text-xs font-medium group-hover:bg-[#00897B] group-hover:text-white transition-colors">
                      <Edit3 size={12} /> 继续备课
                    </button>
                  )}
                  <button
                    onClick={e => handleDelete(prep.prepId, e)}
                    className="p-2 border border-[#E2E8F0] text-[#94A3B8] rounded-xl hover:bg-[#FFF5F5] hover:text-[#E53935] hover:border-[#FECACA] transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Wizard modal */}
      {activePrepData && (
        <PrepWizard
          prep={activePrepData}
          onClose={() => setActivePrepId(null)}
          onRefresh={loadPreps}
          onPublish={onPublish}
        />
      )}
    </div>
  );
}
