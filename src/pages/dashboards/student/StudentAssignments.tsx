import React from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { storage } from '../../../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { BookText, FileText, CheckCircle2, Clock, UploadCloud, Link as LinkIcon, X, AlertCircle } from 'lucide-react';
import { useNotification } from '../../../contexts/NotificationContext';
import { Skeleton } from '../../../components/ui/Skeleton';
import { motion, AnimatePresence } from 'motion/react';

export default function StudentAssignments() {
  const { token, user } = useAuth();
  const { notify } = useNotification();
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [mySubmissions, setMySubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [now, setNow] = useState(new Date());
  
  // Submission modal state
  const [submittingAssignment, setSubmittingAssignment] = useState<any | null>(null);
  const [fileUrl, setFileUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState('');

  const getSubmission = (assignmentId: number) => {
    return mySubmissions.find(s => s.assignmentId === assignmentId);
  };

  const formatCountdown = (dateStr: string) => {
    const d = new Date(dateStr);
    const diff = d.getTime() - now.getTime();
    if (diff < 0) return 'Overdue';
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} left`;
    return `${hours} hour${hours !== 1 ? 's' : ''} left`;
  };



  useEffect(() => {
    fetchCourses();
    fetchMySubmissions();
    const timer = setInterval(() => setNow(new Date()), 60000);
    



  return (


) => clearInterval(timer);
  }, [token]);

  useEffect(() => {
    if (selectedCourse) {
      fetchAssignments();
    }
  }, [selectedCourse, token]);

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/student/courses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
        if (data.length > 0) setSelectedCourse(data[0].course.id.toString());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMySubmissions = async () => {
    try {
      const res = await fetch('/api/student/submissions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setMySubmissions(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAssignments = async () => {
    if (!selectedCourse) return;
    setIsLoadingContent(true);
    try {
      const res = await fetch(`/api/courses/${selectedCourse}/assignments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setAssignments(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingContent(false);
    }
  };

  const submitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingAssignment || !selectedFile) return;

    try {
      setIsUploading(true);
      
      const fileExt = selectedFile.name.split('.').pop();
      const finalFileName = fileName || selectedFile.name;
      const filePath = `assignments/${user?.id || 'unknown'}/${submittingAssignment.id}_${Date.now()}.${fileExt}`;
      const storageRef = ref(storage, filePath);
      
      await uploadBytes(storageRef, selectedFile);
      const downloadUrl = await getDownloadURL(storageRef);

      const res = await fetch(`/api/assignments/${submittingAssignment.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ fileUrl: downloadUrl, fileName: finalFileName })
      });
      
      if (res.ok) {
        notify({ title: 'Success', message: 'Assignment submitted successfully via Firebase Storage', type: 'success' });
        setSubmittingAssignment(null);
        setSelectedFile(null);
        setFileName('');
        fetchMySubmissions();
      } else {
        const data = await res.json();
        notify({ title: 'Error', message: data.error || 'Failed to submit assignment', type: 'error' });
      }
    } catch (e: any) {
      console.error(e);
      notify({ title: 'Upload Failed', message: e.message || 'Failed to upload to Firebase storage.', type: 'error' });
    } finally {
      setIsUploading(false);
      setIsLoadingContent(false);
    }
  };

return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">My Assignments</h2>
        <p className="text-slate-500 mt-1">View pending tasks and submit your coursework.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
        <div className="p-4 border-b border-slate-100 flex overflow-x-auto gap-2">
          {isLoading ? (
            <Skeleton className="w-32 h-10 rounded-lg" />
          ) : courses.length === 0 ? (
            <div className="text-slate-500 p-2 text-sm font-medium">Not registered for any courses.</div>
          ) : (
            courses.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedCourse(c.course.id.toString())}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedCourse === c.course.id.toString() 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {c.course.code}
              </button>
            ))
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoadingContent ? (
          [1, 2, 3].map(i => <div key={i}><Skeleton  className="h-64 rounded-2xl" /></div>)
        ) : assignments.length === 0 ? (
          <div className="col-span-full bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-16 text-center">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-slate-700">All caught up!</h3>
            <p className="text-slate-500 mt-2">There are no assignments posted for this course yet.</p>
          </div>
        ) : (
          assignments.map(assign => {
            const submission = getSubmission(assign.id);
            const isLate = now > new Date(assign.dueDate);
            const countdownText = formatCountdown(assign.dueDate);
            
          
  return (
              <div key={assign.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
                <div className={`p-1.5 ${
                  submission?.status === 'graded' ? 'bg-emerald-500' :
                  submission ? 'bg-blue-500' :
                  isLate ? 'bg-rose-500' : 'bg-slate-800'
                }`}></div>
                
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-slate-900 text-lg leading-tight line-clamp-2">{assign.title}</h3>
                  </div>
                  
                  <p className="text-slate-600 text-sm mb-6 flex-1 line-clamp-3">{assign.description}</p>
                  
                  <div className="space-y-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 flex items-center gap-1.5"><Clock className="w-4 h-4" /> Due</span>
                      <div className="text-right">
                        <div className={`font-bold ${isLate && !submission ? 'text-rose-600' : 'text-slate-900'}`}>
                          {new Date(assign.dueDate).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                        {!submission && (
                          <div className={`text-xs font-bold mt-0.5 ${isLate ? 'text-rose-500' : 'text-amber-600'}`}>
                            {countdownText}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 flex items-center gap-1.5"><FileText className="w-4 h-4" /> Points</span>
                      <span className="font-bold text-slate-900">{assign.totalMarks}</span>
                    </div>
                  </div>

                  {submission ? (
                    <div className="mt-auto">
                      {submission.status === 'graded' ? (
                        <div className="bg-emerald-50 text-emerald-900 p-4 rounded-xl border border-emerald-100">
                          <div className="flex items-center justify-between font-bold mb-2">
                            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-5 h-5 text-emerald-600" /> Graded</span>
                            <span className="text-lg">{submission.marksAwarded} <span className="text-sm font-medium opacity-70">/ {assign.totalMarks}</span></span>
                          </div>
                          {submission.feedback && (
                            <p className="text-sm text-emerald-700/80 italic border-t border-emerald-200/50 pt-2 mt-2">"{submission.feedback}"</p>
                          )}
                        </div>
                      ) : (
                        <div className="bg-blue-50 text-blue-900 p-4 rounded-xl border border-blue-100 flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                          <div className="text-sm">
                            <p className="font-bold">Submitted</p>
                            <p className="opacity-80 truncate" title={submission.fileName}>{submission.fileName}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button 
                      onClick={() => setSubmittingAssignment(assign)}
                      className={`w-full py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 ${
                        isLate 
                          ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200' 
                          : 'bg-slate-900 text-white hover:bg-slate-800'
                      }`}
                    >
                      <UploadCloud className="w-5 h-5" />
                      {isLate ? 'Submit Late' : 'Submit Work'}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Submission Modal */}
      <AnimatePresence>
        {submittingAssignment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-lg text-slate-900">Submit Assignment</h3>
                <button onClick={() => setSubmittingAssignment(null)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <h4 className="font-bold text-slate-900 mb-1">{submittingAssignment.title}</h4>
                  <p className="text-sm text-slate-500">Ensure your document meets all requirements before submitting.</p>
                </div>
                
                <form onSubmit={submitAssignment} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Upload Assignment File</label>
                    <input 
                      required 
                      type="file" 
                      onChange={e => {
                        const file = e.target.files?.[0] || null;
                        setSelectedFile(file);
                        if (file && !fileName) setFileName(file.name);
                      }}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Document File Name (Optional)</label>
                    <input type="text" value={fileName} onChange={e => setFileName(e.target.value)} placeholder="e.g. Essay_Final.pdf" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  
                  <div className="bg-amber-50 text-amber-800 p-3 rounded-lg flex items-start gap-3 mt-4 text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <p>Once submitted, you cannot recall or replace this document. Verify the link is correct.</p>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => setSubmittingAssignment(null)} className="flex-1 px-4 py-2.5 text-slate-700 bg-slate-100 hover:bg-slate-200 font-bold rounded-xl transition-colors">Cancel</button>
                    <button type="submit" disabled={!selectedFile || isUploading} className="flex-1 px-4 py-2.5 text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold rounded-xl transition-colors shadow-sm">{isUploading ? 'Uploading...' : 'Submit Work'}</button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
