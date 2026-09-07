import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotification } from '../../../contexts/NotificationContext';
import { BookOpen, CheckCircle2, AlertCircle, Eye, ArrowLeft, Send, Lock, CheckSquare, XCircle } from 'lucide-react';
import { Skeleton } from '../../../components/ui/Skeleton';

export default function ResultPublication() {
  const { token } = useAuth();
  const { notify } = useNotification();
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [courseResults, setCourseResults] = useState<any[]>([]);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchPendingPublications();
  }, [token]);

  const fetchPendingPublications = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/registrar/results/pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setCourses(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const viewCourseResults = async (course: any) => {
    setSelectedCourse(course);
    setIsLoadingResults(true);
    try {
      const res = await fetch(`/api/hod/results/course/${course.courseId}?status=${course.status}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setCourseResults(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingResults(false);
    }
  };

  const handleAction = async (action: 'approve' | 'publish' | 'lock' | 'return') => {
    const actionText = action.toUpperCase();
    const confirmed = window.confirm(`Are you sure you want to ${actionText} these results?`);
    if (!confirmed) return;

    let reason = '';
    if (action === 'return') {
      reason = window.prompt("Reason for returning:") || "Returned by Registrar";
    }

    setIsProcessing(true);
    try {
      const resultIds = courseResults.map(r => r.resultId);
      const res = await fetch('/api/registrar/results/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ resultIds, courseId: selectedCourse.courseId, action, reason })
      });
      const data = await res.json();
      
      if (res.ok) {
        notify({ title: 'Success', message: data.message, type: 'success' });
        setSelectedCourse(null);
        fetchPendingPublications();
      } else {
        notify({ title: 'Error', message: data.error || 'Failed to process action', type: 'error' });
      }
    } catch (err) {
      notify({ title: 'Error', message: 'Network error', type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'hod_approved': return <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> HOD Approved</span>;
      case 'registrar_approved': return <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><CheckSquare className="w-3.5 h-3.5" /> Registrar Approved</span>;
      case 'published': return <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><Send className="w-3.5 h-3.5" /> Published</span>;
      case 'locked': return <span className="bg-slate-100 text-slate-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> Locked</span>;
      default: return <span className="bg-slate-100 text-slate-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">{status}</span>;
    }
  };

  if (selectedCourse) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setSelectedCourse(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Result Action Panel</h2>
            <p className="text-slate-500 text-sm mt-1">{selectedCourse.courseCode} - {selectedCourse.courseTitle}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 bg-emerald-50 flex justify-between items-center">
            <h3 className="font-bold text-emerald-900">Current Status: {selectedCourse.status}</h3>
            <span className="bg-emerald-200 text-emerald-800 font-bold px-3 py-1 rounded-full text-sm">
              {courseResults.length} Records Verified
            </span>
          </div>
          
          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left text-sm">
              <thead className="bg-white sticky top-0 shadow-sm text-slate-500 font-bold uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Matric No</th>
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-4 py-4 text-center">CA</th>
                  <th className="px-4 py-4 text-center">Exam</th>
                  <th className="px-4 py-4 text-center">Total</th>
                  <th className="px-4 py-4 text-center">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoadingResults ? (
                  <tr><td colSpan={6} className="p-8 text-center"><Skeleton className="h-8 w-64 mx-auto" /></td></tr>
                ) : (
                  courseResults.map((s) => (
                    <tr key={s.resultId} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-mono font-bold text-slate-700">{s.matricNo}</td>
                      <td className="px-6 py-4 font-medium text-slate-900">{s.name}</td>
                      <td className="px-4 py-4 text-center font-medium text-slate-600">{s.caScore ?? '-'}</td>
                      <td className="px-4 py-4 text-center font-medium text-slate-600">{s.examScore ?? '-'}</td>
                      <td className="px-4 py-4 text-center font-black text-slate-800">{s.score ?? '-'}</td>
                      <td className="px-4 py-4 text-center font-bold text-emerald-600">{s.grade ?? '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 justify-end mt-4">
          {selectedCourse.status !== 'locked' && (
            <button 
              onClick={() => handleAction('return')}
              disabled={isProcessing}
              className="px-6 py-2.5 bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <XCircle className="w-5 h-5" /> Return
            </button>
          )}

          {selectedCourse.status === 'hod_approved' && (
            <button 
              onClick={() => handleAction('approve')}
              disabled={isProcessing}
              className="px-8 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-xl transition-colors shadow-md disabled:opacity-50 flex items-center gap-2"
            >
              <CheckSquare className="w-5 h-5" /> Approve Results
            </button>
          )}
          
          {(selectedCourse.status === 'registrar_approved' || selectedCourse.status === 'hod_approved') && (
            <button 
              onClick={() => handleAction('publish')}
              disabled={isProcessing}
              className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl transition-colors shadow-md disabled:opacity-50 flex items-center gap-2"
            >
              <Send className="w-5 h-5" /> Publish Results System-Wide
            </button>
          )}

          {selectedCourse.status === 'published' && (
            <button 
              onClick={() => handleAction('lock')}
              disabled={isProcessing}
              className="px-8 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-xl transition-colors shadow-md disabled:opacity-50 flex items-center gap-2"
            >
              <Lock className="w-5 h-5" /> Lock Results
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Result Actions & Publication</h2>
        <p className="text-slate-500 mt-1">Review, approve, publish, and lock academic results.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [1,2,3].map(i => <div key={i}><Skeleton  className="h-48 rounded-2xl" /></div>)
        ) : courses.length === 0 ? (
          <div className="col-span-full bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-16 text-center">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-slate-700">All Clear</h3>
            <p className="text-slate-500 mt-2">There are no pending results requiring action.</p>
          </div>
        ) : (
          courses.map((course, idx) => (
            <div key={`${course.courseId}-${course.status}-${idx}`} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center shrink-0">
                  <BookOpen className="w-6 h-6" />
                </div>
                {getStatusBadge(course.status)}
              </div>
              <h3 className="font-bold text-slate-900 text-lg leading-tight mb-1">{course.courseCode}</h3>
              <p className="text-slate-600 text-sm mb-4 line-clamp-1" title={course.courseTitle}>{course.courseTitle}</p>
              
              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <div className="text-sm">
                  <span className="font-bold text-slate-800">{course.approvedCount}</span>
                  <span className="text-slate-500 ml-1">Records</span>
                </div>
                <button 
                  onClick={() => viewCourseResults(course)}
                  className="text-indigo-600 hover:text-indigo-700 font-bold text-sm flex items-center gap-1.5"
                >
                  <Eye className="w-4 h-4" /> Action
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
