import * as XLSX from 'xlsx';
import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Loader2, BookOpen, Download } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotification } from '../../../contexts/NotificationContext';

export default function EvaluationReports() {
  const { token } = useAuth();
  const { notify } = useNotification();
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        const res = await fetch('/api/admin/evaluations', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setEvaluations(data);
        } else {
          throw new Error('Failed to fetch');
        }
      } catch (err) {
        notify({ title: 'Error', message: 'Failed to load evaluation reports', type: 'error' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvaluations();
  }, [token, notify]);

  // Group evaluations by course for aggregated view
  const groupedEvaluations = evaluations.reduce((acc, curr) => {
    if (!acc[curr.courseId]) {
      acc[curr.courseId] = {
        courseCode: curr.courseCode,
        courseTitle: curr.courseTitle,
        totalRating: 0,
        count: 0,
        feedbacks: []
      };
    }
    acc[curr.courseId].totalRating += curr.rating;
    acc[curr.courseId].count += 1;
    acc[curr.courseId].feedbacks.push({ rating: curr.rating, feedback: curr.feedback, date: curr.createdAt });
    return acc;
  }, {});

  
  const exportToExcel = () => {
    if (evaluations.length === 0) return;
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Summary Data
    const summaryData = Object.values(groupedEvaluations).map((c: any) => ({
      "Course Code": c.courseCode,
      "Course Title": c.courseTitle,
      "Total Reviews": c.count,
      "Average Rating": (c.totalRating / c.count).toFixed(2)
    }));
    
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Course Summary");

    // All Feedbacks Data
    const feedbacksData = evaluations.map((e: any) => ({
      "Course Code": e.courseCode,
      "Course Title": e.courseTitle,
      "Rating": e.rating,
      "Feedback": e.feedback,
      "Date": new Date(e.createdAt).toLocaleDateString()
    }));
    
    const wsFeedbacks = XLSX.utils.json_to_sheet(feedbacksData);
    XLSX.utils.book_append_sheet(wb, wsFeedbacks, "All Feedbacks");

    // Save the file
    XLSX.writeFile(wb, `Evaluation_Reports_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Evaluation Reports</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Review anonymous student feedback on courses and lecturer performance.</p>
        </div>
        <button 
          onClick={exportToExcel}
          disabled={isLoading || evaluations.length === 0}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl transition-colors font-medium shadow-sm disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          Export to Excel
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      ) : Object.keys(groupedEvaluations).length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center text-slate-500 dark:text-slate-400">
          No evaluations found.
        </div>
      ) : (
        <div className="grid gap-6">
          {Object.values(groupedEvaluations).map((course: any, idx) => {
            const avgRating = (course.totalRating / course.count).toFixed(1);
            return (
              <div key={idx} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-emerald-600" />
                      {course.courseCode} - {course.courseTitle}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{course.count} Review{course.count !== 1 && 's'}</p>
                  </div>
                  <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                    <span className="font-black text-lg text-slate-900 dark:text-white">{avgRating}</span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">/ 5.0</span>
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Written Feedback
                  </h4>
                  <div className="space-y-4">
                    {course.feedbacks.map((f: any, fIdx: number) => (
                      <div key={fIdx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-1 mb-2">
                          {Array.from({ length: 5 }).map((_, sIdx) => (
                            <Star key={sIdx} className={`w-3 h-3 ${sIdx < f.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600'}`} />
                          ))}
                          <span className="text-xs text-slate-400 ml-2">{new Date(f.date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300">{f.feedback}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
