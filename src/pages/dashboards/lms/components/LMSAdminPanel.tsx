import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { 
  FileText, BookOpen, Users, UserCheck, 
  Trash2, Search, Filter, Activity 
} from 'lucide-react';
import { useNotification } from '../../../../contexts/NotificationContext';

export default function LMSAdminPanel() {
  const { token } = useAuth();
  const { notify } = useNotification();
  const [stats, setStats] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  useEffect(() => {
    fetch('/api/admin/lms-stats', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.json()).then(setStats).catch((e) => { if (e.message !== "Failed to fetch") console.error(e) });

    fetchDocuments();
  }, [token]);

  const fetchDocuments = () => {
    fetch('/api/admin/documents', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.json()).then(setDocuments).catch((e) => { if (e.message !== "Failed to fetch") console.error(e) });
  };

  const handleDelete = (id: number) => {
    if (!confirm('Are you sure you want to delete this material?')) return;
    
    fetch(`/api/documents/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(() => {
      setDocuments(prev => prev.filter(d => d.id !== id));
      notify({ title: 'Success', message: 'Material deleted', type: 'success' });
      
      // Update stats
      if (stats) {
        setStats({ ...stats, totalDocuments: Math.max(0, stats.totalDocuments - 1) });
      }
    })
    .catch(() => notify({ title: 'Error', message: 'Failed to delete material', type: 'error' }));
  };

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (doc.courseCode && doc.courseCode.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'All' || doc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Materials</p>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white">{stats?.totalDocuments || 0}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Active Courses</p>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white">{stats?.totalCourses || 0}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Active Lecturers</p>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white">{stats?.totalLecturers || 0}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Enrolled Students</p>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white">{stats?.totalStudents || 0}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col h-[600px]">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-500" /> All Learning Materials
            </h3>
            <p className="text-sm text-slate-500 mt-1">Manage global learning resources</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search materials..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:border-emerald-500 outline-none transition-colors"
              />
            </div>
            <select 
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:border-emerald-500 outline-none transition-colors appearance-none"
            >
              <option value="All">All Categories</option>
              <option value="Course Material">Course Material</option>
              <option value="Lecture Slides">Lecture Slides</option>
              <option value="Syllabus">Syllabus</option>
              <option value="Assignment">Assignment</option>
              <option value="Reading Material">Reading Material</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-900/50 sticky top-0 z-10">
              <tr>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">Material</th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">Course</th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">Category</th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">Size</th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">Uploader</th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 dark:text-slate-400">
                    No learning materials found
                  </td>
                </tr>
              ) : (
                filteredDocs.map(doc => (
                  <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4 text-slate-500" />
                        </div>
                        <span className="font-medium text-slate-800 dark:text-slate-200 line-clamp-1" title={doc.title}>{doc.title}</span>
                      </div>
                    </td>
                    <td className="py-3 px-6">
                      <span className="inline-flex px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold font-mono">
                        {doc.courseCode || 'Global'}
                      </span>
                    </td>
                    <td className="py-3 px-6">
                      <span className="inline-flex px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium border border-emerald-100 dark:border-emerald-800">
                        {doc.category}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-sm text-slate-600 dark:text-slate-400">
                      {(doc.fileSize / (1024 * 1024)).toFixed(2)} MB
                    </td>
                    <td className="py-3 px-6 text-sm text-slate-600 dark:text-slate-400">
                      {doc.uploaderName || 'Unknown'}
                    </td>
                    <td className="py-3 px-6 text-right">
                      <button 
                        onClick={() => handleDelete(doc.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Delete Material"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
