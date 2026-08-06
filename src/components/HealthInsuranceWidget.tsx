import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { Shield, Plus, Upload, CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function HealthInsuranceWidget({ studentId }: { studentId?: number }) {
  const { token, user } = useAuth();
  const { notify } = useNotification();
  
  const targetId = studentId || user?.id;
  const isClinicRole = user?.role === 'Clinic';
  
  const [records, setRecords] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [providerName, setProviderName] = useState('');
  const [policyNumber, setPolicyNumber] = useState('');
  const [groupNumber, setGroupNumber] = useState('');
  const [coverageStartDate, setCoverageStartDate] = useState('');
  const [coverageEndDate, setCoverageEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (targetId) fetchRecords();
  }, [targetId, token]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/clinic/health-insurance/student/${targetId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRecords(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!providerName || !policyNumber) {
      notify({ title: 'Error', message: 'Provider Name and Policy Number are required', type: 'error' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/clinic/health-insurance', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          providerName,
          policyNumber,
          groupNumber,
          coverageStartDate,
          coverageEndDate
        })
      });

      if (res.ok) {
        notify({ title: 'Success', message: 'Insurance details submitted successfully', type: 'success' });
        setIsAdding(false);
        setProviderName('');
        setPolicyNumber('');
        setGroupNumber('');
        setCoverageStartDate('');
        setCoverageEndDate('');
        fetchRecords();
      } else {
        throw new Error('Failed to submit');
      }
    } catch (e) {
      notify({ title: 'Error', message: 'Failed to submit insurance details', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: string, notes: string = '') => {
    try {
      const res = await fetch(`/api/clinic/health-insurance/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status, verificationNotes: notes })
      });

      if (res.ok) {
        notify({ title: 'Success', message: `Insurance marked as ${status}`, type: 'success' });
        fetchRecords();
      }
    } catch (e) {
      notify({ title: 'Error', message: 'Failed to update status', type: 'error' });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'Rejected': return <XCircle className="w-4 h-4 text-rose-500" />;
      case 'Expired': return <Clock className="w-4 h-4 text-amber-500" />;
      default: return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'Rejected': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
      case 'Expired': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-500" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Health Insurance</h3>
        </div>
        {!isAdding && !isClinicRole && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 rounded-lg transition-colors font-medium"
          >
            <Plus className="w-4 h-4" /> Add Coverage
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>
      ) : isAdding ? (
        <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Provider Name *</label>
              <input 
                type="text" 
                required
                value={providerName}
                onChange={e => setProviderName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-sm"
                placeholder="e.g. Blue Cross"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Policy Number *</label>
              <input 
                type="text" 
                required
                value={policyNumber}
                onChange={e => setPolicyNumber(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Group Number</label>
              <input 
                type="text" 
                value={groupNumber}
                onChange={e => setGroupNumber(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                <input 
                  type="date" 
                  value={coverageStartDate}
                  onChange={e => setCoverageStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">End Date</label>
                <input 
                  type="date" 
                  value={coverageEndDate}
                  onChange={e => setCoverageEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-sm"
                />
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 pt-2 mt-4 border-t border-slate-200 dark:border-slate-700">
            <button 
              type="button" 
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={submitting}
              className="flex-1 flex justify-center items-center gap-2 px-4 py-2 text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Submit Details
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          {records.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
              <Shield className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
              <p className="text-sm text-slate-500">No health insurance coverage found.</p>
            </div>
          ) : (
            records.map(record => (
              <div key={record.id} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{record.providerName}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      {getStatusIcon(record.status)}
                      <span className={`font-medium ${getStatusColor(record.status)} px-1.5 py-0.5 rounded`}>
                        {record.status}
                      </span>
                    </p>
                  </div>
                  {isClinicRole && record.status === 'Pending Verification' && (
                    <div className="flex gap-2">
                      <button onClick={() => handleUpdateStatus(record.id, 'Active')} className="px-2 py-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded text-xs font-bold transition-colors">Verify</button>
                      <button onClick={() => handleUpdateStatus(record.id, 'Rejected')} className="px-2 py-1 bg-rose-100 text-rose-700 hover:bg-rose-200 rounded text-xs font-bold transition-colors">Reject</button>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm mt-4 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                  <div>
                    <p className="text-xs text-slate-500">Policy Number</p>
                    <p className="font-medium text-slate-900 dark:text-slate-100">{record.policyNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Group Number</p>
                    <p className="font-medium text-slate-900 dark:text-slate-100">{record.groupNumber || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Valid From</p>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {record.coverageStartDate ? format(new Date(record.coverageStartDate), 'MMM d, yyyy') : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Valid Until</p>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {record.coverageEndDate ? format(new Date(record.coverageEndDate), 'MMM d, yyyy') : '—'}
                    </p>
                  </div>
                </div>
                
                {record.verificationNotes && (
                  <div className="mt-3 text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 p-2 rounded">
                    <strong>Notes:</strong> {record.verificationNotes}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
