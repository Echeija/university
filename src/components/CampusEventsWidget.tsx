import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Filter, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface CampusEvent {
  id: number;
  title: string;
  type: string;
  start_time: string;
  end_time: string;
  location?: string;
  description?: string;
}

type Category = 'All' | 'Academic' | 'Social' | 'Lecture' | 'Exam';

export default function CampusEventsWidget() {
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  
  const categories: Category[] = ['All', 'Academic', 'Social', 'Lecture', 'Exam'];

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let query = supabase
          .from('campus_events')
          .select('*')
          .gte('start_time', new Date().toISOString())
          .order('start_time', { ascending: true })
          .limit(20);

        if (selectedCategory !== 'All') {
          query = query.eq('type', selectedCategory);
        }

        const { data, error } = await query;

        if (error) {
          throw error;
        }

        setEvents(data || []);
      } catch (err: any) {
        console.error('Error fetching campus events:', err);
        setError('Failed to load events from Supabase. Ensure "campus_events" table exists.');
        setEvents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [selectedCategory]);

  const getMonth = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleString('en-US', { month: 'short' });
  };

  const getDay = (dateString: string) => {
    const d = new Date(dateString);
    return d.getDate();
  };

  const getTime = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
  };

  const getEventColor = (type: string) => {
    if (type.includes('Exam') || type.includes('Deadline') || type === 'Academic') 
      return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800';
    if (type === 'Social')
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-500" />
          Campus Events
        </h3>
      </div>
      
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        <Filter className="w-4 h-4 text-slate-400 shrink-0" />
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap transition-colors ${
              selectedCategory === category 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
      
      <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-4 text-center h-full bg-red-50 dark:bg-red-900/10 rounded-xl">
            <AlertCircle className="w-6 h-6 text-red-500 mb-2" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-6 text-slate-500 dark:text-slate-400 h-full flex flex-col items-center justify-center">
            <Calendar className="w-8 h-8 opacity-20 mx-auto mb-2" />
            <p className="text-sm">No upcoming {selectedCategory !== 'All' ? selectedCategory.toLowerCase() : ''} events scheduled.</p>
          </div>
        ) : (
          events.map(event => (
            <div key={event.id} className="flex gap-4 items-center group p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
              <div className="flex flex-col items-center justify-center bg-indigo-50 dark:bg-indigo-900/30 rounded-xl p-2 min-w-[3.5rem] border border-indigo-100 dark:border-indigo-800/50 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  {getMonth(event.start_time)}
                </span>
                <span className="text-xl font-black text-indigo-900 dark:text-indigo-200 leading-tight">
                  {getDay(event.start_time)}
                </span>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">{event.title}</h4>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {getTime(event.start_time)}
                  </span>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${getEventColor(event.type)}`}>
                    {event.type}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
