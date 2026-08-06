import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Loader2, Info, MapPin, X, Bell } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { useNotification } from '../contexts/NotificationContext';

interface AcademicEvent {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  eventType: string;
}

export default function AcademicCalendar() {
  const [events, setEvents] = useState<AcademicEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [eventDetailModal, setEventDetailModal] = useState<AcademicEvent | null>(null);
  
  const { notify } = useNotification();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/public/calendar-events');
        if (res.ok) {
          const data = await res.json();
          // Sort events by start date ascending
          data.sort((a: AcademicEvent, b: AcademicEvent) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
          setEvents(data);
        }
      } catch (e: any) {
        if (e.message !== 'Failed to fetch') {
          console.error("Failed to fetch events", e);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Exam':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Registration':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'Holiday':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Milestone':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-purple-50 text-purple-700 border-purple-200';
    }
  };
  
  const getDotColor = (type: string) => {
    switch (type) {
      case 'Exam': return 'bg-red-500 ring-red-100';
      case 'Registration': return 'bg-green-500 ring-green-100';
      case 'Holiday': return 'bg-blue-500 ring-blue-100';
      case 'Milestone': return 'bg-amber-500 ring-amber-100';
      default: return 'bg-purple-500 ring-purple-100';
    }
  };

  const handleRemindMe = (event: AcademicEvent) => {
    notify({
      title: 'Reminder Set',
      message: `You will be reminded about "${event.title}".`,
      type: 'success'
    });
    setEventDetailModal(null);
  };

  // Group events by month and year
  const groupedEvents = events.reduce((acc, event) => {
    const date = new Date(event.startDate);
    const monthYear = format(date, 'MMMM yyyy');
    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    acc[monthYear].push(event);
    return acc;
  }, {} as Record<string, AcademicEvent[]>);

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm h-full flex flex-col relative w-full">
      {eventDetailModal && (
        <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm rounded-3xl flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start p-5 border-b border-slate-100">
              <div>
                <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border mb-2 ${getTypeColor(eventDetailModal.eventType)}`}>
                  {eventDetailModal.eventType}
                </span>
                <h4 className="font-bold text-lg text-slate-900 leading-tight">
                  {eventDetailModal.title}
                </h4>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); setEventDetailModal(null); }}
                className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-full p-1.5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-start gap-2 text-sm text-slate-600">
                  <CalendarIcon className="w-4 h-4 text-emerald-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-800">Date</p>
                    <p>
                      {isSameDay(new Date(eventDetailModal.startDate), new Date(eventDetailModal.endDate)) 
                        ? format(new Date(eventDetailModal.startDate), 'MMMM d, yyyy')
                        : `${format(new Date(eventDetailModal.startDate), 'MMM d, yyyy')} - ${format(new Date(eventDetailModal.endDate), 'MMM d, yyyy')}`
                      }
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2 text-sm text-slate-600">
                  <MapPin className="w-4 h-4 text-emerald-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-800">Venue</p>
                    <p>University Campus</p>
                  </div>
                </div>
              </div>
              
              {eventDetailModal.description && (
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {eventDetailModal.description}
                  </p>
                </div>
              )}
            </div>
            
            <div className="p-4 bg-slate-50 border-t border-slate-100">
              <button 
                onClick={() => handleRemindMe(eventDetailModal)}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <Bell className="w-4 h-4" />
                Remind Me
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 shrink-0 gap-4">
        <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
          <CalendarIcon className="w-6 h-6 text-emerald-600" />
          Academic Calendar Timeline
        </h3>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center flex-1 min-h-[400px]">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-slate-500 py-12">
          <CalendarIcon className="w-12 h-12 text-slate-300 mb-4" />
          <p>No academic events found.</p>
        </div>
      ) : (
        <div className="relative border-l-2 border-slate-100 ml-3 md:ml-6 pl-6 md:pl-10 py-4 space-y-12">
          {Object.entries(groupedEvents).map(([monthYear, monthEvents]) => (
            <div key={monthYear} className="relative">
              <div className="absolute -left-[54px] md:-left-[70px] bg-slate-100 text-slate-500 font-bold text-xs uppercase tracking-widest py-1 px-3 rounded-full shadow-sm border border-slate-200">
                {format(new Date(monthEvents[0].startDate), 'MMM')}
              </div>
              <h4 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                {monthYear}
                <div className="h-px bg-slate-100 flex-1 ml-4 hidden sm:block"></div>
              </h4>
              
              <div className="space-y-6">
                {monthEvents.map((event, idx) => (
                  <div 
                    key={event.id}
                    onClick={() => setEventDetailModal(event)}
                    className="relative group cursor-pointer"
                  >
                    <div className={`absolute -left-[35px] md:-left-[51px] top-1.5 w-4 h-4 rounded-full ring-4 ${getDotColor(event.eventType)} z-10 transition-transform group-hover:scale-125`}></div>
                    
                    <div className="bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-slate-200 p-5 rounded-2xl transition-all group-hover:-translate-y-1 group-hover:shadow-md">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <h5 className="font-bold text-slate-900 text-lg group-hover:text-emerald-700 transition-colors">
                          {event.title}
                        </h5>
                        <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border w-fit ${getTypeColor(event.eventType)}`}>
                          {event.eventType}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-slate-500 font-medium mb-3">
                        <Clock className="w-4 h-4" />
                        <span>
                          {isSameDay(new Date(event.startDate), new Date(event.endDate)) 
                            ? format(new Date(event.startDate), 'MMMM d, yyyy')
                            : `${format(new Date(event.startDate), 'MMM d, yyyy')} - ${format(new Date(event.endDate), 'MMM d, yyyy')}`
                          }
                        </span>
                      </div>
                      
                      {event.description && (
                        <p className="text-slate-600 text-sm line-clamp-2">
                          {event.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
