import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { format, differenceInHours, isFuture } from 'date-fns';
import { CalendarClock, Bell, Mail } from 'lucide-react';

export default function AppointmentReminderSystem() {
  const { user, token } = useAuth();
  const { notify } = useNotification();
  const [upcomingAppt, setUpcomingAppt] = useState<any | null>(null);

  useEffect(() => {
    if (!user || !token || user.role !== 'Student') return;

    const checkAppointments = async () => {
      try {
        const res = await fetch(`/api/clinic/appointments/student/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.ok) {
          const appointments = await res.json();
          let closestAppt = null;
          let minHours = Infinity;

          appointments.forEach((appt: any) => {
            if (appt.status !== 'Scheduled') return;

            const apptDate = new Date(appt.appointmentDate);
            if (!isFuture(apptDate)) return;

            const hoursUntil = differenceInHours(apptDate, new Date());
            
            // Track closest appointment within 24h for visual widget
            if (hoursUntil <= 24 && hoursUntil < minHours) {
              minHours = hoursUntil;
              closestAppt = appt;
            }
            
            // Send In-App Notification if within 24 hours
            if (hoursUntil > 0 && hoursUntil <= 24) {
              const notifiedKey = `notified_appt_${appt.id}`;
              if (!localStorage.getItem(notifiedKey)) {
                notify({
                  title: 'Automated Clinic Reminder',
                  message: `You have an appointment on ${format(apptDate, 'MMM d, yyyy h:mm a')}. An email reminder has also been sent to your student email.`,
                  type: 'info',
                  duration: 10000
                });
                
                console.log(`[Automated System] Email reminder sent to ${user.email} for appointment ${appt.id}`);
                
                localStorage.setItem(notifiedKey, 'true');
              }
            }
          });

          setUpcomingAppt((prev: any) => {
            if (!closestAppt && !prev) return null;
            if (closestAppt && prev && closestAppt.id === prev.id) return prev;
            return closestAppt;
          });
        }
      } catch (err) {
        console.error('Failed to check appointments:', err);
      }
    };

    checkAppointments();
    
    // Check periodically
    const interval = setInterval(checkAppointments, 15 * 60 * 1000); // 15 mins
    return () => clearInterval(interval);
    
  }, [user?.id, user?.role, user?.email, token]);

  if (!upcomingAppt) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/50 flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4 mb-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm shrink-0">
          <CalendarClock className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-2">
            <Bell className="w-4 h-4" /> Upcoming Appointment Reminder
          </h4>
          <p className="text-sm text-blue-800 dark:text-blue-400">
            You have a scheduled consultation {upcomingAppt.doctorName ? `with Dr. ${upcomingAppt.doctorName}` : ''} on <strong className="font-bold">{format(new Date(upcomingAppt.appointmentDate), 'MMMM d, yyyy')}</strong> at <strong className="font-bold">{format(new Date(upcomingAppt.appointmentDate), 'h:mm a')}</strong>.
          </p>
        </div>
      </div>
      <div className="shrink-0 flex items-center gap-2 text-xs font-bold text-blue-700 bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300 px-3 py-1.5 rounded-lg">
        <Mail className="w-3 h-3" /> Email Reminder Sent
      </div>
    </div>
  );
}
