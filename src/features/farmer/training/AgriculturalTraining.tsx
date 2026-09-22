import React, { useState, useEffect } from 'react';
import { tr } from "@/lib/localize";
import { useLanguage } from '@/contexts/LanguageContext';
import {
  GraduationCap,
  PlayCircle,
  CheckCircle,
  Clock,
  Star,
  Award,
  BookOpen,
  Filter,
  UserCheck,
} from '@/components/icons';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { getTrainingCourses } from '@/lib/farmerApi';
import { TrainingCourse } from '@/types';

export const AgriculturalTraining: React.FC = () => {
  const { showToast } = useToast();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<TrainingCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<TrainingCourse | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('All');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await getTrainingCourses();
        if (res.success) {
          setCourses(res.data);
        }
      } catch {
        showToast('error', tr('Failed to load agricultural training catalog'));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [showToast]);

  const handleStartLesson = (course: TrainingCourse) => {
    setSelectedCourse(course);
  };

  const handleCompleteLesson = (lessonIdx: number) => {
    if (!selectedCourse) return;
    const updatedSyllabus = selectedCourse.syllabus.map((s, idx) =>
      idx === lessonIdx ? { ...s, completed: true } : s
    );
    const newCompletedCount = updatedSyllabus.filter((s) => s.completed).length;
    const updatedCourse: TrainingCourse = {
      ...selectedCourse,
      syllabus: updatedSyllabus,
      completedLessonsCount: newCompletedCount,
    };
    setSelectedCourse(updatedCourse);
    setCourses((prev) =>
      prev.map((c) => (c.id === updatedCourse.id ? updatedCourse : c))
    );
    showToast('success', tr('Lesson progress recorded! Knowledge badge updated.'));
  };

  const filteredCourses =
    filterCategory === 'All'
      ? courses
      : courses.filter((c) => c.category === filterCategory);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-64 bg-white dark:bg-[#0a0a0a] rounded-xl border border-slate-200 dark:border-[#222222] p-5">
          <Skeleton className="h-6 w-1/3 mb-3" />
          <Skeleton className="h-44 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-[#0a0a0a] p-5 rounded-2xl border border-slate-200 dark:border-[#222222]/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-[#f0f0f0]">{tr('Agricultural Extension & Farmer Academy')}</h2>
          <p className="text-xs text-slate-500 dark:text-[#a0a0a0] mt-0.5">{tr('DAE-certified agronomic masterclasses, soil nutrition guides, and high-efficiency water conservation techniques.')}</p>
        </div>

        {/* Category Filter */}
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-[#111111]/60 border border-slate-200 dark:border-[#222222] rounded-lg text-slate-800 dark:text-[#e0e0e0] focus:outline-none"
        >
          <option value="All">{tr('All Categories (')}{courses.length})</option>
          <option value="Agronomy">{tr('Agronomy')}</option>
          <option value="Irrigation & Water">{tr('Irrigation & Water')}</option>
          <option value="Pest Management">{tr('Pest Management')}</option>
          <option value="Soil Health">{tr('Soil Health')}</option>
          <option value="Post-Harvest">{tr('Post-Harvest')}</option>
          <option value="Agribusiness">{tr('Agribusiness')}</option>
        </select>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredCourses.map((course) => {
          const progressPercent = Math.round(
            (course.completedLessonsCount / course.lessonsCount) * 100
          );

          return (
            <Card key={course.id} className="flex flex-col justify-between hover:border-slate-300 dark:border-[#333333] transition-all">
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <Badge variant="info">{tr(course.category)}</Badge>
                  <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{course.rating.toFixed(1)}</span>
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 dark:text-[#f0f0f0] text-base leading-snug mb-1">
                  {tr(course.title)}
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#a0a0a0] line-clamp-2 mb-3">
                  {tr(course.description)}
                </p>

                <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {course.durationMinutes}{tr('mins')}</span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    {course.lessonsCount}{tr('lessons')}</span>
                  <Badge variant="neutral">{tr(course.difficulty)}</Badge>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5 p-3 bg-slate-50 dark:bg-[#111111]/60 rounded-xl border border-slate-100">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 dark:text-[#a0a0a0] font-medium">{tr('Completion Progress')}</span>
                    <span className="font-bold text-slate-800 dark:text-[#e0e0e0]">{progressPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 block">
                    {course.completedLessonsCount}{tr('of')}{course.lessonsCount}{tr('modules finished')}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 dark:text-[#a0a0a0] flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                  {tr(course.instructor)}
                </span>

                <Button
                  variant={progressPercent === 100 ? 'outline' : 'primary'}
                  size="sm"
                  icon={progressPercent === 100 ? CheckCircle : PlayCircle}
                  onClick={() => handleStartLesson(course)}
                >
                  {progressPercent === 100
                    ? (language === 'bn' ? 'কোর্সটি রিভিউ করুন' : 'Review Course')
                    : (language === 'bn' ? 'কোর্স চালিয়ে যান' : 'Continue Course')}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Course Details / Syllabus Modal */}
      {selectedCourse && (
        <Modal
          isOpen={!!selectedCourse}
          onClose={() => setSelectedCourse(null)}
          title={selectedCourse.title}
          subtitle={`${tr('Instructor: ')}${tr(selectedCourse.instructor)} ${tr('•')} ${tr(selectedCourse.category)} ${tr('•')} ${selectedCourse.durationMinutes} ${tr('Total Minutes')}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 dark:text-[#a0a0a0] leading-relaxed">{tr(selectedCourse.description)}</p>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-[#f0f0f0] text-sm">{tr('Interactive Syllabus & Video Modules')}</h4>
              <div className="divide-y divide-slate-100 border border-slate-200 dark:border-[#222222] rounded-xl overflow-hidden">
                {selectedCourse.syllabus.map((lesson, idx) => (
                  <div
                    key={lesson.title}
                    className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 dark:hover:bg-[#1a1a1a]/60 dark:bg-[#111111]/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          lesson.completed
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 dark:bg-[#1a1a1a] text-slate-600 dark:text-[#a0a0a0]'
                        }`}
                      >
                        {lesson.completed ? '✓' : idx + 1}
                      </div>
                      <div>
                        <span
                          className={`font-semibold block ${
                            lesson.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-[#e0e0e0]'
                          }`}
                        >
                          {tr(lesson.title)}
                        </span>
                        <span className="text-[11px] text-slate-400">{tr(lesson.duration)}</span>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant={lesson.completed ? 'outline' : 'secondary'}
                      onClick={() => handleCompleteLesson(idx)}
                    >
                      {lesson.completed
                        ? (language === 'bn' ? 'সম্পন্ন' : 'Completed')
                        : (language === 'bn' ? 'সম্পন্ন হিসেবে চিহ্নিত করুন' : 'Mark Completed')}
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-800">
                <Award className="w-5 h-5 text-emerald-600" />
                <span className="font-semibold">{tr('DAE Verified Agronomist Certificate of Completion')}</span>
              </div>
              <Badge variant="success">{tr('Included')}</Badge>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
