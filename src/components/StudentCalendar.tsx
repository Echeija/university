import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertCircle, BookOpen, ChevronRight, X, MapPin, GraduationCap, FileText, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface CalendarEvent {
  id: number;
  title: string;
  type: string; // 'Lecture', 'Assignment Deadline', 'Exam'
  start_time: string;
  end_time: string;
  course_id?: number;
  description?: string;
  course_name?: string;
  location?: string;
}

const DraggableEventCard = ({ event, onViewDetails }: { event: CalendarEvent, onViewDetails: (e: CalendarEvent) => void }) => {
  const getEventColor = (type: string) => {
    if (type.toLowerCase().includes('exam')) return '#ef4444'; // red
    if (type.toLowerCase().includes('lecture')) return '#10b981'; // emerald
    return '#f59e0b'; // amber for assignments/deadlines
  };

  const getEventIcon = (type: string) => {
    if (type.toLowerCase().includes('exam')) return <GraduationCap className="w-3.5 h-3.5" />;
    if (type.toLowerCase().includes('lecture')) return <Calendar className="w-3.5 h-3.5" />;
    return <FileText className="w-3.5 h-3.5" />;
  };

  return (
    <div className="relative rounded-xl border border-slate-100 dark:border-slate-700 bg-indigo-50 dark:bg-indigo-900/30 overflow-hidden group shadow-sm mb-3">
      {/* Background action hint */}
      <div className="absolute inset-0 flex items-center justify-between px-6 text-indigo-600 dark:text-indigo-400">
         <span className="text-xs font-bold flex items-center gap-2">View Details</span>
         <span className="text-xs font-bold flex items-center gap-2">View Details</span>
      </div>
      
      {/* Draggable surface */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={(e, { offset }) => {
          if (Math.abs(offset.x) > 60) {
             onViewDetails(event);
          }
        }}
        whileTap={{ cursor: "grabbing" }}
        className="relative bg-white dark:bg-slate-800 p-4 rounded-xl flex items-center justify-between z-10 cursor-grab border-l-4 touch-pan-y"
        style={{ borderLeftColor: getEventColor(event.type) }}
      >
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-2 mb-2">
             <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
               {new Date(event.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
             </span>
             <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1 border border-slate-200 dark:border-slate-600">
               {getEventIcon(event.type)}
               {event.type}
             </span>
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{event.title}</h4>
          {event.course_name && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{event.course_name}</p>}
        </div>
        <div className="text-right whitespace-nowrap shrink-0 flex flex-col justify-between h-full">
           <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {new Date(event.start_time).toLocaleDateString([], { month: 'short', day: 'numeric'})}
           </div>
           <div className="text-[10px] text-slate-400 mt-3 flex items-center gap-1 justify-end opacity-60 group-hover:opacity-100 transition-opacity">
             <span className="hidden sm:inline">Drag to view</span> <ChevronRight className="w-3 h-3 animate-pulse" />
           </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function StudentCalendar() {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchEvents();
    }
  }, [user]);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .order('start_time', { ascending: true })
        .limit(20);

      if (error) {
        console.error('Error fetching from Supabase:', error);
      } else if (data) {
        setEvents(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const lectures = events.filter(e => e.type === 'Lecture' || e.type.toLowerCase().includes('lecture'));
  const exams = events.filter(e => e.type === 'Exam' || e.type.toLowerCase().includes('exam'));
  const deadlines = events.filter(e => e.type === 'Assignment Deadline' || e.type.toLowerCase().includes('assignment') || e.type.toLowerCase().includes('deadline'));

  return (
    <div className="space-y-8 relative">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lectures & Exams */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              Lectures & Exams
            </h3>
          </div>
          <div className="space-y-1">
            {isLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
                <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
              </div>
            ) : [...lectures, ...exams].length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No upcoming lectures or exams.</p>
            ) : (
              [...lectures, ...exams]
                .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
                .map((item) => (
                <DraggableEventCard key={item.id} event={item} onViewDetails={setSelectedEvent} />
              ))
            )}
          </div>
        </div>

        {/* Academic Deadlines */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-600" />
              Academic Deadlines
            </h3>
          </div>
          <div className="space-y-1">
            {isLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
                <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
              </div>
            ) : deadlines.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No upcoming deadlines.</p>
            ) : (
              deadlines.map((item) => (
                <DraggableEventCard key={item.id} event={item} onViewDetails={setSelectedEvent} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => setSelectedEvent(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div 
                className={`h-2 w-full ${
                  selectedEvent.type.toLowerCase().includes('exam') ? 'bg-red-500' :
                  selectedEvent.type.toLowerCase().includes('lecture') ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="inline-block px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
                      {selectedEvent.type}
                    </span>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                      {selectedEvent.title}
                    </h2>
                  </div>
                  <button 
                    onClick={() => setSelectedEvent(null)}
                    className="p-2 -mr-2 -mt-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-4 mt-6">
                  {selectedEvent.course_name && (
                    <div className="flex items-start gap-3 text-sm">
                      <BookOpen className="w-5 h-5 text-slate-400 mt-0.5" />
                      <div>
                        <p className="font-bold text-slate-700 dark:text-slate-300">Course</p>
                        <p className="text-slate-600 dark:text-slate-400">{selectedEvent.course_name}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-3 text-sm">
                    <Clock className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-700 dark:text-slate-300">Date & Time</p>
                      <p className="text-slate-600 dark:text-slate-400">
                        {new Date(selectedEvent.start_time).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                        <br />
                        {new Date(selectedEvent.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(selectedEvent.end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                  </div>

                  {(selectedEvent.location || selectedEvent.type.toLowerCase().includes('lecture')) && (
                    <div className="flex items-start gap-3 text-sm">
                      <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                      <div>
                        <p className="font-bold text-slate-700 dark:text-slate-300">Location</p>
                        <p className="text-slate-600 dark:text-slate-400">{selectedEvent.location || 'See Canvas/Moodle for link'}</p>
                      </div>
                    </div>
                  )}

                  {selectedEvent.description && (
                    <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                      <p className="text-sm text-slate-600 dark:text-slate-300">{selectedEvent.description}</p>
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <button 
                    onClick={() => setSelectedEvent(null)}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
