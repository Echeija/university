import React, { useState, useEffect } from 'react';
import { Search, Download, Filter, Book, FileText, Database, Loader2, AlertCircle, RefreshCw, Archive } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNotification } from '../contexts/NotificationContext';

interface ResourceFile {
  id: string;
  name: string;
  size: number;
  created_at: string;
  category: string;
  url: string;
}

export default function DigitalResourceLibrary() {
  const [resources, setResources] = useState<ResourceFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [error, setError] = useState<string | null>(null);
  const [bucketMissing, setBucketMissing] = useState(false);
  const { notify } = useNotification();

  const BUCKET_NAME = 'academic_resources';
  const CATEGORIES = ['All', 'Textbooks', 'Research Papers', 'Lecture Notes', 'Past Questions'];

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    setIsLoading(true);
    setError(null);
    setBucketMissing(false);
    
    try {
      const allFiles: ResourceFile[] = [];
      let anyFolderSucceeded = false;
      
      const folders = {
        'Textbooks': 'textbooks',
        'Research Papers': 'research_papers',
        'Lecture Notes': 'lecture_notes',
        'Past Questions': 'past_questions'
      };

      for (const [catName, folder] of Object.entries(folders)) {
        const { data, error } = await supabase.storage.from(BUCKET_NAME).list(folder, {
          limit: 100,
          offset: 0,
        });

        if (error) {
          console.warn(`Could not fetch folder ${folder}:`, error);
          if (error.message.toLowerCase().includes('bucket not found') || error.message.toLowerCase().includes('does not exist')) {
            setBucketMissing(true);
          }
          continue;
        }

        anyFolderSucceeded = true;

        if (data) {
          const validFiles = data
            .filter(f => f.name !== '.emptyFolderPlaceholder' && f.name !== '.DS_Store' && f.id)
            .map(f => {
              const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(`${folder}/${f.name}`);
              return {
                id: f.id || `${folder}-${f.name}`,
                name: f.name,
                size: f.metadata?.size || 0,
                created_at: f.created_at,
                category: catName,
                url: urlData.publicUrl
              };
            });
          allFiles.push(...validFiles);
        }
      }

      if (!anyFolderSucceeded && !bucketMissing) {
         // Attempt to list root to check if bucket exists at all
         const { error: rootError } = await supabase.storage.from(BUCKET_NAME).list('', { limit: 1 });
         if (rootError && (rootError.message.toLowerCase().includes('bucket not found') || rootError.message.toLowerCase().includes('does not exist'))) {
             setBucketMissing(true);
         }
      }

      setResources(allFiles);
    } catch (err: any) {
      console.error('Error fetching resources:', err);
      setError(err.message || 'Failed to connect to storage.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredResources = resources.filter(res => {
    const matchesSearch = res.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || res.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'Textbooks': return <Book className="w-5 h-5 text-indigo-500" />;
      case 'Research Papers': return <Database className="w-5 h-5 text-emerald-500" />;
      case 'Lecture Notes': return <FileText className="w-5 h-5 text-amber-500" />;
      default: return <FileText className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Archive className="w-6 h-6 text-indigo-600" />
              Digital Resource Library
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Access and download academic textbooks, research papers, and lecture notes.
            </p>
          </div>
          <button 
            onClick={fetchResources}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-colors shrink-0"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search resources by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar shrink-0">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-indigo-600">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading resources...</p>
          </div>
        ) : bucketMissing ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
              <Database className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Storage Bucket Missing</h4>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6 text-sm">
              The Supabase storage bucket <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">academic_resources</code> does not exist or is not public. 
              Please create it in your Supabase dashboard and add some files to see them here.
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Connection Error</h4>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-sm">
              {error}
            </p>
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Resources Found</h4>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-sm">
              {searchQuery 
                ? `No resources match your search "${searchQuery}" in ${selectedCategory}.` 
                : `There are currently no files available in the ${selectedCategory} category.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResources.map((file) => (
              <div 
                key={file.id} 
                className="group p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all flex flex-col h-full"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 shrink-0">
                    {getCategoryIcon(file.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate" title={file.name}>
                      {file.name}
                    </h4>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      {file.category}
                    </span>
                  </div>
                </div>
                
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {formatSize(file.size)} • {new Date(file.created_at).toLocaleDateString()}
                  </div>
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
