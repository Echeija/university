import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Plus, CheckCircle2, ChevronRight, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';

export default function CourseEnrollmentWidget() {
  const { token } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [registered, setRegistered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { notify } = useNotification();

  useEffect(() => {
    Promise.all([
      fetch('/api/courses', { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json()),
      fetch('/api/student/courses', { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json())
    ]).then(([availableData, registeredData]) => {
      setCourses(availableData);
      setRegistered(registeredData);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [token]);

  const handleQuickEnroll = async (courseId: number, courseCode: string) => {
    const course = courses.find(c => c.id === courseId);
    if (course?.prerequisites) {
      const required = course.prerequisites.split(',').map((s: string) => s.trim()).filter(Boolean);
      const registeredCodes = registered.map(rc => rc.course?.code);
      const missing = required.filter((req: string) => !registeredCodes.includes(req));
      if (missing.length > 0) {
        notify({
          title: 'Prerequisite Failed',
          message: `You must complete: ${missing.join(', ')} before enrolling.`,
          type: 'error'
        });
        return;
      }
    }

    try {
      const response = await fetch('/api/student/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ courseId })
      });
      
      if (response.ok) {
        setRegistered([...registered, { course: { id: courseId } }]);
        notify({
          title: 'Enrollment Requested',
          message: `Successfully requested enrollment for ${courseCode}.`,
          type: 'success'
        });
      }
    } catch (e) {
      notify({
        title: 'Enrollment Error',
        message: 'Could not process enrollment at this time.',
        type: 'error'
      });
    }
  };

  const filteredCourses = courses.filter(course => 
    course.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 animate-pulse mt-6">
        <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-slate-100 dark:bg-slate-700/50 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 mt-6 flex flex-col h-[500px]">
      <div className="flex justify-between items-start mb-4 border-b border-slate-100 dark:border-slate-700 pb-4">
        <div>
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-600" />
            Interactive Course Enrollment
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Browse and request registration with a single click.</p>
        </div>
      </div>

      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Search available courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm dark:text-white"
        />
      </div>

      <div className="space-y-3 overflow-y-auto pr-2 flex-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
        {filteredCourses.map(course => {
          const isEnrolled = registered.some(rc => rc.course?.id === course.id);
          
          return (
            <div key={course.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-purple-200 dark:hover:border-purple-800 transition-colors">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white">{course.code}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                    {course.credits} Credits
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate max-w-[200px] sm:max-w-sm">{course.title}</p>
                {course.prerequisites && (
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5 font-medium">
                    Prereq: {course.prerequisites}
                  </p>
                )}
              </div>
              
              <button
                onClick={() => handleQuickEnroll(course.id, course.code)}
                disabled={isEnrolled}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  isEnrolled 
                    ? 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400 cursor-not-allowed'
                    : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 cursor-pointer'
                }`}
              >
                {isEnrolled ? (
                  <><CheckCircle2 className="w-3.5 h-3.5" /> Enrolled</>
                ) : (
                  <><Plus className="w-3.5 h-3.5" /> Enroll</>
                )}
              </button>
            </div>
          );
        })}
        {filteredCourses.length === 0 && (
          <div className="text-center p-8 text-slate-500 text-sm">
            No courses found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}