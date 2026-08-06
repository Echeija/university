import React, { useState } from 'react';
import { Sparkles, BookOpen, Calendar, Lightbulb, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

export default function AIStudyPlannerWidget() {
  const { token } = useAuth();
  const { notify } = useNotification();
  
  const [studyPlan, setStudyPlan] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePlan = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/student/study-plan/generate', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStudyPlan(data);
        notify({ title: 'Plan Generated', message: 'Your AI study plan is ready!', type: 'success' });
      } else {
        notify({ title: 'Generation Failed', message: 'Could not generate study plan.', type: 'error' });
      }
    } catch (e) {
      console.error(e);
      notify({ title: 'Network Error', message: 'Failed to connect to the server.', type: 'error' });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
      <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/10 dark:to-purple-900/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">AI Study Planner</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Personalized schedules & topic suggestions</p>
          </div>
        </div>
        
        <button
          onClick={generatePlan}
          disabled={isGenerating}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white rounded-xl transition-all font-medium shadow-sm hover:shadow"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>{studyPlan ? 'Regenerate Plan' : 'Generate Plan'}</span>
            </>
          )}
        </button>
      </div>

      <div className="p-6">
        {!studyPlan && !isGenerating && (
          <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div className="w-16 h-16 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Sparkles className="w-8 h-8 text-indigo-400" />
            </div>
            <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">Ready to optimize your study?</h4>
            <p className="text-slate-500 max-w-md mx-auto text-sm">
              Our AI analyzes your registered courses, credit loads, and upcoming exams to build a personalized weekly study schedule.
            </p>
          </div>
        )}

        {isGenerating && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-900/30 mb-4 animate-pulse">
              <Sparkles className="w-8 h-8 text-indigo-500" />
            </div>
            <h4 className="text-lg font-medium text-slate-700 dark:text-slate-300">Designing your perfect study week...</h4>
            <p className="text-slate-500 text-sm mt-2">Checking course credits and exam conflicts</p>
          </div>
        )}

        {studyPlan && !isGenerating && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Daily Schedule */}
            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-4 text-lg">
                <Calendar className="w-5 h-5 text-emerald-500" />
                Recommended Weekly Routine
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {studyPlan.dailySchedule?.map((day: any, i: number) => (
                  <div key={i} className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{day.day}</span>
                      <span className="text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {day.duration}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
                      Focus: {day.focusCourse}
                    </div>
                    <ul className="space-y-2">
                      {day.activities?.map((act: string, j: number) => (
                        <li key={j} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-slate-300 dark:text-slate-600 mt-0.5 shrink-0" />
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Practice Topics */}
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-4 text-lg">
                  <BookOpen className="w-5 h-5 text-blue-500" />
                  Targeted Practice Topics
                </h4>
                <div className="space-y-4">
                  {studyPlan.practiceTopics?.map((pt: any, i: number) => (
                    <div key={i} className="border-l-2 border-blue-500 pl-4 py-1">
                      <h5 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{pt.courseCode} - {pt.courseTitle}</h5>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {pt.topics?.map((topic: string, j: number) => (
                          <span key={j} className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Study Tips */}
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-4 text-lg">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  AI Study Strategies
                </h4>
                <ul className="space-y-3">
                  {studyPlan.tips?.map((tip: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 bg-amber-50/50 dark:bg-amber-900/10 p-3 rounded-lg border border-amber-100/50 dark:border-amber-900/20">
                      <div className="bg-amber-100 dark:bg-amber-900/30 p-1 rounded mt-0.5">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <span className="text-sm text-slate-700 dark:text-slate-300">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}
