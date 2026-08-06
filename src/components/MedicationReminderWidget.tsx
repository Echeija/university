import React, { useState, useEffect } from 'react';
import { Pill, Clock, Plus, Trash2, Power, PowerOff, X, Check, Bell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { format, parseISO, isAfter, isBefore } from 'date-fns';

export default function MedicationReminderWidget() {
  const { token } = useAuth();
  const { notify } = useNotification();
  const [medications, setMedications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    medicationName: '',
    dosage: '',
    frequency: 'Daily',
    times: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    notes: ''
  });

  useEffect(() => {
    fetchMedications();
  }, [token]);

  const fetchMedications = async () => {
    try {
      const res = await fetch('/api/clinic/medications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setMedications(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.medicationName || !formData.dosage || !formData.times) {
      notify({ title: 'Error', message: 'Please fill in required fields', type: 'error' });
      return;
    }

    try {
      const res = await fetch('/api/clinic/medications', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        notify({ title: 'Success', message: 'Medication reminder added', type: 'success' });
        setIsAdding(false);
        setFormData({
          medicationName: '',
          dosage: '',
          frequency: 'Daily',
          times: '',
          startDate: new Date().toISOString().split('T')[0],
          endDate: '',
          notes: ''
        });
        fetchMedications();
      } else {
        notify({ title: 'Error', message: 'Failed to add reminder', type: 'error' });
      }
    } catch (e) {
      notify({ title: 'Error', message: 'An error occurred', type: 'error' });
    }
  };

  const toggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/clinic/medications/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      if (res.ok) {
        setMedications(medications.map(m => m.id === id ? { ...m, isActive: !currentStatus } : m));
        notify({ title: 'Success', message: `Reminder turned ${!currentStatus ? 'on' : 'off'}`, type: 'success' });
      }
    } catch (e) {
      notify({ title: 'Error', message: 'Failed to update reminder', type: 'error' });
    }
  };

  const deleteMedication = async (id: number) => {
    if (!confirm('Are you sure you want to delete this medication?')) return;
    try {
      const res = await fetch(`/api/clinic/medications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setMedications(medications.filter(m => m.id !== id));
        notify({ title: 'Success', message: 'Medication removed', type: 'success' });
      }
    } catch (e) {
      notify({ title: 'Error', message: 'Failed to delete medication', type: 'error' });
    }
  };

  // Check if any doses are due soon (just a visual feature for today)
  const isTimeApproaching = (timeStr: string) => {
    const now = new Date();
    const [hours, minutes] = timeStr.split(':').map(Number);
    const targetTime = new Date(now);
    targetTime.setHours(hours, minutes, 0, 0);
    
    // If within 1 hour ahead
    const diff = targetTime.getTime() - now.getTime();
    return diff > 0 && diff < 60 * 60 * 1000;
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Pill className="w-5 h-5 text-indigo-500" />
          Medication Reminders
        </h3>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Medication
          </button>
        )}
      </div>

      {isAdding ? (
        <form onSubmit={handleSave} className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-2 border-b border-slate-100 pb-2">
            <h4 className="font-medium text-slate-800 dark:text-slate-200">New Medication</h4>
            <button type="button" onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Medication Name *</label>
              <input type="text" required value={formData.medicationName} onChange={e => setFormData({...formData, medicationName: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Amoxicillin" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Dosage *</label>
              <input type="text" required value={formData.dosage} onChange={e => setFormData({...formData, dosage: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" placeholder="e.g. 500mg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Frequency</label>
              <select value={formData.frequency} onChange={e => setFormData({...formData, frequency: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white">
                <option value="Daily">Daily</option>
                <option value="Twice a day">Twice a day</option>
                <option value="Weekly">Weekly</option>
                <option value="As needed">As needed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Times * (Comma separated)</label>
              <input type="text" required value={formData.times} onChange={e => setFormData({...formData, times: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" placeholder="e.g. 08:00, 20:00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
              <input type="date" required value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">End Date (Optional)</label>
              <input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          
          <div className="flex justify-end pt-2">
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
              Save Medication
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          {isLoading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2].map(i => <div key={i} className="h-16 bg-slate-100 dark:bg-slate-700 rounded-xl"></div>)}
            </div>
          ) : medications.length > 0 ? (
            medications.map(med => (
              <div key={med.id} className={`p-4 border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${med.isActive ? 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800' : 'border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 opacity-60'}`}>
                <div className="flex gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${med.isActive ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-500'}`}>
                    <Pill className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className={`font-semibold ${med.isActive ? 'text-slate-800 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'}`}>
                      {med.medicationName} <span className="text-xs font-normal text-slate-500 ml-1">({med.dosage})</span>
                    </h4>
                    <p className="text-sm text-slate-500 flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {med.frequency}</span>
                      <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-md">{med.times}</span>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {med.isActive && med.times.split(',').map(t => t.trim()).some(isTimeApproaching) && (
                    <span className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-md animate-pulse">
                      <Bell className="w-3.5 h-3.5" /> Due soon
                    </span>
                  )}
                  <button 
                    onClick={() => toggleStatus(med.id, med.isActive)}
                    className={`p-2 rounded-lg transition-colors ${med.isActive ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'}`}
                    title={med.isActive ? 'Turn Off Reminder' : 'Turn On Reminder'}
                  >
                    {med.isActive ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => deleteMedication(med.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Pill className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 font-medium mb-1">No medication reminders</p>
              <p className="text-sm text-slate-400 mb-4">Add your prescriptions to get timely alerts</p>
              <button
                onClick={() => setIsAdding(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                Add First Medication
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
