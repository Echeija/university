
import React, { useState, useEffect } from 'react';
import { FileText, Clock, Download, ChevronRight, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { Link } from 'react-router-dom';

export default function RecentMaterialsWidget() {
  const { token } = useAuth();
  const { notify } = useNotification();
  const [materials, setMaterials] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMaterials = () => {
    fetch('/api/student/recent-documents', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setMaterials(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setMaterials([]);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchMaterials();
  }, [token]);

  const toggleFavorite = (e: React.MouseEvent, docId: number) => {
    e.preventDefault();
    e.stopPropagation();
    fetch(`/api/student/favorite-documents/${docId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if(data.success) {
        setMaterials(materials.map(m => m.id === docId ? { ...m, isFavorite: data.favorited } : m));
        notify({ title: 'Success', message: data.favorited ? 'Added to favorites' : 'Removed from favorites', type: 'success' });
      }
    })
    .catch((e) => { if (e.message !== "Failed to fetch") console.error(e) });
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-500" />
            Recent Materials
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Latest uploads from your courses</p>
        </div>
        <Link to="/student/library" className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1 transition-colors">
          View All <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          </div>
        ) : materials.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <div className="w-12 h-12 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-3">
              <FileText className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">No recent materials found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {materials.map((doc) => (
              <a 
                key={doc.id}
                href={doc.fileUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-600 cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">{doc.title}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{doc.courseCode}</span>
                      <span className="text-xs text-slate-300 dark:text-slate-600">•</span>
                      <span className="text-[10px] uppercase tracking-wider font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded">
                        {doc.category || 'Course Material'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => toggleFavorite(e, doc.id)}
                    className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all shrink-0 ${doc.isFavorite ? 'bg-red-50 border-red-200 text-red-500 dark:bg-red-900/30 dark:border-red-800' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-red-500 hover:border-red-200 dark:hover:border-red-800'}`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${doc.isFavorite ? 'fill-current' : ''}`} />
                  </button>
                  <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-emerald-600 group-hover:border-emerald-200 dark:group-hover:border-emerald-800 shadow-sm transition-all group-hover:shadow group-hover:scale-105 shrink-0">
                    <Download className="w-3.5 h-3.5" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
