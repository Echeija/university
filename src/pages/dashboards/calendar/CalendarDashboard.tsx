import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Video, FileText, GraduationCap, Clock } from 'lucide-react';

export default function CalendarDashboard() {
  const { user } = useAuth();
  
  // Basic mock data
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const events = [
    { id: 1, title: 'Advanced Software Engineering Live Session', type: 'class', date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15), time: '10:00 AM', course: 'CSC401' },
    { id: 2, title: 'Database Design Project Phase 1', type: 'assignment', date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 18), time: '11:59 PM', course: 'CSC402' },
    { id: 3, title: 'Mid-Semester Examination', type: 'exam', date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 25), time: '09:00 AM', course: 'CSC401' },
    { id: 4, title: 'Machine Learning Basics', type: 'class', date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 16), time: '02:00 PM', course: 'CSC405' },
    { id: 5, title: 'Research Paper Submission', type: 'assignment', date: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 2), time: '11:59 PM', course: 'CSC499' }
  ];

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getEventsForDay = (day: number) => {
    return events.filter(e => e.date.getDate() === day && e.date.getMonth() === currentDate.getMonth() && e.date.getFullYear() === currentDate.getFullYear());
  };

  const getEventIcon = (type: string) => {
    switch(type) {
      case 'class': return <Video className="w-3 h-3" />;
      case 'assignment': return <FileText className="w-3 h-3" />;
      case 'exam': return <GraduationCap className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const getEventColor = (type: string) => {
    switch(type) {
      case 'class': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'assignment': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'exam': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Unified Calendar</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your classes, assignments, and exams</p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
          <button onClick={prevMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button>
          <div className="w-32 text-center font-bold text-slate-800 dark:text-slate-200">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </div>
          <button onClick={nextMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button>
        </div>
      </div>

      <div className="flex gap-4 text-sm font-medium">
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div> Virtual Classes</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500"></div> Assignments</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div> Exams</div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-3 text-center text-sm font-bold text-slate-500 dark:text-slate-400">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 auto-rows-[120px]">
          {/* Empty cells for start of month */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="border-r border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20 p-2"></div>
          ))}
          
          {/* Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayEvents = getEventsForDay(day);
            const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();
            
            return (
              <div key={day} className={`border-r border-b border-slate-100 dark:border-slate-700 p-2 overflow-y-auto custom-scrollbar transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/30 ${isToday ? 'bg-emerald-50/30 dark:bg-emerald-900/10' : ''}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-emerald-600 text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                    {day}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                      {dayEvents.length}
                    </span>
                  )}
                </div>
                
                <div className="space-y-1.5">
                  {dayEvents.map(event => (
                    <div 
                      key={event.id} 
                      className={`text-[10px] sm:text-xs p-1.5 rounded-lg border flex flex-col gap-0.5 shadow-sm truncate cursor-pointer hover:opacity-80 transition-opacity ${getEventColor(event.type)}`}
                      title={`${event.title} - ${event.time}`}
                    >
                      <div className="flex items-center gap-1 font-bold">
                        {getEventIcon(event.type)}
                        <span className="truncate">{event.time}</span>
                      </div>
                      <span className="truncate opacity-90">{event.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          
          {/* Empty cells for end of month */}
          {Array.from({ length: (7 - ((firstDayOfMonth + daysInMonth) % 7)) % 7 }).map((_, i) => (
            <div key={`empty-end-${i}`} className="border-r border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20 p-2"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
