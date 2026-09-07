import React, { useState, useEffect } from 'react';
import { Newspaper, ChevronRight, Calendar, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Skeleton } from './ui/Skeleton';

interface NewsItem {
  id: number;
  title: string;
  content: string;
  author: string;
  category: string;
  imageUrl: string | null;
  createdAt: string;
}

export default function UniversityNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/public/news')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setNews(data);
        } else {
          setNews([]);
        }
      })
      .catch(e => {
        console.error(e);
        setNews([]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full flex flex-col">
        <div className="flex items-center gap-2 mb-6">
          <Skeleton className="w-6 h-6 rounded-md" />
          <Skeleton className="h-6 w-40" />
        </div>
        <div className="space-y-4 flex-grow">
          {[1, 2, 3].map(i => (
            <div key={i}><Skeleton  className="h-24 w-full rounded-xl" /></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <Newspaper className="w-6 h-6" />
          </div>
          University News
        </h2>
        <Link to="#" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group">
          View All <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="space-y-6 flex-grow">
        {news.length === 0 ? (
          <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 rounded-2xl">
            <Newspaper className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No recent announcements found.</p>
          </div>
        ) : (
          news.map((item) => (
            <div key={item.id} className="group flex gap-5 items-start">
              {item.imageUrl ? (
                <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden shadow-sm">
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              ) : (
                <div className="w-16 h-16 shrink-0 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:border-indigo-100 transition-colors">
                  <Newspaper className="w-6 h-6 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    item.category === 'Alert' ? 'bg-rose-100 text-rose-700' :
                    item.category === 'Tip' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-indigo-100 text-indigo-700'
                  }`}>
                    {item.category}
                  </span>
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                
                <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight mb-2 line-clamp-2">
                  <Link to="#">{item.title}</Link>
                </h3>
                
                <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                  {item.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
