import React, { useState } from 'react';
import { Pill, CheckCircle2, AlertCircle, Send, Clock, Calendar } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';

export default function PrescriptionRefillWidget() {
  const { notify } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    medicationName: '',
    dosage: '',
    pharmacyPref: 'Campus Pharmacy'
  });

  const [requests, setRequests] = useState([
    { id: 1, medication: 'Amoxicillin 500mg', date: '2026-07-10', status: 'Approved' },
    { id: 2, medication: 'Loratadine 10mg', date: '2026-07-15', status: 'Pending' }
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      setIsSubmitting(false);
      setRequests([
        { 
          id: Date.now(), 
          medication: formData.medicationName, 
          date: new Date().toISOString().split('T')[0], 
          status: 'Pending' 
        },
        ...requests
      ]);
      setFormData({ medicationName: '', dosage: '', pharmacyPref: 'Campus Pharmacy' });
      notify({
        title: 'Refill Requested',
        message: 'Your prescription refill request has been sent to the clinic.',
        type: 'success'
      });
    }, 1000);
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
          <Pill className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white">Prescription Refill</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Request automated medication refills</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Medication Name
              </label>
              <input
                type="text"
                required
                value={formData.medicationName}
                onChange={(e) => setFormData({ ...formData, medicationName: e.target.value })}
                placeholder="e.g. Albuterol Inhaler"
                className="block w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Current Dosage (Optional)
              </label>
              <input
                type="text"
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                placeholder="e.g. 2 puffs every 4 hours"
                className="block w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Pickup Location
              </label>
              <select
                value={formData.pharmacyPref}
                onChange={(e) => setFormData({ ...formData, pharmacyPref: e.target.value })}
                className="block w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium text-sm"
              >
                <option>Campus Pharmacy</option>
                <option>City Center Pharmacy</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={!formData.medicationName || isSubmitting}
              className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Sending Request...' : <><Send className="w-4 h-4" /> Request Refill</>}
            </button>
          </form>
        </div>
        
        <div>
          <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300 mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">
            Recent Requests
          </h4>
          <div className="space-y-3">
            {requests.map(req => (
              <div key={req.id} className="p-3 border border-slate-100 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/30 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{req.medication}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                    <Calendar className="w-3 h-3" /> {req.date}
                  </p>
                </div>
                <div>
                  {req.status === 'Approved' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" /> Approved
                    </span>
                  ) : req.status === 'Pending' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                      <Clock className="w-3 h-3" /> Pending
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                      <AlertCircle className="w-3 h-3" /> Denied
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
