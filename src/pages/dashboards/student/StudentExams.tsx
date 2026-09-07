import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { Calendar, Clock, MapPin, AlertCircle, FileText } from 'lucide-react';
import { Skeleton } from '../../../components/ui/Skeleton';

export default function StudentExams() {
  const { token } = useAuth();
  const [exams, setExams] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/student/exams', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        setExams(data);
        setIsLoading(false);
      });
  }, [token]);

  // Sort exams by date
  const sortedExams = [...exams].sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime());

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">My Exam Schedule</h2>
        <p className="text-slate-500 mt-1">View timetables and instructions for your registered courses.</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <p className="font-bold mb-1">Exam Instructions</p>
          <ul className="list-disc pl-4 space-y-1 opacity-90">
            <li>Arrive at the examination venue at least 30 minutes before the start time.</li>
            <li>You must present your valid student ID card and exam pass to enter the hall.</li>
            <li>Mobile phones and unauthorized materials are strictly prohibited.</li>
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : sortedExams.length === 0 ? (
          <div className="p-16 text-center">
            <Calendar className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700">No Exams Scheduled</h3>
            <p className="text-slate-500 mt-2">There are currently no exams scheduled for your registered courses.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {sortedExams.map(exam => (
              <div key={exam.id} className="p-6 flex flex-col md:flex-row md:items-center gap-6 hover:bg-slate-50 transition-colors">
                <div className="shrink-0 text-center bg-indigo-50 text-indigo-900 rounded-xl p-3 min-w-[100px] border border-indigo-100/50">
                  <div className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">
                    {new Date(exam.examDate).toLocaleDateString(undefined, { month: 'short' })}
                  </div>
                  <div className="text-3xl font-black">
                    {new Date(exam.examDate).getDate()}
                  </div>
                </div>
                
                <div className="flex-1 space-y-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-slate-900 text-white text-[10px] font-bold rounded uppercase tracking-wider">
                        {exam.courseCode}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{exam.courseTitle}</h3>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-slate-400" />
                      {exam.startTime} - {exam.endTime}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      {exam.venue}
                    </div>
                  </div>
                  
                  {exam.instructions && (
                    <div className="flex items-start gap-2 text-sm text-indigo-700 bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-100">
                      <FileText className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{exam.instructions}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
