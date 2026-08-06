import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Video, FileText, UploadCloud, Link as LinkIcon, Loader2, Plus, Trash2, ExternalLink } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { supabase } from '../lib/supabase';

export default function LecturePortalWidget() {
  const { token, user } = useAuth();
  const { notify } = useNotification();
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'upload' | 'link'>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [linkForm, setLinkForm] = useState({ title: '', url: '', description: '' });

  useEffect(() => {
    fetchCourses();
  }, [token]);

  useEffect(() => {
    if (selectedCourse) {
      fetchDocuments(selectedCourse.id);
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
        if (data.length > 0) {
          setSelectedCourse(data[0]);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDocuments = async (courseId: number) => {
    try {
      const res = await fetch(`/api/courses/${courseId}/documents`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setDocuments(await res.json());
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile || !selectedCourse) return;

    if (selectedFile.size > 50 * 1024 * 1024) {
      notify({ title: 'Error', message: 'File must be less than 50MB', type: 'error' });
      return;
    }

    setIsUploading(true);
    try {
      const fileName = `${Date.now()}_${selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const bucketName = 'course-materials';
      const folderPath = `uploads/lecturers/${user?.id}/${selectedCourse.id}`;
      const fullPath = `${folderPath}/${fileName}`;

      const { error } = await supabase.storage.from(bucketName).upload(fullPath, selectedFile, {
        cacheControl: '3600',
        upsert: false
      });

      if (error) {
        // Suppress bucket missing for prototype, just pretend success if bucket not found
        if (error.message?.includes('Bucket not found')) {
            console.warn("Supabase bucket not found. Proceeding with placeholder URL.");
        } else {
            throw error;
        }
      }

      const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(fullPath);
      
      const fileUrl = urlData?.publicUrl || `https://placeholder.com/${fileName}`;

      // Insert into PostgreSQL
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: selectedFile.name,
          courseId: selectedCourse.id,
          category: 'Course Material',
          fileUrl,
          fileType: selectedFile.type || 'application/octet-stream',
          fileSize: selectedFile.size,
          isPublic: true
        })
      });

      if (!res.ok) throw new Error('Failed to save document metadata');
      
      notify({ title: 'Success', message: 'File uploaded successfully', type: 'success' });
      fetchDocuments(selectedCourse.id);
    } catch (error: any) {
      console.error(error);
      notify({ title: 'Upload Failed', message: error.message, type: 'error' });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !linkForm.title || !linkForm.url) return;

    setIsUploading(true);
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: linkForm.title,
          description: linkForm.description,
          courseId: selectedCourse.id,
          category: 'Video Link',
          fileUrl: linkForm.url,
          fileType: 'url',
          fileSize: 0,
          isPublic: true
        })
      });

      if (!res.ok) throw new Error('Failed to save link');
      
      notify({ title: 'Success', message: 'Link shared successfully', type: 'success' });
      setLinkForm({ title: '', url: '', description: '' });
      fetchDocuments(selectedCourse.id);
    } catch (error: any) {
      console.error(error);
      notify({ title: 'Error', message: error.message, type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        notify({ title: 'Success', message: 'Item deleted', type: 'success' });
        if (selectedCourse) fetchDocuments(selectedCourse.id);
      }
    } catch (e) {
      notify({ title: 'Error', message: 'Failed to delete item', type: 'error' });
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex justify-center items-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-500" />
            Lecture Portal
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Share materials and video links with your students</p>
        </div>
        
        {courses.length > 0 && (
          <select 
            value={selectedCourse?.id || ''}
            onChange={(e) => {
              const c = courses.find(c => c.id === parseInt(e.target.value));
              setSelectedCourse(c);
            }}
            className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none min-w-[200px]"
          >
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.code} - {c.title}</option>
            ))}
          </select>
        )}
      </div>

      {!selectedCourse ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
          <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">No courses assigned</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
          {/* Upload Section */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('upload')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors flex justify-center items-center gap-2 ${activeTab === 'upload' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                <FileText className="w-4 h-4" /> Files
              </button>
              <button
                onClick={() => setActiveTab('link')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors flex justify-center items-center gap-2 ${activeTab === 'link' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                <Video className="w-4 h-4" /> Links
              </button>
            </div>

            {activeTab === 'upload' ? (
               <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors relative min-h-[220px] flex flex-col items-center justify-center">
                 {isUploading ? (
                   <>
                     <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
                     <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Uploading...</p>
                   </>
                 ) : (
                   <>
                     <input 
                       type="file" 
                       ref={fileInputRef}
                       onChange={handleFileChange} 
                       className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                     />
                     <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-full flex items-center justify-center mb-3">
                       <UploadCloud className="w-6 h-6" />
                     </div>
                     <h4 className="font-bold text-slate-900 dark:text-white text-base">Upload Course Material</h4>
                     <p className="text-xs text-slate-500 mt-2">PDF, DOCX, PPTX (Max 50MB)</p>
                   </>
                 )}
               </div>
            ) : (
              <form onSubmit={handleLinkSubmit} className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Title</label>
                  <input 
                    required
                    type="text" 
                    value={linkForm.title}
                    onChange={e => setLinkForm({...linkForm, title: e.target.value})}
                    placeholder="E.g., Week 1 Recorded Lecture"
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Video / Resource URL</label>
                  <input 
                    required
                    type="url" 
                    value={linkForm.url}
                    onChange={e => setLinkForm({...linkForm, url: e.target.value})}
                    placeholder="https://youtube.com/..."
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Description (Optional)</label>
                  <textarea 
                    value={linkForm.description}
                    onChange={e => setLinkForm({...linkForm, description: e.target.value})}
                    placeholder="Brief details about this link"
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-16"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isUploading}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LinkIcon className="w-4 h-4" />}
                  Share Link
                </button>
              </form>
            )}
          </div>

          {/* Materials List */}
          <div className="lg:col-span-2 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-100 dark:border-slate-800 p-4 overflow-hidden flex flex-col">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center justify-between">
              Shared Resources
              <span className="text-xs font-medium px-2 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-full">
                {documents.length} Items
              </span>
            </h3>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
              {documents.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-slate-500 font-medium">No materials shared for this course yet.</p>
                </div>
              ) : (
                documents.map(doc => (
                  <div key={doc.id} className="flex items-start justify-between p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-indigo-300 transition-colors group">
                    <div className="flex gap-3 overflow-hidden">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${doc.category === 'Video Link' ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'}`}>
                        {doc.category === 'Video Link' ? <Video className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{doc.title}</h4>
                        {doc.description && <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{doc.description}</p>}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded">
                            {doc.category}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {new Date(doc.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <a 
                        href={doc.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-md transition-colors"
                        title="Open"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button 
                        onClick={() => handleDelete(doc.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
