import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { CheckCircle2, Circle, Clock, GraduationCap, AlertCircle } from 'lucide-react';

interface Course {
  id: number;
  code: string;
  title: string;
  credits: number;
  semester: string;
}

interface Result {
  id: number;
  courseId: number;
  score: number;
  grade: string;
  semester: string;
  course: Course;
}

export default function DegreeAudit() {
  const { token } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/courses', { headers: { Authorization: `Bearer ${token}` } }),
      fetch('/api/student/results', { headers: { Authorization: `Bearer ${token}` } })
    ])
    .then(async ([coursesRes, resultsRes]) => {
      if (coursesRes.ok && resultsRes.ok) {
        setCourses(await coursesRes.json());
        setResults(await resultsRes.json());
      }
    })
    .finally(() => setIsLoading(false));
  }, [token]);

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading Degree Audit...</div>;
  }

  const passedGrades = ['A', 'B', 'C', 'D', 'E'];
  const passedResults = results.filter(r => passedGrades.includes(r.grade.toUpperCase()));
  const completedCourseIds = passedResults.map(r => r.course ? r.course.id : r.courseId);

  const totalCreditsRequired = courses.reduce((sum, c) => sum + c.credits, 0);
  const completedCredits = passedResults.reduce((sum, r) => {
    const course = courses.find(c => c.id === (r.course ? r.course.id : r.courseId));
    return sum + (course?.credits || 0);
  }, 0);

  const progressPercentage = totalCreditsRequired === 0 ? 0 : Math.round((completedCredits / totalCreditsRequired) * 100);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Degree Audit</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Track your progress towards graduation.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Overall Progress</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {completedCredits} of {totalCreditsRequired} Credits Completed
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-3xl font-black text-blue-600 dark:text-blue-400">{progressPercentage}%</span>
          </div>
        </div>
        
        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 mb-2 overflow-hidden">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-1000 ease-out" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 text-right mt-1">Target: 100% for Graduation</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <h3 className="font-bold text-slate-900 dark:text-white">Curriculum Requirements</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">All required courses for your degree program.</p>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
          {courses.map(course => {
            const isCompleted = completedCourseIds.includes(course.id);
            const result = results.find(r => (r.course ? r.course.id : r.courseId) === course.id);
            const isFailed = result && !isCompleted;

            return (
              <div key={course.id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : isFailed ? (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{course.code}: {course.title}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-1">
                      <span>{course.credits} Credits</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                      <span>Semester: {course.semester}</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {isCompleted ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                      Completed ({result?.grade})
                    </span>
                  ) : isFailed ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                      Failed ({result?.grade})
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                      <Clock className="w-3 h-3" /> Pending
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
