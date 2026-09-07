import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotification } from '../../../contexts/NotificationContext';
import { Calendar, Book, Clock, CheckCircle2, XCircle, AlertCircle, Download, Printer } from 'lucide-react';

interface AttendanceRecord {
  id: number;
  courseId: number;
  courseCode: string;
  courseTitle: string;
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
}

export default function StudentAttendance() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();
  
  useEffect(() => {
    fetch('/api/attendance/student', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      setRecords(Array.isArray(data) ? data : []);
      setIsLoading(false);
    })
    .catch(err => {
      console.error(err);
      setIsLoading(false);
    });
  }, [token]);

  const courseStats = useMemo(() => {
    const stats: Record<string, { total: number; present: number; absent: number; late: number; excused: number; title: string }> = {};
    
    records.forEach(r => {
      if (!stats[r.courseCode]) {
        stats[r.courseCode] = { total: 0, present: 0, absent: 0, late: 0, excused: 0, title: r.courseTitle };
      }
      stats[r.courseCode].total += 1;
      if (r.status === 'Present') stats[r.courseCode].present += 1;
      if (r.status === 'Absent') stats[r.courseCode].absent += 1;
      if (r.status === 'Late') stats[r.courseCode].late += 1;
      if (r.status === 'Excused') stats[r.courseCode].excused += 1;
    });

    return stats;
  }, [records]);


  const handleExportCSV = () => {
    const headers = ['Course Code', 'Course Title', 'Present', 'Absent', 'Late', 'Excused', 'Total', 'Percentage'];
    const rows = Object.entries(courseStats).map(([code, stat]) => {
      const percentage = getPercentage((stat as any).present, (stat as any).late, (stat as any).total);
      return [
        code,
        `"${(stat as any).title}"`,
        (stat as any).present,
        (stat as any).absent,
        (stat as any).late,
        (stat as any).excused,
        (stat as any).total,
        `${percentage}%`
      ];
    });
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'my_attendance.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const getPercentage = (present: number, late: number, total: number) => {
    if (total === 0) return 0;
    // Late counts as 0.5 present maybe? Or just count present. Let's just do Present / Total
    return Math.round((present / total) * 100);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Present': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'Absent': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'Late': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'Excused': return <AlertCircle className="w-4 h-4 text-blue-500" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Calendar className="w-8 h-8 text-indigo-600" />
            My Attendance
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">View your course attendance records and percentages.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 rounded-xl text-sm font-bold transition-colors"
          >
            <Download className="w-4 h-4" /> CSV
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-bold transition-colors"
          >
            <Printer className="w-4 h-4" /> PDF/Print
          </button>
        </div>
      </div>


      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map(i => <div key={i} className="bg-white dark:bg-slate-800 h-48 rounded-2xl border border-slate-100 dark:border-slate-700 animate-pulse"></div>)}
        </div>
      ) : Object.keys(courseStats).length === 0 ? (
        <div className="bg-white dark:bg-slate-800 p-12 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 text-center">
          <Book className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">No attendance records found</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Your lecturers have not marked any attendance for you yet.</p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(courseStats).map(([code, stat]) => {
              const percentage = getPercentage((stat as any).present, (stat as any).late, (stat as any).total);
              
              return (
                <div key={code} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white">{code}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">{(stat as any).title}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                      percentage >= 75 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                      percentage >= 50 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {percentage}%
                    </div>
                  </div>
                  
                  <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 mb-6">
                    <div 
                      className={`h-2 rounded-full ${percentage >= 75 ? 'bg-emerald-500' : percentage >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-center text-xs">
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-lg py-2">
                      <span className="block font-bold text-slate-900 dark:text-white">{(stat as any).present}</span>
                      <span className="text-slate-500 dark:text-slate-400">Present</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-lg py-2">
                      <span className="block font-bold text-slate-900 dark:text-white">{(stat as any).absent}</span>
                      <span className="text-slate-500 dark:text-slate-400">Absent</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-lg py-2">
                      <span className="block font-bold text-slate-900 dark:text-white">{(stat as any).late}</span>
                      <span className="text-slate-500 dark:text-slate-400">Late</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-lg py-2">
                      <span className="block font-bold text-slate-900 dark:text-white">{(stat as any).total}</span>
                      <span className="text-slate-500 dark:text-slate-400">Total</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                Recent Attendance Logs
              </h3>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-[400px] overflow-y-auto">
              {records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(record => (
                <div key={record.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-900">
                      {getStatusIcon(record.status)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{record.courseCode}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(record.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    record.status === 'Present' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                    record.status === 'Absent' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                    record.status === 'Late' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  }`}>
                    {record.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
