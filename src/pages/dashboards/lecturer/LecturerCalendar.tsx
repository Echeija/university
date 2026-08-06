import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfWeek, 
  startOfMonth, 
  endOfMonth, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays,
  parseISO
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, BookOpen, X, Trash2 } from 'lucide-react';

interface CalendarEvent {
  id: number;
  courseId: number | null;
  title: string;
  type: string;
  startTime: string;
  endTime: string;
  description: string;
}

interface Course {
  id: number;
  code: string;
  title: string;
}

export default function LecturerCalendar() {
  const { token } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [formData, setFormData] = useState({
    title: '',
    type: 'Lecture',
    courseId: '',
    startTime: '09:00',
    endTime: '10:00',
    description: ''
  });

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/calendar/events', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/lecturer/courses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    Promise.all([fetchEvents(), fetchCourses()]).finally(() => setIsLoading(false));
  }, []);

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const onDateClick = (day: Date) => {
    setSelectedDate(day);
    setFormData({
      ...formData,
      startTime: '09:00',
      endTime: '10:00'
    });
    setIsModalOpen(true);
  };

  const handleDeleteEvent = async (id: number) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      const res = await fetch(`/api/calendar/events/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setEvents(events.filter(e => e.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Create full datetime strings
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const startDateTime = new Date(`${dateStr}T${formData.startTime}:00`).toISOString();
      const endDateTime = new Date(`${dateStr}T${formData.endTime}:00`).toISOString();

      const res = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          title: formData.title,
          type: formData.type,
          courseId: formData.courseId ? parseInt(formData.courseId) : null,
          startTime: startDateTime,
          endTime: endDateTime,
          description: formData.description
        })
      });
      
      if (res.ok) {
        const newEvent = await res.json();
        setEvents([...events, newEvent]);
        setIsModalOpen(false);
        setFormData({ title: '', type: 'Lecture', courseId: '', startTime: '09:00', endTime: '10:00', description: '' });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(parseISO(event.startTime), day));
  };

  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Calendar</h2>
          <p className="text-slate-500 mt-1">Manage your course schedules and deadlines.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <h3 className="text-lg font-bold text-slate-800 min-w-[140px] text-center">
              {format(currentDate, 'MMMM yyyy')}
            </h3>
            <button onClick={handleNextMonth} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>
          <button 
            onClick={() => onDateClick(new Date())}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            New Event
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = [];
    const startDate = startOfWeek(currentDate);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="py-3 text-center text-sm font-bold text-slate-500 uppercase tracking-wider">
          {format(addDays(startDate, i), 'EEEE')}
        </div>
      );
    }

    return <div className="grid grid-cols-7 border-b border-slate-200 mb-2">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = '';

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, 'd');
        const cloneDay = day;
        const dayEvents = getEventsForDay(cloneDay);
        
        days.push(
          <div
            key={day.toString()}
            onClick={() => onDateClick(cloneDay)}
            className={`min-h-[120px] p-2 border border-slate-100 transition-colors cursor-pointer
              ${!isSameMonth(day, monthStart) ? 'bg-slate-50 text-slate-400' : 'bg-white hover:bg-slate-50'}
              ${isSameDay(day, new Date()) ? 'ring-2 ring-inset ring-emerald-500' : ''}
            `}
          >
            <div className="flex justify-between items-start mb-2">
              <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full
                ${isSameDay(day, new Date()) ? 'bg-emerald-600 text-white' : 'text-slate-700'}
              `}>
                {formattedDate}
              </span>
              {dayEvents.length > 0 && (
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {dayEvents.length}
                </span>
              )}
            </div>
            
            <div className="space-y-1">
              {dayEvents.map(event => (
                <div 
                  key={event.id} 
                  onClick={(e) => { e.stopPropagation(); /* could open edit modal here */ }}
                  className={`text-xs p-1.5 rounded-md truncate font-medium border flex items-center justify-between group
                    ${event.type === 'Lecture' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                      event.type === 'Assignment Deadline' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                      event.type === 'Exam' ? 'bg-red-50 text-red-700 border-red-200' :
                      'bg-slate-50 text-slate-700 border-slate-200'}
                  `}
                >
                  <span className="truncate">{format(parseISO(event.startTime), 'HH:mm')} {event.title}</span>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteEvent(event.id); }} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 ml-1 shrink-0">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">{rows}</div>;
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading calendar...</div>;

  return (
    <div>
      {renderHeader()}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
        {renderDays()}
        {renderCells()}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-emerald-600" />
                Add Event for {format(selectedDate, 'MMM d, yyyy')}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Event Title</label>
                <input 
                  required
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm"
                  placeholder="e.g. Introduction to Algorithms"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">Type</label>
                  <select 
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm"
                  >
                    <option value="Lecture">Lecture</option>
                    <option value="Assignment Deadline">Assignment Deadline</option>
                    <option value="Exam">Exam</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">Related Course</label>
                  <select 
                    value={formData.courseId}
                    onChange={e => setFormData({...formData, courseId: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm"
                  >
                    <option value="">None</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>{course.code}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">Start Time</label>
                  <div className="relative">
                    <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="time" 
                      required
                      value={formData.startTime}
                      onChange={e => setFormData({...formData, startTime: e.target.value})}
                      className="w-full pl-9 p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">End Time</label>
                  <div className="relative">
                    <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="time" 
                      required
                      value={formData.endTime}
                      onChange={e => setFormData({...formData, endTime: e.target.value})}
                      className="w-full pl-9 p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Description (Optional)</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm resize-none"
                  placeholder="Additional details..."
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
