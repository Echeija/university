import React, { useEffect, useState } from 'react';
import { Users, Clock, ArrowRight, UserCheck } from 'lucide-react';
import { format, isToday } from 'date-fns';

export default function ClinicQueueWidget({ appointments }: { appointments: any[] }) {
  const [waitingPatients, setWaitingPatients] = useState<any[]>([]);

  useEffect(() => {
    // Filter appointments for today that are either 'Scheduled' (waiting) or specifically 'Checked In' if we had that status
    const todayAppointments = appointments.filter(appt => {
      const isApptToday = isToday(new Date(appt.appointmentDate));
      const isWaiting = appt.status === 'Scheduled'; // Using 'Scheduled' for today as waiting
      return isApptToday && isWaiting;
    }).sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());

    setWaitingPatients(todayAppointments);
  }, [appointments]);

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Live Patient Queue</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Current waiting room status</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Live</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 text-center">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Currently Waiting</p>
          <p className="text-3xl font-black text-amber-600 dark:text-amber-400">{waitingPatients.length}</p>
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 text-center">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Est. Wait Time</p>
          <p className="text-3xl font-black text-blue-600 dark:text-blue-400">{waitingPatients.length * 15} <span className="text-sm font-medium">min</span></p>
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 text-center">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Next Up</p>
          <p className="text-lg font-bold text-slate-900 dark:text-white truncate">
            {waitingPatients.length > 0 ? waitingPatients[0].studentName : 'None'}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {waitingPatients.length > 0 ? (
          waitingPatients.map((patient, index) => (
            <div key={patient.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-xs">
                  {index + 1}
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{patient.studentName}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {format(new Date(patient.appointmentDate), 'h:mm a')}
                  </p>
                </div>
              </div>
              <button className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 rounded-lg text-xs font-bold transition-colors">
                <UserCheck className="w-3 h-3" /> Call In
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-slate-500 dark:text-slate-400 text-sm font-medium bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
            No patients currently waiting in the queue.
          </div>
        )}
      </div>
    </div>
  );
}
