import { motion } from 'motion/react';
import { Calendar as CalendarIcon, Clock, Video } from 'lucide-react';

export default function LmsCalendar() {
  const events = [
    { date: '15', day: 'Mon', title: 'Advanced Algorithms Live Class', time: '10:00 AM', type: 'class' },
    { date: '15', day: 'Mon', title: 'Assignment 1 Due', time: '11:59 PM', type: 'deadline' },
    { date: '18', day: 'Thu', title: 'Midterm Exam: Database Mgt', time: '09:00 AM', type: 'exam' }
  ];

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900">Calendar</h1>
        <p className="text-slate-600 mt-1">Schedule for classes, exams, and deadlines.</p>
      </motion.div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col items-center text-center">
         <CalendarIcon className="w-16 h-16 text-indigo-200 mb-4" />
         <h2 className="text-xl font-bold text-slate-900 mb-2">October 2026</h2>
         <p className="text-slate-500 max-w-md mb-8">This is a simplified view of your upcoming academic events. A full interactive calendar will be synced with your Google/Outlook calendar.</p>
         
         <div className="w-full max-w-2xl space-y-4 text-left">
           {events.map((evt, i) => (
             <div key={i} className="flex gap-6 bg-slate-50 border border-slate-100 p-4 rounded-2xl hover:border-indigo-200 transition-colors">
               <div className="w-16 h-16 bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-center shrink-0 shadow-sm">
                 <span className="text-xs font-bold text-rose-500 uppercase">{evt.day}</span>
                 <span className="text-xl font-black text-slate-900 leading-none">{evt.date}</span>
               </div>
               <div className="flex-1 flex flex-col justify-center">
                 <h4 className="font-bold text-slate-900">{evt.title}</h4>
                 <div className="flex items-center gap-4 mt-1 text-sm text-slate-500 font-medium">
                   <span className="flex items-center gap-1"><Clock className="w-4 h-4"/> {evt.time}</span>
                   {evt.type === 'class' && <span className="flex items-center gap-1 text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded"><Video className="w-3 h-3"/> Live Class</span>}
                   {evt.type === 'exam' && <span className="flex items-center gap-1 text-rose-600 bg-rose-100 px-2 py-0.5 rounded">Exam</span>}
                 </div>
               </div>
             </div>
           ))}
         </div>
      </div>
    </div>
  );
}
