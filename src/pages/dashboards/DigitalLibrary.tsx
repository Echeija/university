import React, { useState, useEffect, useMemo } from 'react';
import { Search, Book, FileText, Download, Filter, File as FileIcon, ExternalLink, Library, Plus, X, UploadCloud, CheckCircle2, Edit2, Trash2 } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import { storage } from '../../lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import SkeletonLoader from '../../components/SkeletonLoader';

type Category = 'All' | 'Course Material' | 'Syllabus' | 'Lecture Slides' | 'Reading List' | 'Administrative Form' | 'Computer Science' | 'Engineering' | 'Mathematics' | 'Physics' | 'Humanities' | 'Other';

interface DocumentResource {
  id: number;
  title: string;
  description: string;
  uploaderName: string;
  category: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
}


const MOCK_RESOURCES: DocumentResource[] = [
  { id: 101, title: 'Introduction to Computer Science', description: 'Comprehensive guide covering basic computer science concepts, algorithms, and data structures.', uploaderName: 'Dr. Alan Turing', category: 'Computer Science', fileUrl: '#', fileType: 'application/pdf', fileSize: 2500000, createdAt: new Date().toISOString() },
  { id: 102, title: 'Advanced Calculus Syllabus', description: 'Course outline and reading materials for Advanced Calculus 2026.', uploaderName: 'Dr. Emmy Noether', category: 'Syllabus', fileUrl: '#', fileType: 'application/pdf', fileSize: 1200000, createdAt: new Date().toISOString() },
  { id: 103, title: 'Quantum Physics Fundamentals', description: 'Lecture notes on quantum mechanics and wave functions.', uploaderName: 'Dr. Richard Feynman', category: 'Physics', fileUrl: '#', fileType: 'application/pdf', fileSize: 3400000, createdAt: new Date().toISOString() },
  { id: 104, title: 'Student Handbook 2026', description: 'Official university policies and procedures for the academic year.', uploaderName: 'Admin', category: 'Administrative Form', fileUrl: '#', fileType: 'application/pdf', fileSize: 500000, createdAt: new Date().toISOString() }
];

