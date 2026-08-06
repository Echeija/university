import React, { useState, useEffect } from 'react';
import { Search, Book, Bookmark, BookOpen, Plus, Edit2, Trash2, X, UploadCloud, File, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotification } from '../../../contexts/NotificationContext';
import { storage } from '../../../lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import SkeletonLoader from '../../../components/SkeletonLoader';

export default function LibraryManagement() {
  const { user, token } = useAuth();
  const { notify } = useNotification();
  
  const [books, setBooks] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    author: '',
    category: '',
    coverColor: 'bg-slate-200',
    fileUrl: '',
    fileType: '',
    fileSize: 0
  });

  const fetchBooks = () => {
    fetch('/api/library/books', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      setBooks(Array.isArray(data) ? data : []);
      setIsLoading(false);
    })
    .catch((e) => { if (e.message !== "Failed to fetch") console.error(e) });
  };

  useEffect(() => {
    fetchBooks();
  }, [token]);

  const openAddModal = () => {
    setFormData({
      id: '',
      title: '',
      author: '',
      category: '',
      coverColor: 'bg-emerald-600',
      fileUrl: '',
      fileType: '',
      fileSize: 0
    });
    setSelectedFile(null);
    setShowModal(true);
  };

  const openEditModal = (book: any) => {
    setFormData({
      id: book.id,
      title: book.title,
      author: book.author,
      category: book.category,
      coverColor: book.coverColor,
      fileUrl: book.fileUrl || '',
      fileType: book.fileType || '',
      fileSize: book.fileSize || 0
    });
    setSelectedFile(null);
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this book?')) {
      fetch(`/api/library/books/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(async res => {
        const data = await res.json();
        if(res.ok && data.success) {
          notify({ title: 'Success', message: 'Book deleted', type: 'success' });
          fetchBooks();
        } else {
          notify({ title: 'Error', message: data.error || 'Failed to delete book', type: 'error' });
        }
      })
      .catch(err => {
        console.error(err);
        notify({ title: 'Error', message: 'Failed to delete book', type: 'error' });
      });
    }
  };

  const handleSave = () => {
    const isEditing = !!formData.id;
    const url = isEditing ? `/api/library/books/${formData.id}` : '/api/library/books';
    const method = isEditing ? 'PUT' : 'POST';
    
    const submitData = async () => {
      let finalData = { ...formData };
      
      if (selectedFile) {
        setIsUploading(true);
        
        try {
          const storageRef = ref(storage, `library/${Date.now()}-${selectedFile.name}`);
          const uploadTask = await uploadBytesResumable(storageRef, selectedFile);
          const downloadUrl = await getDownloadURL(storageRef);
          
          finalData.fileUrl = downloadUrl;
          finalData.fileType = selectedFile.type;
          finalData.fileSize = selectedFile.size;
        } catch (error) {
          console.error('Firebase upload failed:', error);
          notify({ title: 'Upload Failed', message: 'Failed to upload document to storage.', type: 'error' });
          setIsUploading(false);
          return;
        }
      }

      fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(finalData)
      })
      .then(res => res.json())
      .then(data => {
        setIsUploading(false);
        if(data.error) {
          notify({ title: 'Error', message: data.error, type: 'error' });
        } else {
          notify({ title: 'Success', message: `Book ${isEditing ? 'updated' : 'added'}`, type: 'success' });
          setShowModal(false);
          fetchBooks();
        }
      })
      .catch(err => {
        console.error(err);
        setIsUploading(false);
        notify({ title: 'Error', message: 'Failed to save book', type: 'error' });
      });
    };
    
    submitData();
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
  }

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Library Resource Management</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage physical books and upload e-resources.</p>
        </div>
        {['Administrator', 'ICT Admin', 'Admin', 'Library'].includes(user?.role || '') && (
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Resource
        </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mb-4">
            <Book className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white mb-1">Total Resources</h3>
          <p className="text-3xl font-black text-slate-900 dark:text-white mb-4">{books.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-4">
            <Bookmark className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white mb-1">Available E-Resources</h3>
          <p className="text-3xl font-black text-slate-900 dark:text-white mb-4">{books.filter(b => b.fileUrl).length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center mb-4">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white mb-1">Borrowed (Physical)</h3>
          <p className="text-3xl font-black text-slate-900 dark:text-white mb-4">{books.filter(b => !b.available).length}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-slate-800 dark:text-white transition-all text-sm"
              placeholder="Search books by title, author, or category..."
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Resource Info</th>
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type / Category</th>
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="p-4">
                    <SkeletonLoader type="table" count={5} />
                  </td>
                </tr>
              ) : filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">
                    <Book className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="font-medium">No resources found in the catalog.</p>
                  </td>
                </tr>
              ) : (
                filteredBooks.map((book) => (
                  <tr key={book.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded shadow-sm ${book.coverColor || 'bg-slate-200'} flex items-center justify-center flex-shrink-0 relative overflow-hidden`}>
                           <div className="absolute inset-0 bg-black/10 mix-blend-multiply"></div>
                           {book.fileUrl ? <File className="w-5 h-5 text-white/80" /> : <Book className="w-5 h-5 text-white/50" />}
                        </div>
                        <div>
                          {book.fileUrl ? (
                            <a href={book.fileUrl} target="_blank" rel="noopener noreferrer" className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline text-sm line-clamp-1">
                              {book.title}
                            </a>
                          ) : (
                            <p className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">{book.title}</p>
                          )}
                          <p className="text-xs text-slate-500 dark:text-slate-400">{book.author}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center w-max px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700">
                          {book.category}
                        </span>
                        {book.fileUrl && (
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">
                            E-Resource • {formatBytes(book.fileSize)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      {book.fileUrl ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span> Digital
                        </span>
                      ) : book.available ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Available
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                          <span className="w-2 h-2 rounded-full bg-amber-500"></span> Borrowed
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {['Administrator', 'ICT Admin', 'Admin', 'Library'].includes(user?.role || '') && (
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(book)}
                          className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(book.id)}
                          className="p-1 text-slate-400 hover:text-red-600 transition-colors" 
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-800 z-10">
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                  {formData.id ? 'Edit Resource' : 'Add New Resource'}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Enter details or upload a digital file.</p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
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
                  placeholder="Resource title" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Author / Uploader *</label>
                <input 
                  type="text" 
                  value={formData.author}
                  onChange={e => setFormData({...formData, author: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-white" 
                  placeholder="Author name" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Category *</label>
                <input 
                  type="text" 
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-white" 
                  placeholder="e.g. Computer Science, Physics..." 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Cover Color</label>
                <div className="flex gap-2 flex-wrap">
                  {['bg-emerald-600', 'bg-blue-600', 'bg-indigo-600', 'bg-purple-600', 'bg-rose-600', 'bg-amber-600', 'bg-slate-800'].map(color => (
                    <button
                      key={color}
                      onClick={() => setFormData({...formData, coverColor: color})}
                      className={`w-8 h-8 rounded-full ${color} ${formData.coverColor === color ? 'ring-2 ring-offset-2 ring-slate-400 dark:ring-offset-slate-800' : ''}`}
                    />
                  ))}
                </div>
              </div>

              {/* File Upload Section */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Resource File (Optional)</label>
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors text-center relative group">
                  <input 
                    type="file" 
                    onChange={e => e.target.files && setSelectedFile(e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
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
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedFile(null); }}
                          className="mt-2 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 px-2 py-1 rounded"
                        >
                          Remove
                        </button>
                      </>
                    ) : formData.fileUrl ? (
                       <>
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2">
                          <File className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Existing File Attached</span>
                        <span className="text-xs text-slate-500 mt-1 font-bold text-emerald-600 hover:text-emerald-700">Click to replace</span>
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setFormData({...formData, fileUrl: '', fileType: '', fileSize: 0}); }}
                          className="mt-2 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 px-2 py-1 rounded"
                        >
                          Remove File
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-full shadow-sm flex items-center justify-center text-slate-400 group-hover:text-emerald-600 group-hover:scale-110 transition-all mb-2">
                          <UploadCloud className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-bold text-emerald-600 hover:text-emerald-700">Click to browse or drag and drop</span>
                        <span className="text-xs text-slate-500 mt-1">PDF, DOC, PPTX, MP4, MP3, Images</span>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 sticky bottom-0">
              <button 
                onClick={() => setShowModal(false)}
                disabled={isUploading}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={isUploading || !formData.title || !formData.author || !formData.category}
                className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isUploading ? 'Uploading...' : 'Save Resource'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
