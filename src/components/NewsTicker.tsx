import { useState, useEffect, useMemo } from 'react';
import { Megaphone, Filter } from 'lucide-react';

interface NewsItem {
  id: string;
  text: string;
  category: 'Academic' | 'Events' | 'Emergency' | 'General';
}

const mockNews: NewsItem[] = [
  { id: '1', text: 'Important: Course registration deadline for the Fall semester has been extended to August 15th.', category: 'Academic' },
  { id: '2', text: 'Upcoming Event: Annual Tech Symposium 2026 starting September 10th in the Main Auditorium.', category: 'Events' },
  { id: '3', text: 'Result Checking: First-semester examination results are now available on the student portal.', category: 'Academic' },
  { id: '4', text: 'Library Update: The digital library now includes over 50,000 new research papers.', category: 'Academic' },
  { id: '5', text: 'Hostel Allocation: Phase 2 hostel balloting commences next Monday at 10:00 AM.', category: 'General' },
  { id: '6', text: 'Emergency: South gate is temporarily closed due to maintenance. Please use the West gate.', category: 'Emergency' },
];

export default function NewsTicker() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    // Simulate an API fetch
    const fetchNews = async () => {
      // Fake delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setNews(mockNews);
    };
    fetchNews();
  }, []);

  const filteredNews = useMemo(() => {
    if (selectedCategory === 'All') return news;
    return news.filter(item => item.category === selectedCategory);
  }, [news, selectedCategory]);

  const categories = ['All', 'Academic', 'Events', 'Emergency', 'General'];

  if (news.length === 0) return null;

  return (
    <div className="bg-slate-900 text-white overflow-hidden relative flex items-center border-b border-emerald-500/30">
      {/* Ticker label */}
      <div className="bg-emerald-600 px-4 py-2 z-20 flex items-center gap-2 font-bold uppercase tracking-wider text-xs whitespace-nowrap shadow-[4px_0_10px_rgba(0,0,0,0.5)]">
        <Megaphone className="w-4 h-4" />
        Latest Campus News
      </div>
      
      {/* Dropdown Filter */}
      <div className="bg-slate-800 z-20 border-r border-slate-700 h-full flex items-center px-2">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-transparent text-xs font-bold uppercase tracking-wider text-emerald-400 focus:outline-none appearance-none cursor-pointer py-2 pl-2 pr-6 relative"
          style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2334d399%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.4-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '8px auto' }}
        >
          {categories.map(cat => (
            <option key={cat} value={cat} className="bg-slate-800 text-white">
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Ticker content container */}
      <div className="flex-1 overflow-hidden relative">
        {filteredNews.length > 0 ? (
          <div className="animate-ticker flex whitespace-nowrap" style={{ animationDuration: `${Math.max(20, filteredNews.length * 10)}s` }}>
            {filteredNews.map((item) => (
              <span key={item.id} className="mx-8 text-sm text-slate-300 font-medium inline-block">
                <span className={`mr-2 font-bold uppercase text-[10px] px-2 py-0.5 rounded-full ${
                  item.category === 'Emergency' ? 'bg-red-500/20 text-red-400' :
                  item.category === 'Academic' ? 'bg-blue-500/20 text-blue-400' :
                  item.category === 'Events' ? 'bg-purple-500/20 text-purple-400' :
                  'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {item.category}
                </span>
                {item.text}
              </span>
            ))}
            {/* Duplicate the items for seamless loop */}
            {filteredNews.map((item) => (
              <span key={`dup-${item.id}`} className="mx-8 text-sm text-slate-300 font-medium inline-block">
                <span className={`mr-2 font-bold uppercase text-[10px] px-2 py-0.5 rounded-full ${
                  item.category === 'Emergency' ? 'bg-red-500/20 text-red-400' :
                  item.category === 'Academic' ? 'bg-blue-500/20 text-blue-400' :
                  item.category === 'Events' ? 'bg-purple-500/20 text-purple-400' :
                  'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {item.category}
                </span>
                {item.text}
              </span>
            ))}
          </div>
        ) : (
          <div className="px-8 text-sm text-slate-500 font-medium whitespace-nowrap">
            No active announcements for this category.
          </div>
        )}
      </div>
    </div>
  );
}
