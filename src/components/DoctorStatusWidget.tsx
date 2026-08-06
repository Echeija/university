import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { Activity, Clock, CheckCircle2, UserX } from 'lucide-react';

export default function DoctorStatusWidget() {
  const { token, user } = useAuth();
  const { notify } = useNotification();
  const [status, setStatus] = useState<string>('Available');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch initial status if available in user object or from API
    // We can just fetch it from the API to be safe
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/clinic/doctors', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const doctors = await res.json();
          const me = doctors.find((d: any) => d.id === user?.id);
          if (me && me.doctorStatus) setStatus(me.doctorStatus);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchStatus();
  }, [token]);

  const updateStatus = async (newStatus: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/clinic/doctor-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (res.ok) {
        setStatus(newStatus);
        notify({ title: 'Status Updated', message: `You are now marked as ${newStatus}`, type: 'success' });
      } else {
        throw new Error('Failed to update status');
      }
    } catch (e) {
      notify({ title: 'Error', message: 'Failed to update status', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'Clinic') return null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${
          status === 'Available' ? 'bg-emerald-100 text-emerald-600' : 
          status === 'In Consultation' ? 'bg-blue-100 text-blue-600' : 
          'bg-slate-100 text-slate-600'
        }`}>
          <Activity className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">My Status</h3>
          <p className="text-xs text-slate-500">Students see this when booking</p>
        </div>
      </div>
      
      <div className="flex bg-slate-100 dark:bg-slate-900/50 rounded-lg p-1">
        <button 
          disabled={loading}
          onClick={() => updateStatus('Available')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            status === 'Available' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" /> Available
        </button>
        <button 
          disabled={loading}
          onClick={() => updateStatus('In Consultation')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            status === 'In Consultation' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Clock className="w-3.5 h-3.5" /> In Consultation
        </button>
        <button 
          disabled={loading}
          onClick={() => updateStatus('Away')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            status === 'Away' ? 'bg-white text-slate-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <UserX className="w-3.5 h-3.5" /> Away
        </button>
      </div>
    </div>
  );
}
