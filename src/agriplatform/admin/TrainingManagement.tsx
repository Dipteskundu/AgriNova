import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Plus,
  Users,
  Award,
  Clock,
  BookOpen,
  CheckCircle2,
  Star,
  Layers,
} from '@/components/icons';
import { Card, CardHeader } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import { Button } from '@/components/shared/Button';
import { Modal } from '@/components/shared/Modal';
import { FormInput, FormSelect } from '@/components/shared/FormInput';
import { Skeleton } from '@/components/shared/Skeleton';
import { useToast } from '@/components/shared/Toast';
import { getAdminTrainingCourses, createAdminTrainingCourse } from '@/agriplatform/lib/adminApi';
import { TrainingManagementAdminView } from '@/agriplatform/types';

export const TrainingManagement: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<TrainingManagementAdminView[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({
    courseTitle: '',
    targetRegion: 'All Bangladesh Agro-Ecological Zones',
    instructorAssigned: 'Dr. Shahinur Alam (BARI)',
    status: 'Published' as TrainingManagementAdminView['status'],
  });

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await getAdminTrainingCourses();
        if (res.success) {
          setCourses(res.data);
        }
      } catch {
        showToast('error', 'Failed to load administrative training catalog');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [showToast]);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await createAdminTrainingCourse({
        courseTitle: newCourse.courseTitle,
        targetRegion: newCourse.targetRegion,
        instructorAssigned: newCourse.instructorAssigned,
        status: newCourse.status,
      });
      if (res.success) {
        setCourses([res.data, ...courses]);
        setIsAddModalOpen(false);
        setNewCourse({
          courseTitle: '',
          targetRegion: 'All Bangladesh Agro-Ecological Zones',
          instructorAssigned: 'Dr. Shahinur Alam (BARI)',
          status: 'Published',
        });
        showToast('success', 'New extension curriculum published');
      }
    } catch {
      showToast('error', 'Failed to publish training course');
    }
  };

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
          <h2 className="text-lg font-bold text-slate-900">Training Course Curriculum Oversight</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Oversee vocational agricultural masterclasses, regional participation, and certification pass rates.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => setIsAddModalOpen(true)}
        >
          Create New Course Curriculum
        </Button>
      </div>

      {/* Grid of Admin Courses */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course.id} className="flex flex-col justify-between hover:border-slate-300 transition-all">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <Badge
                  variant={
                    course.status === 'Published'
                      ? 'success'
                      : course.status === 'Draft'
                      ? 'warning'
                      : 'neutral'
                  }
                >
                  {course.status}
                </Badge>
                <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{course.feedbackScore.toFixed(1)}</span>
                </div>
              </div>

              <h3 className="text-sm font-bold text-slate-900 leading-snug mb-1">
                {course.courseTitle}
              </h3>
              <p className="text-[11px] text-slate-500 mb-3">
                Lead Agronomist: <span className="font-semibold text-slate-700">{course.instructorAssigned}</span>
              </p>

              {/* Participation Stats */}
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs mt-2">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Enrolled Farmers</span>
                  <span className="font-extrabold text-sm text-slate-900">
                    {course.enrolledCount.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Completion Rate</span>
                  <span className="font-bold text-emerald-700">{course.completionRatePercent}%</span>
                </div>
              </div>

              <div className="mt-3 text-xs text-slate-600">
                <span className="text-[11px] text-slate-400 block">Target Region</span>
                <span className="font-medium text-slate-800">{course.targetRegion}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Updated: {course.lastUpdated}</span>
              <span className="font-mono">ID: {course.id}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Course Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Publish Extension Course Curriculum"
        subtitle="Set up instructor assignment and regional enrollment targets"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateCourse} className="space-y-4">
          <FormInput
            id="courseTitle"
            label="Curriculum Title"
            placeholder="e.g. Modern Alternate Wetting and Drying (AWD) Irrigation Protocol"
            value={newCourse.courseTitle}
            onChange={(e) => setNewCourse({ ...newCourse, courseTitle: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <FormInput
              id="instructor"
              label="Assigned Lead Instructor"
              placeholder="e.g. Dr. Shahinur Alam (BARI)"
              value={newCourse.instructorAssigned}
              onChange={(e) =>
                setNewCourse({ ...newCourse, instructorAssigned: e.target.value })
              }
              required
            />

            <FormSelect
              id="status"
              label="Publication Status"
              value={newCourse.status}
              onChange={(e) =>
                setNewCourse({
                  ...newCourse,
                  status: e.target.value as TrainingManagementAdminView['status'],
                })
              }
              options={[
                { value: 'Published', label: 'Published (Open Enrollment)' },
                { value: 'Draft', label: 'Draft (Under Review)' },
                { value: 'Archived', label: 'Archived' },
              ]}
            />
          </div>

          <FormInput
            id="targetRegion"
            label="Target Agro-Ecological Region"
            placeholder="e.g. Barind Tract & Drought-Prone Northwest"
            value={newCourse.targetRegion}
            onChange={(e) => setNewCourse({ ...newCourse, targetRegion: e.target.value })}
            required
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
              Publish Curriculum
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
