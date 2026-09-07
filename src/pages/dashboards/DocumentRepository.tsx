import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { storage } from '../../lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { FileText, Download, Trash2, Edit2, Plus, X, Search, File, UploadCloud, CheckCircle2 } from 'lucide-react';

interface DocumentItem {
  id: number;
  title: string;
  description: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  category: string;
  isPublic: string;
  createdAt: string;
  courseId: number | null;
  courseCode: string | null;
  uploaderName: string;
}

interface Course {
  id: number;
  code: string;
  title: string;
}

export default function DocumentRepository() {
  const { user, token } = useAuth();
  const { notify } = useNotification();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Course Material');
  const [courseId, setCourseId] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const categories = ['Course Material', 'Syllabus', 'Administrative Form', 'Other'];

  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/documents', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setDocuments(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setCourses(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    Promise.all([fetchDocuments(), fetchCourses()]).finally(() => setIsLoading(false));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setDocuments(documents.filter(d => d.id !== id));
        notify({ title: 'Success', message: 'Document deleted successfully', type: 'success' });
      } else {
        const data = await res.json();
        notify({ title: 'Error', message: data.error || 'Failed to delete document', type: 'error' });
      }
    } catch (e) {
      console.error(e);
      notify({ title: 'Error', message: 'Failed to delete document', type: 'error' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !selectedFile) {
      notify({ title: 'Validation Error', message: 'Title and file are required', type: 'error' });
      return;
    }

    setIsUploading(true);

    try {
      // Convert file to base64 for simplicity in this preview environment
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        
        const payload = {
          title,
          description,
          fileUrl: base64String,
          fileType: selectedFile.type || 'application/octet-stream',
          fileSize: selectedFile.size,
          category,
          courseId: courseId || null,
          isPublic
        };

        const res = await fetch('/api/documents', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const newDoc = await res.json();
          // Get course code if applicable to show in UI immediately
          const relatedCourse = courses.find(c => c.id === newDoc.courseId);
          newDoc.courseCode = relatedCourse ? relatedCourse.code : null;
          newDoc.uploaderName = user?.name || 'You';
          
          setDocuments([newDoc, ...documents]);
          notify({ title: 'Success', message: 'Document uploaded successfully', type: 'success' });
          closeModal();
        } else {
          const err = await res.json();
          notify({ title: 'Upload Failed', message: err.error || 'Failed to upload document', type: 'error' });
        }
        setIsUploading(false);
      };
      reader.readAsDataURL(selectedFile);
    } catch (e) {
      console.error(e);
      notify({ title: 'Error', message: 'An unexpected error occurred', type: 'error' });
      setIsUploading(false);
    }
  };

    const openEditModal = (doc: DocumentItem) => {
    setEditingId(doc.id);
    setTitle(doc.title);
    setDescription(doc.description || '');
    setCategory(doc.category);
    setCourseId(doc.courseId ? doc.courseId.toString() : '');
    setIsPublic(doc.isPublic === 'true');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingId(null);
    setIsModalOpen(false);
    setTitle('');
    setDescription('');
    setCategory('Course Material');
    setCourseId('');
    setIsPublic(false);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (doc.courseCode && doc.courseCode.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = activeCategory === 'All' || doc.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) return <div className="p-12 text-center text-slate-500">Loading document repository...</div>;

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-6 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Document Repository</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and access course materials, syllabi, and administrative forms.</p>
        </div>
        {user?.role !== 'Student' && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors shadow-sm"
          >
            <UploadCloud className="w-5 h-5" /> Upload Document
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex-1 overflow-hidden flex flex-col">
        <div className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-700 space-y-4 shrink-0">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search documents by title, course, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto hide-scrollbar">
              <button
                onClick={() => setActiveCategory('All')}
                className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${activeCategory === 'All' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
              >
                All Documents
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${activeCategory === cat ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/50 dark:bg-slate-900/20">
          {filteredDocs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 dark:text-slate-400 space-y-4">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                <FileText className="w-8 h-8 opacity-50" />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-700 dark:text-slate-300">No documents found</p>
                <p className="text-sm mt-1 max-w-sm mx-auto">Upload course materials, administrative forms, or syllabi to get started.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredDocs.map(doc => (
                <div key={doc.id} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      doc.category === 'Course Material' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                      doc.category === 'Syllabus' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' :
                      doc.category === 'Administrative Form' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                      'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      <File className="w-6 h-6" />
                    </div>
                    {['Administrator', 'ICT Admin', 'Admin'].includes(user?.role || '') && (
                      <>
                      <button 
                        onClick={() => openEditModal(doc)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors "
                        title="Edit Document"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(doc.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors "
                        title="Delete Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      </>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 dark:text-white line-clamp-2 mb-1" title={doc.title}>{doc.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2 h-8" title={doc.description}>{doc.description}</p>
                    
                    <div className="space-y-1.5 mb-4">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-slate-500 dark:text-slate-400">Category:</span>
                        <span className="text-slate-700 dark:text-slate-300">{doc.category}</span>
                      </div>
                      {doc.courseCode && (
                        <div className="flex items-center justify-between text-xs font-medium">
                          <span className="text-slate-500 dark:text-slate-400">Course:</span>
                          <span className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">{doc.courseCode}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-slate-500 dark:text-slate-400">Size:</span>
                        <span className="text-slate-700 dark:text-slate-300">{formatBytes(doc.fileSize)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-slate-500 dark:text-slate-400">Uploaded:</span>
                        <span className="text-slate-700 dark:text-slate-300">{new Date(doc.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <a 
                    href={doc.fileUrl} 
                    download={doc.title}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 bg-slate-50 hover:bg-emerald-50 dark:bg-slate-700 dark:hover:bg-emerald-900/30 text-slate-700 hover:text-emerald-700 dark:text-slate-300 dark:hover:text-emerald-400 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors border border-transparent group-hover:border-emerald-200 dark:group-hover:border-emerald-800 text-sm mt-auto"
                  >
                    <Download className="w-4 h-4" /> Download
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg shadow-xl overflow-hidden border border-slate-100 dark:border-slate-700">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-emerald-600" />
                {editingId ? 'Edit Document' : 'Upload Document'}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-white dark:bg-slate-700 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Document Title *</label>
                <input 
                  required
                  type="text" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm"
                  placeholder="e.g. CS101 Syllabus Fall 2026"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Description</label>
                <textarea 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={2}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm resize-none"
                  placeholder="Brief description of the document..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Category *</label>
                  <select 
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Related Course</label>
                  <select 
                    value={courseId}
                    onChange={e => setCourseId(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm"
                  >
                    <option value="">None (General)</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>{course.code} - {course.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">File *</label>
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <input 
                    type="file" 
                    required
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                    {selectedFile ? (
                      <>
                        <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-2">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{selectedFile.name}</span>
                        <span className="text-xs text-slate-500 mt-1">{formatBytes(selectedFile.size)}</span>
                      </>
                    ) : (
                      <>
                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full flex items-center justify-center mb-2">
                          <UploadCloud className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-bold text-emerald-600 hover:text-emerald-700">Click to browse</span>
                        <span className="text-xs text-slate-500 mt-1">PDF, DOCX, PPTX up to 50MB</span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {category === 'Administrative Form' || category === 'Other' ? (
                <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-xl mt-4">
                  <input 
                    type="checkbox" 
                    id="isPublic" 
                    checked={isPublic} 
                    onChange={e => setIsPublic(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <label htmlFor="isPublic" className="text-sm text-amber-800 dark:text-amber-500 font-medium cursor-pointer">
                    Make visible to all students (Public)
                  </label>
                </div>
              ) : null}

              <div className="pt-6 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-700 mt-6">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="px-5 py-2.5 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isUploading || !selectedFile || !title}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isUploading ? (
                    <>Saving...</>
                  ) : (
                    <><UploadCloud className="w-4 h-4" /> {editingId ? 'Save Changes' : 'Upload Document'}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
