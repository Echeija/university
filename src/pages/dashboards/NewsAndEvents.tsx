import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Tag, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import SkeletonLoader from '../../components/SkeletonLoader';

export default function NewsAndEvents() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'news' | 'events' | 'archive'>('all');
  const [archiveCategory, setArchiveCategory] = useState('All');
  const [archiveStartDate, setArchiveStartDate] = useState('');
  const [archiveEndDate, setArchiveEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch('/api/news-events', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const formattedNews = (data.news || []).map((n: any) => ({
            id: `news-${n.id}`,
            type: 'news',
            title: n.title,
            content: n.content,
            date: new Date(n.createdAt).toLocaleDateString(),
            rawDate: n.createdAt,
            category: n.category || 'News',
            author: n.author || 'Admin'
          }));
          
          const formattedEvents = (data.events || []).map((e: any) => ({
            id: `event-${e.id}`,
            type: 'event',
            title: e.title,
            content: e.description || '',
            date: new Date(e.startDate).toLocaleDateString(),
            rawDate: e.startDate,
            time: new Date(e.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            location: 'Campus', // Default
            category: e.eventType || 'Event'
          }));

          setItems([...formattedNews, ...formattedEvents]);
        }
      } catch (err) {
        console.error('Failed to load news and events:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchItems();
  }, [token]);

  const uniqueCategories = ['All', ...Array.from(new Set(items.filter(i => i.type === 'news').map(i => i.category)))];

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'archive') {
       if (item.type !== 'news') return false; // Archive is just for news based on user request ("older university announcements")
       
       const matchesCategory = archiveCategory === 'All' || item.category === archiveCategory;
       
       let matchesDate = true;
       const itemDate = new Date(item.rawDate);
       
       if (archiveStartDate) {
         matchesDate = matchesDate && itemDate >= new Date(archiveStartDate);
       }
       if (archiveEndDate) {
         const end = new Date(archiveEndDate);
         end.setHours(23, 59, 59, 999);
         matchesDate = matchesDate && itemDate <= end;
       }

       return matchesSearch && matchesCategory && matchesDate;
    }

    const matchesTab = activeTab === 'all' || item.type === activeTab;
    return matchesSearch && matchesTab;
  });


  // Featured items for carousel (using placeholder images based on id)
  const featuredItems = items.slice(0, 3).map((item, idx) => ({
    ...item,
    image: `https://images.unsplash.com/photo-${['1523050854058-8df90110c9f1', '1541339907198-e08756dedf3f', '1562774053716-65f018d09ce4'][idx % 3]}?auto=format&fit=crop&q=80&w=1200&h=400`
  }));

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredItems.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredItems.length) % featuredItems.length);
  };

  useEffect(() => {
    if (featuredItems.length === 0) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [featuredItems.length]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">

      {/* Carousel Section */}
      {!isLoading && featuredItems.length > 0 && activeTab !== 'archive' && (
        <div className="relative w-full h-[300px] md:h-[400px] rounded-2xl overflow-hidden group shadow-xl">
          {featuredItems.map((item, idx) => (
            <div 
              key={item.id}
              className={`absolute inset-0 transition-opacity duration-700 ${idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            >
              <div className="absolute inset-0 bg-slate-900/40 mix-blend-multiply z-10" />
              <img 
                src={item.image} 
                alt={item.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 z-20 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-transparent">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 ${
                  item.type === 'news' ? 'bg-blue-500 text-white' : 'bg-emerald-500 text-white'
                }`}>
                  {item.category}
                </span>
                <h2 className="text-2xl md:text-4xl font-bold text-white mb-2 max-w-3xl leading-tight">
                  {item.title}
                </h2>
                <p className="text-slate-200 line-clamp-2 max-w-2xl text-sm md:text-base">
                  {item.content}
                </p>
              </div>
            </div>
          ))}
          
          <button 
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          
          <div className="absolute bottom-4 right-6 z-30 flex gap-2">
            {featuredItems.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-2 h-2 rounded-full transition-all ${idx === currentSlide ? 'bg-white w-6' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </div>
      )}
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">News & Events</h2>
          <p className="text-slate-500 dark:text-slate-400">Stay updated with the latest campus news and upcoming events.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search news & events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all dark:text-white"
            />
          </div>
          
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('news')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'news' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              News
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'events' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              Events
            </button>
            <button
              onClick={() => setActiveTab('archive')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'archive' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              Archive
            </button>
          </div>
        </div>
      </div>

            {activeTab === 'archive' && (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Category</label>
            <select
              value={archiveCategory}
              onChange={(e) => setArchiveCategory(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
            >
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">From Date</label>
            <input
              type="date"
              value={archiveStartDate}
              onChange={(e) => setArchiveStartDate(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
            />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">To Date</label>
            <input
              type="date"
              value={archiveEndDate}
              onChange={(e) => setArchiveEndDate(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
            />
          </div>
        </div>
      )}
      {isLoading ? (
        <SkeletonLoader type="card" count={3} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <div key={item.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden hover:shadow-lg transition-all flex flex-col h-full group">
              <div className={`h-2 ${item.type === 'news' ? 'bg-blue-500' : 'bg-emerald-500'}`}></div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                    item.type === 'news' 
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                  }`}>
                    {item.category}
                  </span>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {item.date}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {item.title}
                </h3>
                
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 line-clamp-3 flex-1">
                  {item.content}
                </p>
                
                {item.type === 'event' ? (
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-700 space-y-2 mt-auto">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Clock className="w-4 h-4 text-emerald-500" />
                      <span className="font-medium text-slate-800 dark:text-slate-200">{item.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <MapPin className="w-4 h-4 text-emerald-500" />
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{item.location}</span>
                    </div>
                  </div>
                ) : (
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-700 mt-auto">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Tag className="w-4 h-4 text-blue-500" />
                      <span className="font-medium text-slate-800 dark:text-slate-200">Posted by {item.author}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="col-span-full py-16 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <Filter className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No items found</h3>
              <p className="text-slate-500 dark:text-slate-400">Try adjusting your search query or tab selection.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
