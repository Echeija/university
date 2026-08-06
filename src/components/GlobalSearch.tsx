import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, FileText, BookOpen, Megaphone, X, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

interface SearchResult {
  id: string;
  title: string;
  type: 'page' | 'course' | 'news';
  url: string;
  snippet: string;
}

const mockIndex: SearchResult[] = [
  { id: '1', title: 'Admissions Process 2026', type: 'page', url: '/admissions', snippet: 'Learn about the requirements and steps to apply for the upcoming academic year.' },
  { id: '2', title: 'Faculty of Engineering', type: 'page', url: '/faculties', snippet: 'Explore our world-class engineering programs and research facilities.' },
  { id: '3', title: 'About Smart Global College', type: 'page', url: '/about', snippet: 'Discover our history, mission, and vision for the future of education.' },
  { id: '4', title: 'CSC 301: Introduction to Artificial Intelligence', type: 'course', url: '#', snippet: 'Core course covering machine learning, neural networks, and search algorithms.' },
  { id: '5', title: 'ENG 204: Thermodynamics', type: 'course', url: '#', snippet: 'Fundamental principles of energy, heat, and work in engineering systems.' },
  { id: '6', title: 'Fall Semester Registration Deadline Extended', type: 'news', url: '#', snippet: 'Students now have until August 15th to complete their course registration.' },
  { id: '7', title: 'Annual Tech Symposium 2026', type: 'news', url: '#', snippet: 'Join us for three days of keynotes, workshops, and student showcases.' },
];

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      const lowerQuery = query.toLowerCase();
      const filtered = mockIndex.filter(item => 
        item.title.toLowerCase().includes(lowerQuery) || 
        item.snippet.toLowerCase().includes(lowerQuery)
      );
      setResults(filtered);
      setIsSearching(false);
    }, 400); // Simulate AI search latency

    return () => clearTimeout(timer);
  }, [query]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'page': return <FileText className="w-5 h-5 text-blue-500" />;
      case 'course': return <BookOpen className="w-5 h-5 text-emerald-500" />;
      case 'news': return <Megaphone className="w-5 h-5 text-amber-500" />;
      default: return <FileText className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg transition-colors border border-slate-200/50 group w-full md:w-auto md:min-w-[200px]"
      >
        <Search className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
        <span className="text-sm font-medium mr-auto">Search...</span>
        <span className="hidden md:flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white text-slate-400 border border-slate-200 shadow-sm">
          <kbd>⌘</kbd><kbd>K</kbd>
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="fixed top-[10%] left-1/2 -translate-x-1/2 w-[90%] max-w-2xl bg-white rounded-2xl shadow-2xl z-[101] overflow-hidden border border-slate-100 flex flex-col max-h-[80vh]"
            >
              <div className="flex items-center px-4 py-4 border-b border-slate-100 bg-slate-50/50">
                <Search className="w-5 h-5 text-emerald-600 mr-3 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Ask anything or search pages, courses, news..."
                  className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-slate-800 text-lg placeholder:text-slate-400 font-medium"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                {isSearching ? (
                  <Loader2 className="w-5 h-5 text-emerald-500 animate-spin ml-3 shrink-0" />
                ) : (
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-md transition-colors ml-3 shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="overflow-y-auto flex-1 bg-white">
                {query.trim() === '' ? (
                  <div className="p-8 text-center flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-4">
                      <Search className="w-8 h-8" />
                    </div>
                    <p className="text-slate-600 font-medium">Search the SGCT knowledge base</p>
                    <p className="text-slate-400 text-sm mt-1">Powered by AI to find exactly what you need</p>
                  </div>
                ) : results.length > 0 ? (
                  <div className="p-2">
                    {/* Results grouped by type */}
                    {['page', 'course', 'news'].map(type => {
                      const typeResults = results.filter(r => r.type === type);
                      if (typeResults.length === 0) return null;
                      
                      return (
                        <div key={type} className="mb-4 last:mb-0">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-3 py-2">
                            {type === 'page' ? 'University Pages' : type === 'course' ? 'Courses' : 'News & Updates'}
                          </h3>
                          <ul className="space-y-1">
                            {typeResults.map(result => (
                              <li key={result.id}>
                                <Link 
                                  to={result.url}
                                  onClick={() => setIsOpen(false)}
                                  className="flex items-start p-3 hover:bg-slate-50 rounded-xl transition-colors group"
                                >
                                  <div className="w-10 h-10 bg-white rounded-lg border border-slate-100 flex items-center justify-center shadow-sm shrink-0 mr-4 group-hover:border-emerald-200 group-hover:bg-emerald-50 transition-colors">
                                    {getIcon(result.type)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-slate-800 font-bold flex items-center gap-2">
                                      {result.title}
                                      <ExternalLink className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </h4>
                                    <p className="text-sm text-slate-500 mt-1 line-clamp-1">{result.snippet}</p>
                                  </div>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-12 text-center flex flex-col items-center justify-center">
                    <p className="text-slate-600 font-medium">No results found for "{query}"</p>
                    <p className="text-slate-400 text-sm mt-1">Try adjusting your search terms</p>
                  </div>
                )}
              </div>
              
              <div className="bg-slate-50 border-t border-slate-100 p-3 px-4 flex justify-between items-center text-xs text-slate-400">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1"><kbd className="bg-white border border-slate-200 px-1 rounded shadow-sm font-sans">↑</kbd><kbd className="bg-white border border-slate-200 px-1 rounded shadow-sm font-sans">↓</kbd> to navigate</span>
                  <span className="flex items-center gap-1"><kbd className="bg-white border border-slate-200 px-1.5 rounded shadow-sm font-sans">↵</kbd> to select</span>
                </div>
                <span className="font-medium text-emerald-600 flex items-center gap-1">
                  ✨ AI-Powered Search
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
