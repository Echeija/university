import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotification } from '../../../contexts/NotificationContext';
import { Home, CheckCircle2, AlertCircle, Clock, Send } from 'lucide-react';

interface Application {
  id: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Allocated';
  session: string;
  applicationDate: string;
  hostelName: string | null;
  roomNumber: string | null;
}

export default function HostelApplication() {
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const { token } = useAuth();
  const { notify } = useNotification();
  const currentSession = "2023/2024";

  useEffect(() => {
    fetch('/api/student/hostel-application', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      setApplication(data);
      setIsLoading(false);
    })
    .catch(err => {
      console.error(err);
      setIsLoading(false);
    });
  }, [token]);

  const handleApply = async () => {
    setIsApplying(true);
    try {
      const res = await fetch('/api/hostels/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ session: currentSession })
      });
      
      if (res.ok) {
        const data = await res.json();
        setApplication({
          id: data.id,
          status: data.status,
          session: data.session,
          applicationDate: data.applicationDate,
          hostelName: null,
          roomNumber: null
        });
        notify({ title: 'Success', message: 'Application submitted successfully', type: 'success' });
      } else {
        const err = await res.json();
        notify({ title: 'Error', message: err.error || 'Failed to apply', type: 'error' });
      }
    } catch (e) {
      console.error(e);
      notify({ title: 'Error', message: 'An unexpected error occurred', type: 'error' });
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <Home className="w-8 h-8 text-indigo-600" />
          Hostel Accommodation
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Apply for on-campus accommodation and track your status.</p>
      </div>

      {isLoading ? (
        <div className="bg-white dark:bg-slate-800 h-64 rounded-2xl border border-slate-100 dark:border-slate-700 animate-pulse"></div>
      ) : application ? (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Application Status</h3>
              <p className="text-slate-500 dark:text-slate-400">Session: {application.session}</p>
            </div>
            <div className={`px-4 py-2 rounded-full font-bold flex items-center gap-2 ${
              application.status === 'Allocated' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
              application.status === 'Approved' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
              application.status === 'Rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
              'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
            }`}>
              {application.status === 'Allocated' && <CheckCircle2 className="w-5 h-5" />}
              {application.status === 'Pending' && <Clock className="w-5 h-5" />}
              {application.status === 'Rejected' && <AlertCircle className="w-5 h-5" />}
              {application.status}
            </div>
          </div>
          
          {application.status === 'Allocated' && application.hostelName && (
            <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-100 dark:border-slate-700">
              <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-4 text-sm uppercase tracking-wider">Allocation Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Hostel Name</p>
                  <p className="font-bold text-lg text-slate-900 dark:text-white">{application.hostelName}</p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Room Number</p>
                  <p className="font-bold text-lg text-slate-900 dark:text-white">{application.roomNumber || 'Not specified'}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-8 text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Applied on: {new Date(application.applicationDate).toLocaleDateString()}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 p-12 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 text-center">
          <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Home className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Apply for Accommodation</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8">
            The hostel application portal for the {currentSession} academic session is now open. Apply early to secure your spot.
          </p>
          <button
            onClick={handleApply}
            disabled={isApplying}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto"
          >
            {isApplying ? (
              <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
            ) : (
              <Send className="w-5 h-5" />
            )}
            {isApplying ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      )}
    </div>
  );
}
