import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotification } from '../../../contexts/NotificationContext';
import { Star, MessageSquare, BookOpen, Send, CheckCircle2 } from 'lucide-react';
import { Skeleton } from '../../../components/ui/Skeleton';

export default function CourseEvaluations() {
  const { token } = useAuth();
  const { notify } = useNotification();
  
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedCourses, setSubmittedCourses] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/student/evaluations/courses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch courses');
      const data = await res.json();
      setCourses(data);
    } catch (err) {
      console.error(err);
      notify({ title: 'Error', message: 'Could not load courses for evaluation', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || rating === 0 || !feedback.trim()) {
      notify({ title: 'Incomplete', message: 'Please provide a rating and feedback.', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/student/evaluations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          courseId: selectedCourse.id,
          rating,
          feedback,
          semester: selectedCourse.semester
        })
      });

      if (!res.ok) throw new Error('Failed to submit');
      
      notify({ title: 'Success', message: 'Anonymous evaluation submitted successfully.', type: 'success' });
      setSubmittedCourses(prev => new Set(prev).add(selectedCourse.id));
      setSelectedCourse(null);
      setRating(0);
      setFeedback('');
    } catch (err) {
      notify({ title: 'Error', message: 'Failed to submit evaluation', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Course Evaluations</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Submit anonymous feedback for your courses and lecturers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-600" />
              Your Courses
            </h3>
            <div className="space-y-2">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i}><Skeleton className="h-16 w-full rounded-xl" /></div>
                ))
              ) : courses.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No registered courses found.
                </div>
              ) : (
                courses.map(course => {
                  const isSubmitted = submittedCourses.has(course.id);
                  const isSelected = selectedCourse?.id === course.id;
                  
                  return (
                    <button
                      key={course.id}
                      onClick={() => !isSubmitted && setSelectedCourse(course)}
                      disabled={isSubmitted}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        isSubmitted 
                          ? 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 opacity-70 cursor-not-allowed' 
                          : isSelected
                            ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800/50 shadow-sm'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className={`font-bold ${isSelected ? 'text-emerald-900 dark:text-emerald-300' : 'text-slate-900 dark:text-white'}`}>
                            {course.code}
                          </div>
                          <div className={`text-xs mt-1 truncate ${isSelected ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                            {course.title}
                          </div>
                        </div>
                        {isSubmitted && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedCourse ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Evaluating</div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">{selectedCourse.code} - {selectedCourse.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Semester: {selectedCourse.semester}</p>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border border-blue-100 dark:border-blue-900/30 rounded-xl flex items-start gap-3 text-sm">
                  <MessageSquare className="w-5 h-5 shrink-0 mt-0.5" />
                  <p>Your feedback is <strong>100% anonymous</strong>. It helps the department improve course delivery and content. Please be constructive and honest.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Overall Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star 
                          className={`w-8 h-8 ${
                            star <= (hoverRating || rating) 
                              ? 'fill-amber-400 text-amber-400' 
                              : 'text-slate-300 dark:text-slate-600'
                          } transition-colors`} 
                        />
                      </button>
                    ))}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                    {rating === 1 && 'Poor'}
                    {rating === 2 && 'Fair'}
                    {rating === 3 && 'Good'}
                    {rating === 4 && 'Very Good'}
                    {rating === 5 && 'Excellent'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Written Feedback</label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={5}
                    placeholder="What did you like about this course? How can the lecturer improve? Was the material clear?"
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none bg-slate-50 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting || rating === 0 || !feedback.trim()}
                    className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-emerald-200"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Anonymous Evaluation'}
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 border-dashed rounded-2xl h-full min-h-[400px] flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 p-8 text-center">
              <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100 dark:border-slate-700">
                <Star className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-2">Select a Course</h3>
              <p className="max-w-xs text-sm">Choose a course from the list on the left to provide your anonymous evaluation.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
