import React, { useState, useEffect, useMemo } from 'react';
import { tr } from "@/agriplatform/lib/localize";
import {
  Calendar as CalendarIcon,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Tag,
  Filter,
} from '@/components/icons';
import { Card, CardHeader } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import { Button } from '@/components/shared/Button';
import { Modal } from '@/components/shared/Modal';
import { FormInput, FormSelect, FormTextarea } from '@/components/shared/FormInput';
import { Skeleton } from '@/components/shared/Skeleton';
import { useToast } from '@/components/shared/Toast';
import { getCalendarTasks, getCropBatches, toggleCalendarTask, addCalendarTask } from '@/agriplatform/lib/farmerApi';
import { CalendarTask, CropBatch } from '@/agriplatform/types';
import { useLanguage } from '@/agriplatform/lib/LanguageContext';

export const CropCalendar: React.FC = () => {
  const { showToast } = useToast();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<CalendarTask[]>([]);
  const [cropBatches, setCropBatches] = useState<CropBatch[]>([]);
  const [filterType, setFilterType] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    cropBatchId: '',
    taskTitle: '',
    taskType: 'Irrigation' as CalendarTask['taskType'],
    scheduledDate: new Date().toISOString().split('T')[0],
    priority: 'medium' as CalendarTask['priority'],
    notes: '',
  });

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [tasksRes, batchesRes] = await Promise.all([
          getCalendarTasks(),
          getCropBatches(),
        ]);
        if (tasksRes.success && batchesRes.success) {
          setTasks(tasksRes.data);
          setCropBatches(batchesRes.data);
          if (batchesRes.data.length > 0) {
            setNewTask((prev) => ({ ...prev, cropBatchId: batchesRes.data[0].id }));
          }
        }
      } catch {
        showToast('error', tr('Failed to load agricultural calendar tasks'));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [showToast]);

  const handleToggle = async (id: string) => {
    try {
      const res = await toggleCalendarTask(id);
      if (res.success) {
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? { ...t, isCompleted: !t.isCompleted } : t))
        );
        showToast('success', tr('Task status updated'));
      }
    } catch {
      showToast('error', tr('Could not update task'));
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const batch = cropBatches.find((b) => b.id === newTask.cropBatchId);
    try {
      const res = await addCalendarTask({
        cropBatchId: newTask.cropBatchId,
        cropName: batch?.cropName || 'Field Crop',
        fieldName: batch?.fieldName || 'Plot A1',
        taskTitle: newTask.taskTitle,
        taskType: newTask.taskType,
        scheduledDate: newTask.scheduledDate,
        priority: newTask.priority,
        notes: newTask.notes,
      });
      if (res.success) {
        setTasks([...tasks, res.data]);
        setIsAddModalOpen(false);
        setNewTask({
          cropBatchId: cropBatches[0]?.id || '',
          taskTitle: '',
          taskType: 'Irrigation',
          scheduledDate: new Date().toISOString().split('T')[0],
          priority: 'medium',
          notes: '',
        });
        showToast('success', tr('New calendar event added'));
      }
    } catch {
      showToast('error', tr('Failed to add calendar task'));
    }
  };

  const filteredTasks = useMemo(() => {
    if (filterType === 'All') return tasks;
    if (filterType === 'Pending') return tasks.filter((t) => !t.isCompleted);
    if (filterType === 'Completed') return tasks.filter((t) => t.isCompleted);
    return tasks.filter((t) => t.taskType === filterType);
  }, [tasks, filterType]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-64 bg-white rounded-xl border border-slate-200 p-5">
          <Skeleton className="h-6 w-1/3 mb-3" />
          <Skeleton className="h-44 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            {language === 'bn' ? 'ফসলের সময়সূচি ও কাজের ক্যালেন্ডার' : 'Agricultural Crop Calendar'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'bn'
              ? 'সার প্রয়োগ, সেচ প্রদান, কীটনাশক স্প্রে ও ফসল কাটার সঠিক সময়সূচি ও পরিকল্পনা।'
              : 'Sowing, fertilizer top-dressing, irrigation windows, pest control sprays, and harvest schedules.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none"
          >
            <option value="All">{language === 'bn' ? `সকল কাজ (${tasks.length})` : `All Events (${tasks.length})`}</option>
            <option value="Pending">{language === 'bn' ? 'বাকি কাজ' : 'Pending Only'}</option>
            <option value="Completed">{language === 'bn' ? 'সম্পন্ন কাজ' : 'Completed Only'}</option>
            <option value="Irrigation">{language === 'bn' ? 'সেচ প্রদান' : 'Irrigation'}</option>
            <option value="Fertilization">{language === 'bn' ? 'সার প্রয়োগ' : 'Fertilization'}</option>
            <option value="Harvest">{language === 'bn' ? 'ফসল তোলা' : 'Harvest Windows'}</option>
          </select>

          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setIsAddModalOpen(true)}
          >
            {language === 'bn' ? '+ নতুন কাজ যোগ করুন' : 'Schedule Event'}
          </Button>
        </div>
      </div>

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-3 bg-white ${
              task.isCompleted
                ? 'border-slate-200 opacity-60 bg-slate-50/50'
                : 'border-slate-200/80 hover:border-emerald-300 shadow-xs'
            }`}
          >
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <button
                onClick={() => handleToggle(task.id)}
                className={`mt-1 p-1 rounded-full border transition-colors cursor-pointer ${
                  task.isCompleted
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'border-slate-300 text-transparent hover:border-emerald-500'
                }`}
                aria-label={tr('Toggle task')}
              >
                <CheckCircle2 className="w-4 h-4" />
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                      task.taskType === 'Harvest'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : task.taskType === 'Irrigation'
                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                        : task.taskType === 'Fertilization'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {language === 'bn'
                      ? task.taskType === 'Irrigation' ? 'সেচ'
                        : task.taskType === 'Fertilization' ? 'সার প্রয়োগ'
                        : task.taskType === 'Pest Control' ? 'কীটনাশক'
                        : task.taskType === 'Scouting' ? 'পরিদর্শন'
                        : task.taskType === 'Sowing' ? 'রোপণ'
                        : task.taskType === 'Harvest' ? 'ফসল কর্তন'
                        : task.taskType
                      : task.taskType}
                  </span>
                  <span className="text-[11px] font-medium text-slate-500">{task.scheduledDate}</span>
                </div>

                <h4
                  className={`text-sm font-bold leading-snug ${
                    task.isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                  }`}
                >
                  {tr(task.taskTitle)}
                </h4>

                <p className="text-xs text-slate-500 mt-1">
                  {tr(task.cropName)}{tr('•')}<span className="text-slate-700">{tr(task.fieldName)}</span>
                </p>

                {task.notes && (
                  <p className="text-xs text-slate-600 mt-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                    {tr(task.notes)}
                  </p>
                )}
              </div>
            </div>

            <div className="text-right shrink-0">
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                  task.priority === 'urgent'
                    ? 'bg-rose-100 text-rose-700'
                    : task.priority === 'high'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {language === 'bn'
                  ? task.priority === 'urgent' ? 'জরুরি'
                    : task.priority === 'high' ? 'উচ্চ অগ্রাধিকার'
                    : task.priority === 'medium' ? 'সাধারণ'
                    : 'নিম্ন'
                  : task.priority}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Task Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={language === 'bn' ? 'নতুন কৃষি কাজের সময়সূচি তৈরি' : 'Schedule Agricultural Event / Task'}
        subtitle={language === 'bn' ? 'ফসলের ক্যালেন্ডারে নির্দিষ্ট কাজের তারিখ যুক্ত করুন' : 'Add a target operation to the crop calendar'}
        maxWidth="lg"
      >
        <form onSubmit={handleAddTask} className="space-y-4">
          <FormSelect
            id="batchTarget"
            label={language === 'bn' ? 'নির্দিষ্ট ফসল ও জমি' : 'Target Crop Batch'}
            value={newTask.cropBatchId}
            onChange={(e) => setNewTask({ ...newTask, cropBatchId: e.target.value })}
            options={cropBatches.map((b) => ({
              value: b.id,
              label: `${tr(b.cropName)} - ${tr(b.fieldName)}`,
            }))}
          />

          <FormInput
            id="taskTitle"
            label={language === 'bn' ? 'কাজের শিরোনাম / বিবরণ' : 'Event / Task Title'}
            placeholder={language === 'bn' ? 'যেমন: দ্বিতীয় দফায় ইউরিয়া সার প্রয়োগ ও সেচ' : 'e.g. Third Urea Top-Dress & Soil Mound Reshaping'}
            value={newTask.taskTitle}
            onChange={(e) => setNewTask({ ...newTask, taskTitle: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <FormSelect
              id="taskType"
              label={language === 'bn' ? 'কাজের ধরন' : 'Operation Type'}
              value={newTask.taskType}
              onChange={(e) =>
                setNewTask({ ...newTask, taskType: e.target.value as CalendarTask['taskType'] })
              }
              options={[
                { value: 'Irrigation', label: language === 'bn' ? 'সেচ প্রদান' : 'Irrigation' },
                { value: 'Fertilization', label: language === 'bn' ? 'সার প্রয়োগ' : 'Fertilization' },
                { value: 'Pest Control', label: language === 'bn' ? 'কীটনাশক / ছত্রাকনাশক স্প্রে' : 'Pest Control / Spray' },
                { value: 'Scouting', label: language === 'bn' ? 'ক্ষেত পরিদর্শন ও পর্যবেক্ষণ' : 'Field Scouting / Monitoring' },
                { value: 'Sowing', label: language === 'bn' ? 'চারা রোপণ / বীজ বপন' : 'Sowing / Seedling Transplant' },
                { value: 'Harvest', label: language === 'bn' ? 'ফসল কর্তন ও মাড়াই' : 'Harvest Window' },
              ]}
            />

            <FormSelect
              id="priority"
              label={language === 'bn' ? 'গুরুত্ব / অগ্রাধিকার' : 'Priority Level'}
              value={newTask.priority}
              onChange={(e) =>
                setNewTask({ ...newTask, priority: e.target.value as CalendarTask['priority'] })
              }
              options={[
                { value: 'low', label: language === 'bn' ? 'নিম্ন' : 'Low' },
                { value: 'medium', label: language === 'bn' ? 'সাধারণ' : 'Medium' },
                { value: 'high', label: language === 'bn' ? 'উচ্চ' : 'High' },
                { value: 'urgent', label: language === 'bn' ? 'জরুরি' : 'Urgent' },
              ]}
            />
          </div>

          <FormInput
            id="scheduledDate"
            label={language === 'bn' ? 'নির্ধারিত তারিখ' : 'Scheduled Date'}
            type="date"
            value={newTask.scheduledDate}
            onChange={(e) => setNewTask({ ...newTask, scheduledDate: e.target.value })}
            required
          />

          <FormTextarea
            id="notes"
            label={language === 'bn' ? 'বিশেষ সতর্কতা বা নোট' : 'Field Notes & Preparations'}
            placeholder={language === 'bn' ? 'যেমন: স্প্রে করার আগে নোজল পরিষ্কার করুন; সকালে রোদ ওঠার আগে দিন' : 'e.g. Ensure spray nozzles are cleaned; test moisture beforehand'}
            value={newTask.notes}
            onChange={(e) => setNewTask({ ...newTask, notes: e.target.value })}
            rows={2}
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
            >
              {language === 'bn' ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button type="submit" variant="primary" size="sm">
              {language === 'bn' ? 'ক্যালেন্ডারে সংরক্ষণ করুন' : 'Schedule Task'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
