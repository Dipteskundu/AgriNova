import React, { useState, useEffect, useMemo } from 'react';
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

export const CropCalendar: React.FC = () => {
  const { showToast } = useToast();
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
        showToast('error', 'Failed to load agricultural calendar tasks');
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
        showToast('success', 'Task status updated');
      }
    } catch {
      showToast('error', 'Could not update task');
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
        showToast('success', 'New calendar event added');
      }
    } catch {
      showToast('error', 'Failed to add calendar task');
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
          <h2 className="text-lg font-bold text-slate-900">Agricultural Crop Calendar</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Sowing, fertilizer top-dressing, irrigation windows, pest control sprays, and harvest schedules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none"
          >
            <option value="All">All Events ({tasks.length})</option>
            <option value="Pending">Pending Only</option>
            <option value="Completed">Completed Only</option>
            <option value="Irrigation">Irrigation</option>
            <option value="Fertilization">Fertilization</option>
            <option value="Harvest">Harvest Windows</option>
          </select>

          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setIsAddModalOpen(true)}
          >
            Schedule Event
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
                aria-label="Toggle task"
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
                    {task.taskType}
                  </span>
                  <span className="text-[11px] font-medium text-slate-500">{task.scheduledDate}</span>
                </div>

                <h4
                  className={`text-sm font-bold leading-snug ${
                    task.isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                  }`}
                >
                  {task.taskTitle}
                </h4>

                <p className="text-xs text-slate-500 mt-1">
                  {task.cropName} • <span className="text-slate-700">{task.fieldName}</span>
                </p>

                {task.notes && (
                  <p className="text-xs text-slate-600 mt-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                    {task.notes}
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
                {task.priority}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Task Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Schedule Agricultural Event / Task"
        subtitle="Add a target operation to the crop calendar"
        maxWidth="lg"
      >
        <form onSubmit={handleAddTask} className="space-y-4">
          <FormSelect
            id="batchTarget"
            label="Target Crop Batch"
            value={newTask.cropBatchId}
            onChange={(e) => setNewTask({ ...newTask, cropBatchId: e.target.value })}
            options={cropBatches.map((b) => ({
              value: b.id,
              label: `${b.cropName} - ${b.fieldName}`,
            }))}
          />

          <FormInput
            id="taskTitle"
            label="Event / Task Title"
            placeholder="e.g. Third Urea Top-Dress & Soil Mound Reshaping"
            value={newTask.taskTitle}
            onChange={(e) => setNewTask({ ...newTask, taskTitle: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <FormSelect
              id="taskType"
              label="Operation Type"
              value={newTask.taskType}
              onChange={(e) =>
                setNewTask({ ...newTask, taskType: e.target.value as CalendarTask['taskType'] })
              }
              options={[
                { value: 'Irrigation', label: 'Irrigation' },
                { value: 'Fertilization', label: 'Fertilization' },
                { value: 'Pest Control', label: 'Pest Control / Spray' },
                { value: 'Scouting', label: 'Field Scouting / Monitoring' },
                { value: 'Sowing', label: 'Sowing / Seedling Transplant' },
                { value: 'Harvest', label: 'Harvest Window' },
              ]}
            />

            <FormSelect
              id="priority"
              label="Priority Level"
              value={newTask.priority}
              onChange={(e) =>
                setNewTask({ ...newTask, priority: e.target.value as CalendarTask['priority'] })
              }
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'urgent', label: 'Urgent' },
              ]}
            />
          </div>

          <FormInput
            id="scheduledDate"
            label="Scheduled Date"
            type="date"
            value={newTask.scheduledDate}
            onChange={(e) => setNewTask({ ...newTask, scheduledDate: e.target.value })}
            required
          />

          <FormTextarea
            id="notes"
            label="Field Notes & Preparations"
            placeholder="e.g. Ensure spray nozzles are cleaned; test moisture beforehand"
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
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Schedule Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
