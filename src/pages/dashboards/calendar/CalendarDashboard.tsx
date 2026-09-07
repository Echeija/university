import React from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Video, FileText, 
  GraduationCap, Clock, AlertCircle, Plus, Search, Filter, Printer, 
  Download, Bell, BellOff, X, MapPin, ExternalLink, CheckCircle2, 
  Tag, BookOpen, Sparkles, User, RefreshCw, CalendarDays, ListFilter,
  Layers, ShieldAlert
} from 'lucide-react';

export interface CalendarEvent {
  id: number | string;
  title: string;
  type: 'exam' | 'lecture' | 'deadline' | 'holiday' | 'seminar';
  courseCode?: string;
  courseName?: string;
  startDate: string; // ISO string
  endDate: string;   // ISO string
  venue?: string;
  virtualLink?: string;
  description?: string;
  coordinator?: string;
  scope?: 'university' | 'faculty' | 'department' | 'personal';
  isImportant?: boolean;
}

export default function CalendarDashboard() {
  const { user } = useAuth();
  
  // Navigation & View States
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'agenda' | 'timetable'>('month');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modal & Selection States
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [activeReminders, setActiveReminders] = useState<Record<string | number, boolean>>({});
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Form State for New Event
  const [newEvent, setNewEvent] = useState<{
    title: string;
    type: 'exam' | 'lecture' | 'deadline' | 'holiday' | 'seminar';
    courseCode: string;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    venue: string;
    virtualLink: string;
    description: string;
    scope: 'university' | 'faculty' | 'department' | 'personal';
  }>({
    title: '',
    type: 'lecture',
    courseCode: '',
    startDate: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endDate: new Date().toISOString().split('T')[0],
    endTime: '11:00',
    venue: 'Lecture Hall A',
    virtualLink: '',
    description: '',
    scope: 'department'
  });

  // Default Seed / Mock Calendar Events
  const defaultEvents: CalendarEvent[] = [
    {
      id: 'evt-1',
      title: 'Mid-Semester Examination: Data Structures & Algorithms',
      type: 'exam',
      courseCode: 'CSC 301',
      courseName: 'Data Structures & Algorithms',
      startDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0] + 'T09:00:00',
      endDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0] + 'T12:00:00',
      venue: 'Main Auditorium, Floor 2',
      description: 'Comprehensive mid-term evaluation covering Trees, Graphs, Sorting Algorithms, and Dynamic Programming.',
      coordinator: 'Dr. A. O. Adeleke',
      scope: 'department',
      isImportant: true
    },
    {
      id: 'evt-2',
      title: 'Advanced Software Engineering Live Interactive Seminar',
      type: 'lecture',
      courseCode: 'CSC 401',
      courseName: 'Advanced Software Engineering',
      startDate: new Date(Date.now() + 86400000 * 1).toISOString().split('T')[0] + 'T10:00:00',
      endDate: new Date(Date.now() + 86400000 * 1).toISOString().split('T')[0] + 'T12:00:00',
      venue: 'Technology Complex Room 104',
      virtualLink: 'https://meet.google.com/abc-defg-hij',
      description: 'Live lecture on Microservice Architectures, CI/CD Pipelines, and System Scalability.',
      coordinator: 'Prof. K. N. Ibrahim',
      scope: 'department'
    },
    {
      id: 'evt-3',
      title: '2nd Installment Tuition & Portal Fee Payment Deadline',
      type: 'deadline',
      startDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0] + 'T23:59:00',
      endDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0] + 'T23:59:00',
      venue: 'University Bursary Portal',
      description: 'Final cutoff date for 2nd installment tuition fee payment. Unpaid student accounts will lose portal course access.',
      coordinator: 'Bursary Department',
      scope: 'university',
      isImportant: true
    },
    {
      id: 'evt-4',
      title: 'Database Systems Practical Lab Assessment',
      type: 'exam',
      courseCode: 'CSC 402',
      courseName: 'Database Management Systems',
      startDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0] + 'T14:00:00',
      endDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0] + 'T16:00:00',
      venue: 'Computer Center Lab 3',
      description: 'Hands-on practical exam on PostgreSQL schema design, complex joins, and query optimization.',
      coordinator: 'Engr. Mrs. B. Chinedu',
      scope: 'department'
    },
    {
      id: 'evt-5',
      title: 'Late Course Registration Cutoff & Penalty Window',
      type: 'deadline',
      startDate: new Date(Date.now() + 86400000 * 9).toISOString().split('T')[0] + 'T17:00:00',
      endDate: new Date(Date.now() + 86400000 * 9).toISOString().split('T')[0] + 'T17:00:00',
      venue: 'Academic Registry',
      description: 'End of late registration window. Course addition/drop requests will not be accepted after this date.',
      coordinator: 'Academic Registrar',
      scope: 'university'
    },
    {
      id: 'evt-6',
      title: 'Mid-Semester Academic Recess & Holiday Break',
      type: 'holiday',
      startDate: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0] + 'T00:00:00',
      endDate: new Date(Date.now() + 86400000 * 18).toISOString().split('T')[0] + 'T23:59:00',
      venue: 'Campus-wide',
      description: 'University closed for mid-semester break. Library and digital study lounges remain accessible online.',
      coordinator: 'Vice Chancellor Office',
      scope: 'university'
    },
    {
      id: 'evt-7',
      title: 'Machine Learning & AI Research Seminar',
      type: 'seminar',
      courseCode: 'CSC 405',
      courseName: 'Machine Learning Fundamentals',
      startDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0] + 'T11:00:00',
      endDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0] + 'T13:00:00',
      venue: 'Faculty Innovation Hub',
      virtualLink: 'https://ais.studio/webinar/ai-research',
      description: 'Guest lecture from industry AI researchers on Transformer models and LLM alignment.',
      coordinator: 'Dr. E. O. Okafor',
      scope: 'faculty'
    },
    {
      id: 'evt-8',
      title: 'Lecturer Continuous Assessment (CA) Score Submission Cutoff',
      type: 'deadline',
      startDate: new Date(Date.now() + 86400000 * 12).toISOString().split('T')[0] + 'T23:59:00',
      endDate: new Date(Date.now() + 86400000 * 12).toISOString().split('T')[0] + 'T23:59:00',
      venue: 'Academic Affairs Portal',
      description: 'All academic staff and lecturers must upload 30% CA scores for undergraduate courses.',
      coordinator: 'Director of Academic Planning',
      scope: 'university',
      isImportant: true
    }
  ];

  const [events, setEvents] = useState<CalendarEvent[]>(defaultEvents);

  // Fetch Events from API on mount
  useEffect(() => {
    fetchCalendarEvents();
  }, []);

  const fetchCalendarEvents = async () => {
    setLoading(true);
    try {
      // Fetch public/academic events and personal events
      const [academicRes, personalRes] = await Promise.all([
        fetch('/api/academic/calendar-events').catch(() => null),
        fetch('/api/calendar/events').catch(() => null)
      ]);

      let fetchedEvents: CalendarEvent[] = [...defaultEvents];

      if (academicRes && academicRes.ok) {
        const data = await academicRes.json();
        if (Array.isArray(data) && data.length > 0) {
          const mappedAcademic: CalendarEvent[] = data.map((e: any) => ({
            id: `acad-${e.id}`,
            title: e.title,
            type: e.eventType === 'Exam' ? 'exam' : e.eventType === 'Holiday' ? 'holiday' : 'deadline',
            startDate: e.startDate,
            endDate: e.endDate,
            description: e.description,
            scope: 'university',
            isImportant: e.eventType === 'Exam' || e.eventType === 'Deadline'
          }));
          fetchedEvents = [...fetchedEvents, ...mappedAcademic];
        }
      }

      if (personalRes && personalRes.ok) {
        const data = await personalRes.json();
        if (Array.isArray(data) && data.length > 0) {
          const mappedPersonal: CalendarEvent[] = data.map((e: any) => ({
            id: `usr-${e.id}`,
            title: e.title,
            type: (e.type?.toLowerCase().includes('exam') ? 'exam' : e.type?.toLowerCase().includes('assignment') ? 'deadline' : 'lecture') as any,
            courseCode: e.courseCode || 'CSC 401',
            startDate: e.startTime || e.startDate,
            endDate: e.endTime || e.endDate,
            description: e.description,
            venue: e.venue || 'Lecture Room 2',
            scope: 'personal'
          }));
          fetchedEvents = [...fetchedEvents, ...mappedPersonal];
        }
      }

      // Deduplicate by ID
      const uniqueEvents = Array.from(new Map(fetchedEvents.map(item => [item.id, item])).values());
      setEvents(uniqueEvents);
    } catch (error) {
      console.error("Error fetching calendar events:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper date utilities
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Filter logic
  const filteredEvents = events.filter(evt => {
    const matchesCategory = selectedCategory === 'all' || evt.type === selectedCategory;
    const matchesQuery = !searchQuery.trim() || 
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (evt.courseCode && evt.courseCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (evt.description && evt.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (evt.venue && evt.venue.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesQuery;
  });

  const getEventsForDay = (day: number) => {
    return filteredEvents.filter(e => {
      const d = new Date(e.startDate);
      return d.getDate() === day && 
             d.getMonth() === currentDate.getMonth() && 
             d.getFullYear() === currentDate.getFullYear();
    });
  };

  // Category styling helpers
  const getCategoryConfig = (type: string) => {
    switch (type) {
      case 'exam':
        return {
          label: 'Examination',
          icon: GraduationCap,
          badgeBg: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
          dotBg: 'bg-rose-500',
          borderLeft: 'border-l-4 border-l-rose-500'
        };
      case 'lecture':
        return {
          label: 'Lecture / Class',
          icon: Video,
          badgeBg: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
          dotBg: 'bg-indigo-500',
          borderLeft: 'border-l-4 border-l-indigo-500'
        };
      case 'deadline':
        return {
          label: 'Admin Deadline',
          icon: Clock,
          badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
          dotBg: 'bg-amber-500',
          borderLeft: 'border-l-4 border-l-amber-500'
        };
      case 'holiday':
        return {
          label: 'Holiday / Recess',
          icon: CalendarDays,
          badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
          dotBg: 'bg-emerald-500',
          borderLeft: 'border-l-4 border-l-emerald-500'
        };
      case 'seminar':
      default:
        return {
          label: 'Seminar & Event',
          icon: BookOpen,
          badgeBg: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
          dotBg: 'bg-purple-500',
          borderLeft: 'border-l-4 border-l-purple-500'
        };
    }
  };

  // Toggle Reminder
  const toggleReminder = (id: string | number) => {
    const isSet = !activeReminders[id];
    setActiveReminders(prev => ({ ...prev, [id]: isSet }));
    showToast(isSet ? 'Notification reminder set for this event!' : 'Reminder canceled.');
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Export iCal (.ics) file
  const downloadICS = (event?: CalendarEvent) => {
    const eventsToExport = event ? [event] : filteredEvents;
    
    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Smart Global College//Academic Calendar//EN\n";

    eventsToExport.forEach(evt => {
      const start = new Date(evt.startDate).toISOString().replace(/-|:|\.\d\d\d/g, "");
      const end = new Date(evt.endDate).toISOString().replace(/-|:|\.\d\d\d/g, "");
      icsContent += `BEGIN:VEVENT\nSUMMARY:${evt.title}\nDESCRIPTION:${evt.description || ''}\nLOCATION:${evt.venue || 'Online'}\nDTSTART:${start}\nDTEND:${end}\nEND:VEVENT\n`;
    });

    icsContent += "END:VCALENDAR";

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', event ? `${event.title.replace(/\s+/g, '_')}.ics` : 'SGCT_Academic_Calendar.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('iCal (.ics) file exported successfully!');
  };

  // Handle Event Creation
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title.trim()) return;

    const startIso = `${newEvent.startDate}T${newEvent.startTime}:00`;
    const endIso = `${newEvent.endDate}T${newEvent.endTime}:00`;

    const created: CalendarEvent = {
      id: `custom-${Date.now()}`,
      title: newEvent.title,
      type: newEvent.type,
      courseCode: newEvent.courseCode || undefined,
      startDate: startIso,
      endDate: endIso,
      venue: newEvent.venue,
      virtualLink: newEvent.virtualLink || undefined,
      description: newEvent.description,
      coordinator: user?.name || 'Academic Office',
      scope: newEvent.scope
    };

    setEvents(prev => [created, ...prev]);
    setShowCreateModal(false);
    showToast('New academic event successfully added!');

    // Persist to server backend
    try {
      await fetch('/api/calendar/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: created.title,
          type: created.type,
          startTime: startIso,
          endTime: endIso,
          description: created.description,
          courseCode: created.courseCode,
          venue: created.venue
        })
      });
    } catch (err) {
      console.error("Failed to persist event:", err);
    }

    // Reset Form
    setNewEvent({
      title: '',
      type: 'lecture',
      courseCode: '',
      startDate: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endDate: new Date().toISOString().split('T')[0],
      endTime: '11:00',
      venue: 'Lecture Hall A',
      virtualLink: '',
      description: '',
      scope: 'department'
    });
  };

  // Quick stats calculations
  const upcomingExams = events.filter(e => e.type === 'exam' && new Date(e.startDate) >= new Date()).sort((a,b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  const nextExam = upcomingExams[0];

  const upcomingDeadlines = events.filter(e => e.type === 'deadline' && new Date(e.startDate) >= new Date()).sort((a,b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  const nextDeadline = upcomingDeadlines[0];

  const thisMonthLecturesCount = events.filter(e => e.type === 'lecture' && new Date(e.startDate).getMonth() === currentDate.getMonth()).length;

  return (
    <div className="space-y-8 p-4 sm:p-6 max-w-7xl mx-auto">
      
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 text-sm animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Screen Interface Header - Hidden in browser print */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Interactive Academic Portal
            </span>
            <span className="text-xs text-slate-500 font-medium">2026/2027 Academic Session</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <CalendarIcon className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            Academic Calendar & Schedule
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Real-time schedule for examinations, lecture timetables, administrative deadlines, and university milestones.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => downloadICS()}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-200 dark:border-slate-700"
          >
            <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Export iCal (.ics)
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-200 dark:border-slate-700"
          >
            <Printer className="w-4 h-4" /> Print / Save PDF
          </button>

          {(user?.role === 'Lecturer' || user?.role === 'Administrator' || user?.role === 'Academic Officer' || user?.role === 'Student') && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" /> Add Event
            </button>
          )}
        </div>
      </div>

      {/* KPI Overview Banner Cards (Print Hidden) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
        
        {/* Next Exam Card */}
        <div className="bg-gradient-to-br from-rose-50 to-rose-100/60 dark:from-rose-950/30 dark:to-slate-900 border border-rose-200 dark:border-rose-900/50 p-4 rounded-2xl relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4" /> Next Examination
            </span>
            {nextExam && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-600 text-white">
                {Math.ceil((new Date(nextExam.startDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} Days Left
              </span>
            )}
          </div>
          {nextExam ? (
            <div>
              <p className="font-extrabold text-slate-900 dark:text-white text-sm line-clamp-1">{nextExam.title}</p>
              <div className="mt-1 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
                <span className="font-mono bg-rose-200/80 dark:bg-rose-900/60 px-1.5 py-0.5 rounded text-rose-900 dark:text-rose-200 font-bold">{nextExam.courseCode}</span>
                <span>{new Date(nextExam.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {new Date(nextExam.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 font-medium">No upcoming exams scheduled.</p>
          )}
        </div>

        {/* Upcoming Deadline Card */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100/60 dark:from-amber-950/30 dark:to-slate-900 border border-amber-200 dark:border-amber-900/50 p-4 rounded-2xl relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> Urgent Deadline
            </span>
            <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300">Cutoff Window</span>
          </div>
          {nextDeadline ? (
            <div>
              <p className="font-extrabold text-slate-900 dark:text-white text-sm line-clamp-1">{nextDeadline.title}</p>
              <p className="mt-1 text-xs text-amber-800 dark:text-amber-300 font-medium">
                Due: {new Date(nextDeadline.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-500 font-medium">No pending administrative deadlines.</p>
          )}
        </div>

        {/* Lecture Load Card */}
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/60 dark:from-indigo-950/30 dark:to-slate-900 border border-indigo-200 dark:border-indigo-900/50 p-4 rounded-2xl relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
              <Video className="w-4 h-4" /> Monthly Lectures
            </span>
            <span className="text-xs font-black text-indigo-800 dark:text-indigo-300 bg-indigo-200/80 dark:bg-indigo-900/60 px-2 py-0.5 rounded-full">
              {thisMonthLecturesCount} Sessions
            </span>
          </div>
          <p className="font-extrabold text-slate-900 dark:text-white text-sm">Harmattan Semester Schedule</p>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 font-medium">Lectures & Lab assessments in view</p>
        </div>

        {/* Academic Session Term Status */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/60 dark:from-emerald-950/30 dark:to-slate-900 border border-emerald-200 dark:border-emerald-900/50 p-4 rounded-2xl relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Term Progress
            </span>
            <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300">Week 9 of 15</span>
          </div>
          <p className="font-extrabold text-slate-900 dark:text-white text-sm">Teaching & Assessment Phase</p>
          <div className="w-full bg-emerald-200/60 dark:bg-emerald-950 rounded-full h-1.5 mt-2">
            <div className="bg-emerald-600 h-1.5 rounded-full w-[60%]" />
          </div>
        </div>

      </div>

      {/* Main Interactive Controls & Filters (Print Hidden) */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-4 print:hidden">
        
        {/* Top Controls Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Month / Date Selector */}
          <div className="flex items-center gap-2">
            <button 
              onClick={prevMonth}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              title="Previous Month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={goToToday}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors"
            >
              Today
            </button>

            <div className="text-lg font-black text-slate-900 dark:text-white min-w-[160px] text-center tracking-tight">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </div>

            <button 
              onClick={nextMonth}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              title="Next Month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700 self-start md:self-auto">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'month' 
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" /> Month Grid
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'week' 
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> Week Time Grid
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'agenda' 
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" /> Agenda Feed
            </button>
            <button
              onClick={() => setViewMode('timetable')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'timetable' 
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" /> Class Timetable
            </button>
          </div>
        </div>

        {/* Filter Pills & Live Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-700/60">
          
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar text-xs">
            {[
              { id: 'all', label: 'All Events', icon: CalendarDays },
              { id: 'exam', label: 'Exams & Quizzes', icon: GraduationCap, color: 'text-rose-500' },
              { id: 'lecture', label: 'Lectures & Labs', icon: Video, color: 'text-indigo-500' },
              { id: 'deadline', label: 'Admin Deadlines', icon: Clock, color: 'text-amber-500' },
              { id: 'holiday', label: 'Holidays & Recess', icon: CalendarIcon, color: 'text-emerald-500' },
              { id: 'seminar', label: 'Seminars & Events', icon: BookOpen, color: 'text-purple-500' },
            ].map(cat => {
              const IconComp = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-emerald-800 text-white border-emerald-800 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <IconComp className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : cat.color || 'text-slate-400'}`} />
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search course code, exam, title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

        </div>

      </div>

      {/* VIEW MODE 1: MONTH GRID (Print Hidden) */}
      {viewMode === 'month' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden print:hidden">
          
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
              <div key={day} className={`py-2.5 text-center text-xs font-black tracking-wider uppercase ${idx === 0 || idx === 6 ? 'text-rose-500 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'}`}>
                {day}
              </div>
            ))}
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-7 auto-rows-[125px] sm:auto-rows-[140px] divide-x divide-y divide-slate-100 dark:divide-slate-700/60 bg-slate-100 dark:bg-slate-900">
            
            {/* Empty Offset Cells */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-start-${i}`} className="bg-slate-50/50 dark:bg-slate-900/20 p-2" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayEvents = getEventsForDay(day);
              const isToday = 
                day === new Date().getDate() && 
                currentDate.getMonth() === new Date().getMonth() && 
                currentDate.getFullYear() === new Date().getFullYear();

              return (
                <div 
                  key={`day-${day}`} 
                  className={`bg-white dark:bg-slate-800 p-2 overflow-y-auto custom-scrollbar transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-700/30 relative flex flex-col ${
                    isToday ? 'bg-emerald-50/40 dark:bg-emerald-950/20 ring-2 ring-emerald-500 inset-0 z-10' : ''
                  }`}
                >
                  {/* Day Header */}
                  <div className="flex items-center justify-between mb-1.5 shrink-0">
                    <span className={`text-xs font-black w-6 h-6 flex items-center justify-center rounded-full ${
                      isToday 
                        ? 'bg-emerald-600 text-white shadow-sm' 
                        : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {day}
                    </span>

                    {dayEvents.length > 0 && (
                      <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/80 px-1.5 py-0.5 rounded-full">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Day Events Stack */}
                  <div className="space-y-1 overflow-y-auto custom-scrollbar flex-1">
                    {dayEvents.map(evt => {
                      const config = getCategoryConfig(evt.type);
                      const IconComp = config.icon;
                      
                      return (
                        <div
                          key={evt.id}
                          onClick={() => setSelectedEvent(evt)}
                          className={`p-1.5 rounded-lg text-[10px] sm:text-xs font-semibold border cursor-pointer transition-transform hover:scale-[1.02] shadow-2xs truncate flex items-center gap-1.5 ${config.badgeBg}`}
                          title={`${evt.title} (${evt.courseCode || evt.type})`}
                        >
                          <IconComp className="w-3 h-3 shrink-0" />
                          <span className="truncate font-bold">{evt.courseCode ? `${evt.courseCode}: ` : ''}{evt.title}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Empty End Cells */}
            {Array.from({ length: (7 - ((firstDayOfMonth + daysInMonth) % 7)) % 7 }).map((_, i) => (
              <div key={`empty-end-${i}`} className="bg-slate-50/50 dark:bg-slate-900/20 p-2" />
            ))}

          </div>
        </div>
      )}

      {/* VIEW MODE 2: WEEK TIME GRID (Print Hidden) */}
      {viewMode === 'week' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden print:hidden p-4">
          <h3 className="font-bold text-slate-900 dark:text-white mb-3 text-sm flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            Current Week Schedule View
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((dayName, idx) => {
              const weekDayEvents = filteredEvents.filter(e => new Date(e.startDate).getDay() === idx);
              return (
                <div key={dayName} className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700 min-h-[180px]">
                  <div className="text-xs font-black text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2 mb-2 flex justify-between items-center">
                    <span>{dayName}</span>
                    <span className="text-[10px] bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400">{weekDayEvents.length}</span>
                  </div>
                  
                  <div className="space-y-2">
                    {weekDayEvents.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic">No events</p>
                    ) : (
                      weekDayEvents.map(evt => {
                        const config = getCategoryConfig(evt.type);
                        return (
                          <div 
                            key={evt.id} 
                            onClick={() => setSelectedEvent(evt)}
                            className={`p-2 rounded-lg border text-xs cursor-pointer hover:shadow-md transition-all ${config.badgeBg}`}
                          >
                            <p className="font-extrabold line-clamp-1">{evt.title}</p>
                            <div className="flex items-center gap-1 text-[10px] mt-1 opacity-90">
                              <Clock className="w-3 h-3" />
                              <span>{new Date(evt.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW MODE 3: AGENDA FEED (Print Hidden) */}
      {(viewMode === 'agenda' || searchQuery.length > 0) && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 space-y-4 print:hidden">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
            <h3 className="font-black text-slate-900 dark:text-white text-base flex items-center gap-2">
              <ListFilter className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Chronological Academic Feed
            </h3>
            <span className="text-xs font-bold text-slate-500">
              Showing {filteredEvents.length} scheduled items
            </span>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <CalendarDays className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-600 dark:text-slate-400 font-bold">No academic calendar events match your search or filter.</p>
              <button 
                onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }} 
                className="mt-3 text-xs text-emerald-600 font-bold hover:underline"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEvents.map(evt => {
                const config = getCategoryConfig(evt.type);
                const IconComp = config.icon;
                const isReminded = activeReminders[evt.id];

                return (
                  <div 
                    key={evt.id}
                    className={`p-4 rounded-xl border bg-slate-50/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900 transition-all shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-slate-200 dark:border-slate-700 ${config.borderLeft}`}
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${config.badgeBg} flex items-center gap-1`}>
                          <IconComp className="w-3 h-3" />
                          {config.label}
                        </span>

                        {evt.courseCode && (
                          <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[10px] font-bold font-mono rounded">
                            {evt.courseCode}
                          </span>
                        )}

                        {evt.isImportant && (
                          <span className="px-2 py-0.5 bg-rose-600 text-white text-[10px] font-black rounded-full flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3" /> URGENT
                          </span>
                        )}
                      </div>

                      <h4 
                        onClick={() => setSelectedEvent(evt)} 
                        className="font-black text-slate-900 dark:text-white text-base hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer transition-colors"
                      >
                        {evt.title}
                      </h4>

                      {evt.description && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                          {evt.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1 flex-wrap">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-3.5 h-3.5 text-emerald-600" />
                          {new Date(evt.startDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>

                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(evt.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(evt.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>

                        {evt.venue && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-rose-500" />
                            {evt.venue}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => toggleReminder(evt.id)}
                        className={`p-2 rounded-xl text-xs font-bold transition-all border ${
                          isReminded 
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                        }`}
                        title={isReminded ? 'Cancel Reminder' : 'Set Portal Alert'}
                      >
                        {isReminded ? <BellOff className="w-4 h-4 text-amber-600" /> : <Bell className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => downloadICS(evt)}
                        className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all border border-slate-200 dark:border-slate-700"
                        title="Download .ics event file"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setSelectedEvent(evt)}
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE 4: WEEKLY CLASS TIMETABLE (Print Hidden) */}
      {viewMode === 'timetable' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 space-y-4 print:hidden">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Weekly Lecture & Practical Timetable
              </h3>
              <p className="text-xs text-slate-500">Recurring course lecture slots for registered semester courses.</p>
            </div>
            <span className="px-2.5 py-1 bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 font-bold text-xs rounded-lg">
              Harmattan Semester
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                  <th className="p-3 font-black">Time Slot</th>
                  <th className="p-3 font-black">Monday</th>
                  <th className="p-3 font-black">Tuesday</th>
                  <th className="p-3 font-black">Wednesday</th>
                  <th className="p-3 font-black">Thursday</th>
                  <th className="p-3 font-black">Friday</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                <tr>
                  <td className="p-3 font-bold font-mono text-slate-500 bg-slate-50 dark:bg-slate-900/40">08:00 - 10:00 AM</td>
                  <td className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border-l-2 border-indigo-500">
                    <p className="font-black text-slate-900 dark:text-white">CSC 301: Data Structures</p>
                    <p className="text-[10px] text-slate-500">LT-1 (Main Campus)</p>
                  </td>
                  <td className="p-3 text-slate-400 italic">Free Slot</td>
                  <td className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border-l-2 border-indigo-500">
                    <p className="font-black text-slate-900 dark:text-white">CSC 301: Data Structures</p>
                    <p className="text-[10px] text-slate-500">LT-1 (Main Campus)</p>
                  </td>
                  <td className="p-3 text-slate-400 italic">Free Slot</td>
                  <td className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border-l-2 border-indigo-500">
                    <p className="font-black text-slate-900 dark:text-white">CSC 301 Tutorial</p>
                    <p className="text-[10px] text-slate-500">Lab 2</p>
                  </td>
                </tr>

                <tr>
                  <td className="p-3 font-bold font-mono text-slate-500 bg-slate-50 dark:bg-slate-900/40">10:00 - 12:00 PM</td>
                  <td className="p-3 bg-purple-50/50 dark:bg-purple-950/20 border-l-2 border-purple-500">
                    <p className="font-black text-slate-900 dark:text-white">CSC 401: Adv Software Eng</p>
                    <p className="text-[10px] text-slate-500">Tech Room 104</p>
                  </td>
                  <td className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border-l-2 border-emerald-500">
                    <p className="font-black text-slate-900 dark:text-white">CSC 402: Database Systems</p>
                    <p className="text-[10px] text-slate-500">Auditorium B</p>
                  </td>
                  <td className="p-3 bg-purple-50/50 dark:bg-purple-950/20 border-l-2 border-purple-500">
                    <p className="font-black text-slate-900 dark:text-white">CSC 401: Adv Software Eng</p>
                    <p className="text-[10px] text-slate-500">Tech Room 104</p>
                  </td>
                  <td className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border-l-2 border-emerald-500">
                    <p className="font-black text-slate-900 dark:text-white">CSC 402: Database Systems</p>
                    <p className="text-[10px] text-slate-500">Auditorium B</p>
                  </td>
                  <td className="p-3 text-slate-400 italic">Free Slot</td>
                </tr>

                <tr>
                  <td className="p-3 font-bold font-mono text-slate-500 bg-slate-50 dark:bg-slate-900/40">02:00 - 04:00 PM</td>
                  <td className="p-3 text-slate-400 italic">Free Slot</td>
                  <td className="p-3 bg-rose-50/50 dark:bg-rose-950/20 border-l-2 border-rose-500">
                    <p className="font-black text-slate-900 dark:text-white">CSC 405: Machine Learning</p>
                    <p className="text-[10px] text-slate-500">Innovation Hub</p>
                  </td>
                  <td className="p-3 text-slate-400 italic">Free Slot</td>
                  <td className="p-3 bg-amber-50/50 dark:bg-amber-950/20 border-l-2 border-amber-500">
                    <p className="font-black text-slate-900 dark:text-white">CSC 402 Practical Lab</p>
                    <p className="text-[10px] text-slate-500">Computer Lab 3</p>
                  </td>
                  <td className="p-3 bg-teal-50/50 dark:bg-teal-950/20 border-l-2 border-teal-500">
                    <p className="font-black text-slate-900 dark:text-white">CSC 499 Capstone Meeting</p>
                    <p className="text-[10px] text-slate-500">Department Conference Rm</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EVENT DETAILS MODAL (Print Hidden) */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 print:hidden animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-5 relative">
            
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Category Header */}
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${getCategoryConfig(selectedEvent.type).badgeBg}`}>
                {getCategoryConfig(selectedEvent.type).label}
              </span>
              {selectedEvent.courseCode && (
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold font-mono text-xs rounded-lg">
                  {selectedEvent.courseCode}
                </span>
              )}
            </div>

            {/* Title */}
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white leading-snug">
                {selectedEvent.title}
              </h3>
              {selectedEvent.courseName && (
                <p className="text-xs text-slate-500 font-bold mt-0.5">{selectedEvent.courseName}</p>
              )}
            </div>

            {/* Details Box */}
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <CalendarIcon className="w-4 h-4 text-emerald-600" /> Start Date & Time:
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {new Date(selectedEvent.startDate).toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-400" /> End Date & Time:
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {new Date(selectedEvent.endDate).toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {selectedEvent.venue && (
                <div className="flex items-center justify-between border-t border-slate-200/60 dark:border-slate-800 pt-2">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-rose-500" /> Venue / Location:
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedEvent.venue}</span>
                </div>
              )}

              {selectedEvent.coordinator && (
                <div className="flex items-center justify-between border-t border-slate-200/60 dark:border-slate-800 pt-2">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <User className="w-4 h-4 text-indigo-500" /> Coordinator / Lecturer:
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedEvent.coordinator}</span>
                </div>
              )}
            </div>

            {/* Description */}
            {selectedEvent.description && (
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Description & Guidance:</span>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50/50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                  {selectedEvent.description}
                </p>
              </div>
            )}

            {/* Virtual Link if available */}
            {selectedEvent.virtualLink && (
              <a
                href={selectedEvent.virtualLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 p-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm"
              >
                <Video className="w-4 h-4" /> Join Virtual Lecture / Classroom <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            {/* Actions */}
            <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-700">
              <button
                onClick={() => toggleReminder(selectedEvent.id)}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold hover:bg-slate-200"
              >
                <Bell className="w-4 h-4 text-amber-500" />
                {activeReminders[selectedEvent.id] ? 'Reminder Set' : 'Set Reminder'}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadICS(selectedEvent)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  <Download className="w-4 h-4" /> Save .ics
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* EVENT CREATION MODAL (Print Hidden) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 print:hidden">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar relative">
            
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-950/80 rounded-xl text-emerald-700 dark:text-emerald-400">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Add Academic Event</h3>
                <p className="text-xs text-slate-500">Schedule lectures, exams, deadlines, or personal study reminders.</p>
              </div>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3.5 text-xs">
              
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., CSC 401 Midterm Examination or Assignment Submission"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Event Category *</label>
                  <select
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="exam">🎓 Examination / Quiz</option>
                    <option value="lecture">📚 Lecture / Practical Lab</option>
                    <option value="deadline">⏳ Administrative Deadline</option>
                    <option value="holiday">🌴 Holiday / Recess</option>
                    <option value="seminar">🎤 Seminar / Workshop</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Course Code (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g., CSC 401"
                    value={newEvent.courseCode}
                    onChange={(e) => setNewEvent({ ...newEvent, courseCode: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Start Date & Time *</label>
                  <input
                    type="date"
                    required
                    value={newEvent.startDate}
                    onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white mb-1"
                  />
                  <input
                    type="time"
                    required
                    value={newEvent.startTime}
                    onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">End Date & Time *</label>
                  <input
                    type="date"
                    required
                    value={newEvent.endDate}
                    onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white mb-1"
                  />
                  <input
                    type="time"
                    required
                    value={newEvent.endTime}
                    onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Venue / Hall Location</label>
                <input
                  type="text"
                  placeholder="e.g., Computer Center Lab 3 or Online"
                  value={newEvent.venue}
                  onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Virtual Meeting Link (Optional)</label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/..."
                  value={newEvent.virtualLink}
                  onChange={(e) => setNewEvent({ ...newEvent, virtualLink: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Notes / Guidelines</label>
                <textarea
                  rows={2}
                  placeholder="Provide instructions, materials to bring, or submission guidelines..."
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md"
                >
                  Save & Publish Event
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* DEDICATED PRINT SHEET - Only visible during browser print */}
      <div id="print-area" className="hidden print:block p-8 max-w-4xl mx-auto bg-white text-slate-900 font-sans">
        
        {/* Header Letterhead */}
        <div className="flex items-center justify-between border-b-2 border-emerald-800 pb-4 mb-6">
          <div className="flex items-center gap-4">
            <img 
              src="https://i.ibb.co/4Zh1jQWL/SMART-COLL-OF-TECH-LOGO.jpg" 
              alt="Logo" 
              className="w-14 h-14 object-contain rounded border p-1"
            />
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">SMART GLOBAL COLLEGE OF TECHNOLOGY</h1>
              <p className="text-xs text-emerald-800 font-bold uppercase tracking-wider">Office of Academic Planning & Registry</p>
              <p className="text-[11px] text-slate-500">Official 2026/2027 Academic Session Calendar Report</p>
            </div>
          </div>
          <div className="text-right text-xs">
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 font-bold rounded border border-emerald-300">OFFICIAL CALENDAR</span>
            <p className="text-[10px] text-slate-500 mt-1">Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
          </div>
        </div>

        {/* Print Content Table */}
        <table className="w-full text-left text-xs border-collapse border border-slate-300">
          <thead>
            <tr className="bg-slate-100 text-slate-800 border-b border-slate-300">
              <th className="p-2 border border-slate-300 font-bold">Category</th>
              <th className="p-2 border border-slate-300 font-bold">Event Title</th>
              <th className="p-2 border border-slate-300 font-bold">Course / Code</th>
              <th className="p-2 border border-slate-300 font-bold">Date & Time</th>
              <th className="p-2 border border-slate-300 font-bold">Venue</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.map(e => (
              <tr key={e.id} className="border-b border-slate-200">
                <td className="p-2 border border-slate-300 font-bold uppercase text-[10px]">{e.type}</td>
                <td className="p-2 border border-slate-300 font-semibold">{e.title}</td>
                <td className="p-2 border border-slate-300 font-mono">{e.courseCode || 'N/A'}</td>
                <td className="p-2 border border-slate-300">
                  {new Date(e.startDate).toLocaleDateString()} {new Date(e.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="p-2 border border-slate-300">{e.venue || 'Campus-wide'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-slate-200 text-center text-xs text-slate-500">
          <p className="font-bold text-slate-800">SMART GLOBAL COLLEGE OF TECHNOLOGY — ACADEMIC AFFAIRS</p>
          <p className="text-[10px]">For verification and inquiries, contact academic.registry@sgct.edu.ng</p>
        </div>
      </div>

    </div>
  );
}
