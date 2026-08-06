import React, { useState } from 'react';
import { FileText, Calendar, Clock, CheckCircle2, AlertCircle, Upload, X, Loader2 } from 'lucide-react';
import { useNotification } from '../../../../contexts/NotificationContext';
import { supabase } from '../../../../lib/supabase';

export default function LMSAssignments({ role }: { role: string | undefined }) {
  const { notify } = useNotification();
  
  // We'll manage assignments in state so we can update their status after submission
  const [assignments, setAssignments] = useState([
    {
      id: 1,
      title: "Module 1 Essay: Introduction Concepts",
      dueDate: "Oct 15, 2026",
      dueTime: "11:59 PM",
      status: "submitted",
      points: "100",
      grade: "95",
      type: "essay"
    },
    {
      id: 2,
      title: "Midterm Project Submission",
      dueDate: "Oct 25, 2026",
      dueTime: "11:59 PM",
      status: "pending",
      points: "200",
      grade: null,
      type: "project"
    },
    {
      id: 3,
      title: "Weekly Reflection 3",
      dueDate: "Oct 10, 2026",
      dueTime: "11:59 PM",
      status: "missing",
      points: "20",
      grade: "0",
      type: "reflection"
    }
  ]);

  const [activeUploadId, setActiveUploadId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (assignmentId: number) => {
    if (!selectedFile) {
      notify({ title: 'Error', message: 'Please select a file first', type: 'error' });
      return;
    }

    setIsUploading(true);
    
    try {
      // Create a unique file path: assignments/assignmentId_timestamp_filename
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${assignmentId}_${Date.now()}.${fileExt}`;
      const filePath = `submissions/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from('assignments')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (error) {
        throw error;
      }
      
      notify({ title: 'Success', message: 'Assignment submitted successfully', type: 'success' });
      
      // Update local state to reflect submission
      setAssignments(prev => prev.map(a => 
        a.id === assignmentId 
          ? { ...a, status: 'submitted' } 
          : a
      ));
      
      setActiveUploadId(null);
      setSelectedFile(null);
    } catch (err: any) {
      console.error('Upload error:', err);
      notify({ 
        title: 'Upload Failed', 
        message: err.message || 'Failed to upload assignment to Supabase storage. Ensure the "assignments" bucket exists.', 
        type: 'error' 
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Assignments</h3>
        {['Lecturer', 'Administrator', 'ICT Admin', 'Admin'].includes(role || '') && (
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm">
            + Create Assignment
          </button>
        )}
      </div>

      <div className="grid gap-4">
        {assignments.map(assignment => (
          <div key={assignment.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                assignment.status === 'submitted' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                assignment.status === 'missing' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
              }`}>
                <FileText className="w-6 h-6" />
              </div>
              <div className="w-full">
                <h4 className="text-lg font-bold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer">{assignment.title}</h4>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-1 text-sm text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {assignment.dueDate}</span>
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {assignment.dueTime}</span>
                  <span className="font-medium">{assignment.points} Points</span>
                </div>
                
                {/* Upload Section */}
                {activeUploadId === assignment.id && (
                  <div className="mt-4 p-4 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Upload Submission</h5>
                      <button onClick={() => { setActiveUploadId(null); setSelectedFile(null); }} className="text-slate-400 hover:text-slate-600">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <input 
                        type="file" 
                        id={`file-${assignment.id}`}
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      <label 
                        htmlFor={`file-${assignment.id}`}
                        className="flex items-center gap-2 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        Choose File
                      </label>
                      <span className="text-sm text-slate-500 truncate max-w-[200px]">
                        {selectedFile ? selectedFile.name : 'No file chosen'}
                      </span>
                    </div>
                    
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => handleUpload(assignment.id)}
                        disabled={!selectedFile || isUploading}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUploading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isUploading ? 'Uploading...' : 'Submit Assignment'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4 border-t border-slate-100 dark:border-slate-700 md:border-0 pt-4 md:pt-0 shrink-0">
              {role === 'Student' && (
                <div className="flex flex-col items-end min-w-[120px]">
                  {assignment.status === 'submitted' && (
                    <>
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-sm bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-md mb-1"><CheckCircle2 className="w-4 h-4" /> Submitted</span>
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Grade: {assignment.grade !== null ? `${assignment.grade}/${assignment.points}` : 'Pending'}</span>
                    </>
                  )}
                  {assignment.status === 'missing' && (
                    <>
                      <span className="flex items-center gap-1 text-red-600 dark:text-red-400 font-bold text-sm bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-md mb-1"><AlertCircle className="w-4 h-4" /> Missing</span>
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Grade: {assignment.grade}/{assignment.points}</span>
                    </>
                  )}
                  {assignment.status === 'pending' && activeUploadId !== assignment.id && (
                    <button 
                      onClick={() => setActiveUploadId(assignment.id)}
                      className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 px-4 py-2 rounded-lg font-medium transition-colors text-sm w-full"
                    >
                      Upload File
                    </button>
                  )}
                </div>
              )}
              {['Lecturer', 'Administrator', 'ICT Admin', 'Admin'].includes(role || '') && (
                <button className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 px-4 py-2 rounded-lg font-medium transition-colors text-sm">
                  Grade Submissions
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
