import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { Printer, CheckCircle2, BookOpen, Plus, Trash2 } from 'lucide-react';
import { Skeleton } from '../../../components/ui/Skeleton';
import { useNotification } from '../../../contexts/NotificationContext';

type Course = {
  id: number;
  code: string;
  title: string;
  credits: number;
  semester: string;
  prerequisites?: string | null;
};

export default function CourseRegistration() {
  const { token } = useAuth();
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [registeredCourses, setRegisteredCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { notify } = useNotification();

  useEffect(() => {
    // Fetch available and registered courses
    Promise.all([
      fetch('/api/courses', { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json()),
      fetch('/api/student/courses', { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json())
    ]).then(([available, registered]) => {
      setAvailableCourses(available);
      setRegisteredCourses(registered);
      setIsLoading(false);
    });
  }, []);

  const checkPrerequisites = (course: Course) => {
    if (!course.prerequisites) return { satisfied: true, missing: [] };
    const required = course.prerequisites.split(',').map(s => s.trim()).filter(Boolean);
    const registeredCodes = registeredCourses.map(rc => rc.course.code);
    const missing = required.filter(req => !registeredCodes.includes(req));
    return { satisfied: missing.length === 0, missing };
  };

  const handleRegister = async (courseId: number) => {
    const course = availableCourses.find(c => c.id === courseId);
    if (!course) return;

    if (registeredCourses.some(rc => rc.course.id === courseId)) return;

    const prereqCheck = checkPrerequisites(course);
    if (!prereqCheck.satisfied) {
      notify({
        title: 'Prerequisite Failed',
        message: `You must complete: ${prereqCheck.missing.join(', ')} before taking this course.`,
        type: 'error'
      });
      return;
    }

    try {
      const response = await fetch('/api/student/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ courseId })
      });
      
      if (response.ok) {
        // Optimistic update for UI simplicity, alternatively we could fetch all again
        setRegisteredCourses([...registeredCourses, { id: Math.random(), course, status: 'draft' }]);
        notify({
          title: 'Course Added',
          message: `${course.code} has been added to your course form.`,
          type: 'success'
        });
      }
    } catch (e) {
      console.error('Failed to register course', e);
      notify({
        title: 'Error Adding Course',
        message: 'Could not register for this course at this time.',
        type: 'error'
      });
    }
  };

  const handleRemove = async (courseId: number) => {
    try {
      const response = await fetch(`/api/student/courses/${courseId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const course = registeredCourses.find(rc => rc.course.id === courseId)?.course;
        setRegisteredCourses(registeredCourses.filter(rc => rc.course.id !== courseId));
        if (course) {
           notify({
             title: 'Course Removed',
             message: `${course.code} has been removed from your course form.`,
             type: 'info'
           });
        }
      }
    } catch (e) {
      console.error('Failed to remove course', e);
      notify({
        title: 'Error Removing Course',
        message: 'Could not remove this course at this time.',
        type: 'error'
      });
    }
  };


  const handleSubmitRegistration = async () => {
    try {
      const response = await fetch('/api/student/courses/submit', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        setRegisteredCourses(registeredCourses.map(rc => ({ ...rc, status: 'pending_approval' })));
        notify({
          title: 'Registration Submitted',
          message: 'Your course registration has been submitted for approval.',
          type: 'success'
        });
      }
    } catch (e) {
      console.error('Failed to submit courses', e);
      notify({
        title: 'Error Submitting',
        message: 'Could not submit your courses at this time.',
        type: 'error'
      });
    }
  };


  const totalCredits = registeredCourses.reduce((sum, rc) => sum + rc.course.credits, 0);

  return (
    <div id="print-area">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Course Registration</h2>
          <p className="text-slate-500 mt-1">Select your courses for the 2026/2027 academic session (1st Semester).</p>
        </div>
        <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium print:hidden shadow-sm">
          <Printer className="w-4 h-4" />
          <span>Print Registration</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-bold text-slate-800">Available Courses</h3>
            </div>
            <ul className="divide-y divide-slate-100">
              {isLoading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <li key={i} className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Skeleton className="h-5 w-20" />
                          <Skeleton className="h-5 w-16 rounded-full" />
                        </div>
                        <Skeleton className="h-4 w-48" />
                      </div>
                    </div>
                    <Skeleton className="h-10 w-24 rounded-lg" />
                  </li>
                ))
              ) : (
                availableCourses.filter(c => c.semester === '1st').map(course => {
                  const isRegistered = registeredCourses.some(rc => rc.course.id === course.id);
                  return (
                    <li key={course.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900">{course.code}</h4>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                              {course.credits} Credits
                            </span>
                          </div>
                          <p className="text-sm text-slate-500">{course.title}</p>
                          {course.prerequisites && (
                            <p className="text-xs text-amber-600 mt-1 font-medium">
                              Prerequisites: {course.prerequisites}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRegister(course.id)}
                        disabled={isRegistered}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
                          isRegistered 
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {isRegistered ? (
                          <><CheckCircle2 className="w-4 h-4" /> Registered</>
                        ) : (
                          <><Plus className="w-4 h-4" /> Add</>
                        )}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="px-6 py-4 border-b border-slate-200 bg-slate-900 text-white">
              <h3 className="font-bold">My Course Form</h3>
            </div>
            <div className="p-6 bg-emerald-50/50 border-b border-slate-100 flex justify-between items-center">
              <span className="font-medium text-slate-600">Total Credits</span>
              {isLoading ? (
                <Skeleton className="h-8 w-10" />
              ) : (
                <span className="text-2xl font-black text-emerald-700">{totalCredits}</span>
              )}
            </div>
            <ul className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {isLoading ? (
                [1, 2, 3].map(i => (
                  <li key={i} className="p-4 flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-8 w-8 rounded-lg" />
                  </li>
                ))
              ) : registeredCourses.length === 0 ? (
                <li className="p-6 text-center text-slate-500 text-sm">No courses selected yet.</li>
              ) : (
                registeredCourses.map(rc => (
                  <li key={rc.id} className="p-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{rc.course.code}</h4>
                      <p className="text-xs text-slate-500">{rc.course.credits} Credits</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {rc.status === 'pending_approval' && <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md">Pending</span>}
                      {rc.status === 'registered' && <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">Approved</span>}
                      {rc.status === 'draft' && (
                        <button
                          onClick={() => handleRemove(rc.course.id)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </li>
                ))
              )}
            </ul>
            {(!isLoading && registeredCourses.length > 0 && registeredCourses.some(rc => rc.status === 'draft')) && (
              <div className="p-4 bg-slate-50 border-t border-slate-100">
                <button 
                  onClick={handleSubmitRegistration}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors"
                >
                  Submit Registration
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