export default function DigitalLibrary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [resources, setResources] = useState<DocumentResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { notify } = useNotification();
  const { user, token } = useAuth();
  
  // Upload Modal State
  const [showModal, setShowModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Course Material',
  });

  const canManage = ['Administrator', 'ICT Admin', 'Admin', 'Library', 'Lecturer', 'Student'].includes(user?.role || '');

  const fetchResources = () => {
    fetch('/api/documents', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      const docs = Array.isArray(data) ? data : [];
      setResources(docs.length > 0 ? docs : MOCK_RESOURCES);
      setIsLoading(false);
    })
    .catch(err => {
      console.error(err);
      setResources(MOCK_RESOURCES);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    fetchResources();
  }, [token]);

  const filteredResources = useMemo(() => {
    return resources.filter(resource => {
      const matchesSearch = resource.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             resource.uploaderName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || resource.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory, resources]);

  const handleDownload = (resource: DocumentResource) => {
    if (!resource.fileUrl) return;
    notify({
      title: 'Opening Resource',
      message: `Opening ${resource.title}...`,
      type: 'info'
    });
    window.open(resource.fileUrl, '_blank');
  };

  const openUploadModal = () => {
    setEditingId(null);
    setFormData({ title: '', description: '', category: 'Course Material' });
    setSelectedFile(null);
    setShowModal(true);
  };

  const openEditModal = (resource: DocumentResource) => {
    setEditingId(resource.id);
    setFormData({ 
      title: resource.title, 
      description: resource.description || '', 
      category: resource.category || 'Course Material' 
    });
    setSelectedFile(null);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setResources(resources.filter(r => r.id !== id));
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

  const handleUploadSubmit = async () => {
    if (!formData.title || (!selectedFile && !editingId)) {
      notify({ title: 'Validation Error', message: 'Title and file are required', type: 'error' });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      let downloadUrl = '';
      let fileType = '';
      let fileSize = 0;

      if (selectedFile) {
        const storageRef = ref(storage, `digital_library/${Date.now()}-${selectedFile.name}`);
        const uploadTask = uploadBytesResumable(storageRef, selectedFile);
        
        await new Promise<void>((resolve, reject) => {
          uploadTask.on('state_changed', 
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(Math.round(progress));
            }, 
            (error) => {
              console.error('Upload failed:', error);
              reject(error);
            }, 
            async () => {
              downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              fileType = selectedFile.type || 'application/octet-stream';
              fileSize = selectedFile.size;
              resolve();
            }
          );
        });
      }

      const payload: any = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        isPublic: 'true' // Digital library is usually public
      };

      if (selectedFile) {
        payload.fileUrl = downloadUrl;
        payload.fileType = fileType;
        payload.fileSize = fileSize;
      }

      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/documents/${editingId}` : '/api/documents';

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        notify({ 
          title: 'Success', 
          message: `Document ${editingId ? 'updated' : 'uploaded'} successfully`, 
          type: 'success' 
        });
        setShowModal(false);
        fetchResources();
      } else {
        const err = await res.json();
        notify({ title: 'Error', message: err.error || 'Failed to save document metadata', type: 'error' });
      }
    } catch (e) {
      console.error(e);
      notify({ title: 'Error', message: 'An unexpected error occurred', type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  const categories: Category[] = ['All', 'Course Material', 'Syllabus', 'Administrative Form', 'Computer Science', 'Engineering', 'Mathematics', 'Physics', 'Humanities', 'Other'];

  const getTypeIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="w-5 h-5" />;
    if (type.includes('image')) return <FileIcon className="w-5 h-5" />;
    return <Book className="w-5 h-5" />;
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Library className="w-8 h-8 text-emerald-600" />
            Digital Resource Library
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Access, download, and share course materials like syllabi, lecture slides, and reading lists.</p>
        </div>
        {canManage && (
          <button 
            onClick={openUploadModal}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-sm font-bold w-full md:w-auto"
          >
            <Plus className="w-5 h-5" />
            Upload Document
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-slate-900 dark:text-white"
              placeholder="Search by title, author, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            <div className="relative min-w-[150px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-4 w-4 text-slate-400" />
              </div>
              <select
                className="block w-full pl-9 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none text-slate-700 dark:text-slate-300 font-medium"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as Category)}
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <SkeletonLoader type="card" count={6} />
      ) : filteredResources.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 p-12 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 text-center">
          <Library className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No resources found</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {searchTerm ? 'We could not find any resources matching your search. Try adjusting your filters or search term.' : 'The digital library is currently empty.'}
          </p>
          {!searchTerm && canManage && (
            <button 
              onClick={openUploadModal}
              className="mt-6 px-6 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors font-medium inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Upload Document
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => (
            <div key={resource.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col hover:shadow-md transition-all group relative">
              
              {canManage && (
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditModal(resource)}
                    className="p-2 bg-white/90 backdrop-blur-sm shadow-sm text-slate-600 hover:text-blue-600 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(resource.id)}
                    className="p-2 bg-white/90 backdrop-blur-sm shadow-sm text-slate-600 hover:text-red-600 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl ${
                    resource.fileType?.includes('pdf') ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 
                    resource.fileType?.includes('image') ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' :
                    'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30'
                  }`}>
                    {getTypeIcon(resource.fileType || '')}
                  </div>
                  <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    {resource.category}
                  </span>
                </div>
                
                <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 pr-16">
                  {resource.title}
                </h3>
                
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 line-clamp-2 flex-1">
                  {resource.description || 'No description provided.'}
                </p>
                
                <div className="flex items-center gap-2 mt-auto pt-4 border-t border-slate-100 dark:border-slate-700">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-xs shrink-0">
                    {resource.uploaderName ? resource.uploaderName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {resource.uploaderName || 'Unknown User'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      Uploaded {new Date(resource.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{resource.fileType?.split('/')[1] || 'FILE'}</span>
                  <span className="text-xs text-slate-500">{formatBytes(resource.fileSize)}</span>
                </div>
                <button
                  onClick={() => handleDownload(resource)}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 text-slate-700 dark:text-slate-300 rounded-lg transition-colors text-sm font-medium shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  View/Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">{editingId ? 'Edit Resource' : 'Upload to Digital Library'}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{editingId ? 'Update resource details' : 'Share a resource with the school community.'}</p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                disabled={isUploading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Title *</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-white" 
                  placeholder="e.g. Introduction to Machine Learning PDF" 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-white resize-none" 
                  placeholder="Briefly describe this resource..." 
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Category *</label>
                <select 
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-white"
                >
                  {categories.filter(c => c !== 'All').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Upload File {editingId ? '(Optional)' : '*'}</label>
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors text-center relative group">
                  <input 
                    type="file" 
                    onChange={e => e.target.files && setSelectedFile(e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    disabled={isUploading}
                    id="digital-file-upload"
                  />
                  <label htmlFor="digital-file-upload" className="cursor-pointer flex flex-col items-center">
                    {selectedFile ? (
                      <>
                        <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-2">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300 line-clamp-1 break-all">{selectedFile.name}</span>
                        <span className="text-xs text-slate-500 mt-1">{formatBytes(selectedFile.size)}</span>
                        {!isUploading && (
                          <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedFile(null); }}
                            className="mt-3 px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 rounded-lg text-xs font-bold transition-colors"
                          >
                            Remove File
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-full shadow-sm flex items-center justify-center text-slate-400 group-hover:text-emerald-600 group-hover:scale-110 transition-all mb-2">
                          <UploadCloud className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-bold text-emerald-600 hover:text-emerald-700">Click to browse or drag and drop</span>
                        <span className="text-xs text-slate-500 mt-1">PDF, DOCX, PPTX, Images (Max 50MB)</span>
                        {editingId && <span className="text-xs text-amber-600 mt-1">Leave empty to keep existing file</span>}
                      </>
                    )}
                  </label>
                </div>
              </div>

              {isUploading && (
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 rounded-b-2xl">
              <button 
                onClick={() => setShowModal(false)}
                disabled={isUploading}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleUploadSubmit}
                disabled={isUploading || !formData.title || (!selectedFile && !editingId)}
                className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isUploading ? 'Saving...' : (editingId ? 'Save Changes' : 'Upload Resource')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
