import React from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { BookText, Plus, Users, FileText, CheckCircle2, ChevronRight, X, Clock, Upload, Link as LinkIcon, Download } from 'lucide-react';
import { useNotification } from '../../../contexts/NotificationContext';
import { Skeleton } from '../../../components/ui/Skeleton';
import { motion, AnimatePresence } from 'motion/react';

export default function LecturerAssignments() {
  const { token, user } = useAuth();
  const { notify } = useNotification();
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showSubmissions, setShowSubmissions] = useState<number | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
  
  // Grading modal state
  const [gradingSubmission, setGradingSubmission] = useState<any | null>(null);
  const [marks, setMarks] = useState('');
  const [feedback, setFeedback] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    totalMarks: '100'
  });

  useEffect(() => {
    fetchCourses();
  }, [token]);

  useEffect(() => {
    if (selectedCourse) {
      fetchAssignments();
    }
  }, [selectedCourse, token]);

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/lecturer/courses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
        if (data.length > 0) setSelectedCourse(data[0].id.toString());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAssignments = async () => {
    if (!selectedCourse) return;
    try {
      const res = await fetch(`/api/courses/${selectedCourse}/assignments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setAssignments(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;

    try {
      const res = await fetch(`/api/courses/${selectedCourse}/assignments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        notify({ title: 'Success', message: 'Assignment created successfully', type: 'success' });
        setShowCreate(false);
        setFormData({ title: '', description: '', dueDate: '', totalMarks: '100' });
        fetchAssignments();
      } else {
        notify({ title: 'Error', message: 'Failed to create assignment', type: 'error' });
      }
    } catch (err) {
      notify({ title: 'Error', message: 'Network error', type: 'error' });
    }
  };

  const fetchSubmissions = async (assignmentId: number) => {
    setIsLoadingSubmissions(true);
    setShowSubmissions(assignmentId);
    try {
      const res = await fetch(`/api/assignments/${assignmentId}/submissions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setSubmissions(await res.json());
      }
    } catch (e) {
      console.error(e);
      notify({ title: 'Error', message: 'Failed to fetch submissions', type: 'error' });
    } finally {
      setIsLoadingSubmissions(false);
    }
  };

  const submitGrade = async () => {
    if (!gradingSubmission) return;
    
    try {
      const res = await fetch(`/api/submissions/${gradingSubmission.id}/grade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ marksAwarded: marks, feedback })
      });
      
      if (res.ok) {
        notify({ title: 'Success', message: 'Submission graded', type: 'success' });
        setGradingSubmission(null);
        setMarks('');
        setFeedback('');
        if (showSubmissions) fetchSubmissions(showSubmissions);
      } else {
        notify({ title: 'Error', message: 'Failed to save grade', type: 'error' });
      }
    } catch (e) {
      notify({ title: 'Error', message: 'Network error', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Assignments Portal</h2>
          <p className="text-slate-500 mt-1">Create assignments, collect submissions, and grade work.</p>
        </div>
        <button 
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span>New Assignment</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
        <div className="p-4 border-b border-slate-100 flex overflow-x-auto gap-2">
          {isLoading ? (
            <Skeleton className="w-32 h-10 rounded-lg" />
          ) : (
            courses.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedCourse(c.id.toString())}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedCourse === c.id.toString() 
                    ? 'bg-emerald-50 text-emerald-700' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {c.course.code}
              </button>
            ))
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-bold text-slate-900 px-1 text-lg">Active Assignments</h3>
          {assignments.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-8 text-center">
              <BookText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600 font-medium">No assignments found</p>
              <p className="text-sm text-slate-500 mt-1">Create one to get started.</p>
            </div>
          ) : (
            assignments.map(assign => (
              <div 
                key={assign.id}
                onClick={() => fetchSubmissions(assign.id)}
                className={`p-5 rounded-xl border cursor-pointer transition-all ${
                  showSubmissions === assign.id 
                    ? 'bg-emerald-50 border-emerald-200 shadow-sm' 
                    : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-md'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-slate-900 leading-tight">{assign.title}</h4>
                  <ChevronRight className={`w-5 h-5 ${showSubmissions === assign.id ? 'text-emerald-500' : 'text-slate-400'}`} />
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500 mt-3">
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {new Date(assign.dueDate).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1.5"><FileText className="w-4 h-4" /> {assign.totalMarks} pts</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="lg:col-span-2">
          {showSubmissions ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-900">Submissions Overview</h3>
                <span className="text-sm font-medium px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                  {submissions.length} Submitted
                </span>
              </div>
              <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                {isLoadingSubmissions ? (
                  <div className="p-8 text-center text-slate-500">Loading submissions...</div>
                ) : submissions.length === 0 ? (
                  <div className="p-12 text-center">
                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">No submissions yet for this assignment.</p>
                  </div>
                ) : (
                  submissions.map(sub => {
                    const currentAssignment = assignments.find(a => a.id === showSubmissions);
                    const isLate = currentAssignment && new Date(sub.submittedAt) > new Date(currentAssignment.dueDate);
                    
                    return (
                    <div key={sub.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h4 className="font-bold text-slate-900">{sub.student.name}</h4>
                        <p className="text-sm text-slate-500 mb-2">
                          @{sub.student.username} • Submitted {new Date(sub.submittedAt).toLocaleString()}
                          {isLate && (
                            <span className="ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold bg-rose-100 text-rose-700">
                              Late
                            </span>
                          )}
                        </p>
                        <a 
                          href={sub.fileUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium"
                        >
                          <Download className="w-4 h-4" /> {sub.fileName}
                        </a>
                      </div>
                      
                      <div>
                        {sub.status === 'graded' ? (
                          <div className="text-right">
                            <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg mb-1">
                              <CheckCircle2 className="w-4 h-4" /> Graded: {sub.marksAwarded} pts
                            </span>
                            {sub.feedback && <p className="text-xs text-slate-500 max-w-[200px] truncate" title={sub.feedback}>"{sub.feedback}"</p>}
                          </div>
                        ) : (
                          <button 
                            onClick={() => setGradingSubmission(sub)}
                            className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap"
                          >
                            Grade Submission
                          </button>
                        )}
                      </div>
                    </div>
                  )})
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-12 text-center h-full flex flex-col items-center justify-center">
              <BookText className="w-16 h-16 text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-700">Select an Assignment</h3>
              <p className="text-slate-500 mt-2 max-w-md">Choose an assignment from the list to view and grade student submissions.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-lg text-slate-900">Create New Assignment</h3>
                <button onClick={() => setShowCreate(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreateAssignment} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Assignment Title</label>
                  <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" placeholder="e.g. Midterm Essay" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Instructions</label>
                  <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" placeholder="Detailed instructions for the assignment..."></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Due Date & Time</label>
                    <input required type="datetime-local" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Total Points</label>
                    <input required type="number" min="1" value={formData.totalMarks} onChange={e => setFormData({...formData, totalMarks: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
                  </div>
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setShowCreate(false)} className="flex-1 px-4 py-2.5 text-slate-700 bg-slate-100 hover:bg-slate-200 font-bold rounded-xl transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 px-4 py-2.5 text-white bg-emerald-600 hover:bg-emerald-700 font-bold rounded-xl transition-colors shadow-sm">Publish Assignment</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Grading Modal */}
        {gradingSubmission && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-emerald-50 text-emerald-900">
                <h3 className="font-bold text-lg">Grade Submission</h3>
                <button onClick={() => setGradingSubmission(null)} className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-5">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <p className="text-sm text-slate-500 font-medium mb-1">Student</p>
                  <p className="font-bold text-slate-900">{gradingSubmission.student.name} <span className="font-normal text-slate-500">(@{gradingSubmission.student.username})</span></p>
                  <div className="mt-3">
                    <a href={gradingSubmission.fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline font-medium">
                      <FileText className="w-4 h-4" /> View Submitted File
                    </a>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Points Awarded</label>
                  <input type="number" min="0" value={marks} onChange={e => setMarks(e.target.value)} placeholder="e.g. 85" className="w-full px-4 py-2.5 text-lg font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Feedback (Optional)</label>
                  <textarea value={feedback} onChange={e => setFeedback(e.target.value)} rows={3} placeholder="Great job on..." className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"></textarea>
                </div>

                <div className="pt-2 flex gap-3">
                  <button onClick={() => setGradingSubmission(null)} className="flex-1 px-4 py-2.5 text-slate-700 bg-slate-100 hover:bg-slate-200 font-bold rounded-xl transition-colors">Cancel</button>
                  <button onClick={submitGrade} disabled={!marks} className="flex-1 px-4 py-2.5 text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold rounded-xl transition-colors shadow-sm">Save Grade</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
