import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Trash2, Flag, Coffee, BookOpen } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO } from 'date-fns';

export default function AcademicCalendarWidget() {
  const { token, user } = useAuth();
  const { notify } = useNotification();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    eventType: 'Milestone'
  });

  const canManage = user?.role === 'Administrator' || user?.role === 'Academic Officer';

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
        setEvents(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/academic/calendar-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        notify({ title: 'Success', message: 'Event added', type: 'success' });
        setShowForm(false);
        fetchEvents();
        setForm({ ...form, title: '', description: '' });
      }
    } catch (e) {
      notify({ title: 'Error', message: 'Failed to add event', type: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this event?')) return;
    try {
      const res = await fetch(`/api/academic/calendar-events/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        notify({ title: 'Success', message: 'Event deleted', type: 'success' });
        fetchEvents();
      }
    } catch (e) {
      notify({ title: 'Error', message: 'Failed to delete event', type: 'error' });
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getDayEvents = (date: Date) => {
    return events.filter(e => {
      const start = parseISO(e.startDate);
      const end = parseISO(e.endDate);
      // Simplify by checking if date falls between start and end (inclusive of days)
      const d = new Date(date).setHours(0,0,0,0);
      const s = new Date(start).setHours(0,0,0,0);
      const en = new Date(end).setHours(0,0,0,0);
      return d >= s && d <= en;
    });
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'Holiday': return <Coffee className="w-3 h-3" />;
      case 'Exam': return <BookOpen className="w-3 h-3" />;
      case 'Assignment Deadline': return <BookOpen className="w-3 h-3" />;
      default: return <Flag className="w-3 h-3" />;
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
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
        <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-indigo-500" />
          Academic Calendar
        </h3>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-medium text-slate-700 dark:text-slate-300 w-32 text-center">
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          {canManage && (
            <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
              <Plus className="w-4 h-4" /> Add Event
            </button>
          )}
        </div>
      </div>

      {showForm && canManage && (
        <form onSubmit={handleCreate} className="p-4 bg-indigo-50 dark:bg-indigo-900/10 border-b border-indigo-100 dark:border-indigo-800/30 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Event Title</label>
            <input required type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg dark:bg-slate-700" placeholder="E.g. Mid-term break" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
            <select value={form.eventType} onChange={e => setForm({...form, eventType: e.target.value})} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg dark:bg-slate-700">
              <option value="Milestone">Milestone</option>
              <option value="Holiday">Holiday</option>
              <option value="Exam">Exam</option>
              <option value="Assignment Deadline">Assignment Deadline</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
            <input required type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg dark:bg-slate-700" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">End Date</label>
            <input required type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg dark:bg-slate-700" />
          </div>
          <button type="submit" className="w-full py-2 bg-indigo-600 text-white text-sm rounded-lg font-medium hover:bg-indigo-700">Save</button>
        </form>
      )}

      <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-xs font-medium text-slate-500 dark:text-slate-400">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="p-2 text-center">{d}</div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 auto-rows-[100px] bg-slate-200 dark:bg-slate-700 gap-px">
        {/* Padding for first day of month */}
        {Array.from({ length: monthStart.getDay() }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-white dark:bg-slate-800 opacity-50"></div>
        ))}
        
        {daysInMonth.map((day, i) => {
          const dayEvents = getDayEvents(day);
          const isToday = isSameDay(day, new Date());
          
          return (
            <div key={day.toISOString()} className={`bg-white dark:bg-slate-800 p-2 overflow-y-auto ${isToday ? 'ring-2 ring-inset ring-indigo-500 dark:ring-indigo-400' : ''}`}>
              <div className={`text-xs font-medium mb-1 ${isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>
                {format(day, 'd')}
              </div>
              <div className="space-y-1">
                {dayEvents.map(evt => (
                  <div key={evt.id} className={`text-[10px] p-1 rounded border flex items-start gap-1 justify-between group ${getEventColor(evt.eventType)}`}>
                    <div className="flex items-start gap-1 truncate" title={evt.title}>
                      <span className="shrink-0 mt-0.5">{getEventIcon(evt.eventType)}</span>
                      <span className="truncate leading-tight">{evt.title}</span>
                    </div>
                    {canManage && (
                      <button onClick={() => handleDelete(evt.id)} className="opacity-0 group-hover:opacity-100 shrink-0 text-slate-400 hover:text-red-500 transition-opacity">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        
        {/* Padding for last day of month */}
        {Array.from({ length: 6 - monthEnd.getDay() }).map((_, i) => (
          <div key={`empty-end-${i}`} className="bg-white dark:bg-slate-800 opacity-50"></div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="p-3 bg-slate-50 dark:bg-slate-900 flex items-center justify-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-indigo-100 border border-indigo-200 block"></span> Milestone</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-rose-100 border border-rose-200 block"></span> Exam</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-100 border border-amber-200 block"></span> Holiday</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-slate-100 border border-slate-200 block"></span> Other</div>
      </div>
    </div>
  );
}
