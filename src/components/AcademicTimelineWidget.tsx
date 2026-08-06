import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, BookOpen, Coffee, Flag, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { format, isPast, isToday, parseISO } from 'date-fns';

export default function AcademicTimelineWidget() {
  const { token } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, [token]);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/academic/calendar-events', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const upcoming = data
          .filter((e: any) => !isPast(parseISO(e.endDate)) || isToday(parseISO(e.endDate)))
          .sort((a: any, b: any) => parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime())
          .slice(0, 10);
        setEvents(upcoming);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'Holiday': return <Coffee className="w-4 h-4" />;
      case 'Exam': return <BookOpen className="w-4 h-4" />;
      case 'Assignment Deadline': return <BookOpen className="w-4 h-4" />;
      default: return <Flag className="w-4 h-4" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'Holiday': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'Exam': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800';
      case 'Assignment Deadline': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800';
      case 'Milestone': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
        <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-indigo-500" />
          Academic Calendar Timeline
        </h3>
      </div>
      
      <div className="p-6 relative">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No upcoming academic events.</p>
          </div>
        ) : (
          <div className="space-y-6 before:absolute before:inset-0 before:ml-[35px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-700 before:to-transparent">
            {events.map((event, index) => {
              const start = parseISO(event.startDate);
              const isTodayEvent = isToday(start);
              
              return (
                <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                     {getEventIcon(event.eventType)}
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center justify-between mb-2">
                      <div className={`text-xs font-bold px-2 py-1 rounded-full ${getEventColor(event.eventType)}`}>
                        {event.eventType}
                      </div>
                      <time className={`text-sm font-medium flex items-center gap-1 ${isTodayEvent ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}>
                        <Clock className="w-3.5 h-3.5" />
                        {format(start, 'MMM d, yyyy')}
                      </time>
                    </div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">{event.title}</h4>
                    {event.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400">{event.description}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
