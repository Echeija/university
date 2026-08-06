import React, { useState, useEffect } from 'react';
import { FileText, Send, Clock, CheckCircle2, XCircle, FileOutput } from 'lucide-react';
import { useNotification } from '../../../contexts/NotificationContext';
import { useAuth } from '../../../contexts/AuthContext';

interface TranscriptRequest {
  id: number;
  destination: string;
  purpose: string;
  status: string;
  requestDate: string;
  processedDate: string | null;
}

export default function TranscriptRequests() {
  const [requests, setRequests] = useState<TranscriptRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  const [destination, setDestination] = useState('');
  const [purpose, setPurpose] = useState('');
  
  const { notify } = useNotification();
  const { token } = useAuth();

  useEffect(() => {
    fetchRequests();
  }, [token]);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/transcripts', {
        headers: {
          'Authorization': `Bearer ${token || localStorage.getItem('token')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch('/api/transcripts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          destination,
          purpose
        })
      });
      
      if (res.ok) {
        notify({ title: 'Request Submitted', message: 'Your transcript request has been successfully queued.', type: 'success' });
        setDestination('');
        setPurpose('');
        setShowForm(false);
        fetchRequests();
      } else {
        throw new Error('Failed to submit request');
      }
    } catch (e) {
      notify({ title: 'Error', message: 'Failed to submit transcript request', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 print:p-0 print:m-0 print:max-w-none print:space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-600" />
            Transcript Requests
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Request official academic records for external institutions or personal use.</p>
        </div>
        
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-colors print:hidden"
          >
            <Send className="w-4 h-4" />
            New Request
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm print:hidden">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">New Transcript Request</h2>
            <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Cancel</button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Destination (Institution or Email)</label>
              <input 
                required
                type="text" 
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g., University of Oxford Admissions, or example@institution.edu"
                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Purpose</label>
              <select 
                required
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white"
              >
                <option value="">Select a purpose...</option>
                <option value="Graduate School Application">Graduate School Application</option>
                <option value="Employment/Job Search">Employment/Job Search</option>
                <option value="Scholarship/Grant">Scholarship/Grant</option>
                <option value="Transfer to another institution">Transfer to another institution</option>
                <option value="Personal use">Personal use</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800 mt-4">
              <p className="text-amber-800 dark:text-amber-300 text-sm flex items-start gap-2">
                <Clock className="w-5 h-5 shrink-0" />
                Standard processing time is 3-5 business days. Once processed, an official digital transcript will be securely dispatched to the specified destination.
              </p>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700 mt-6">
              <button 
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden print:shadow-none print:border-none print:rounded-none print:bg-transparent">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Request History</h2>
        </div>
        
        {isLoading ? (
          <div className="p-12 text-center text-slate-500">Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <FileOutput className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No requests yet</h3>
            <p className="text-slate-500 dark:text-slate-400">You haven't requested any transcripts. Use the "New Request" button to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto print:overflow-visible">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-sm text-slate-500 dark:text-slate-400">
                  <th className="p-4 font-bold">Destination</th>
                  <th className="p-4 font-bold">Purpose</th>
                  <th className="p-4 font-bold">Date Requested</th>
                  <th className="p-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {requests.map(req => (
                  <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-medium text-slate-900 dark:text-white">{req.destination}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">{req.purpose}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-400 text-sm">{new Date(req.requestDate).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        req.status === 'Pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                        req.status === 'Processing' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        req.status === 'Sent' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {req.status === 'Sent' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {req.status === 'Rejected' && <XCircle className="w-3.5 h-3.5" />}
                        {req.status === 'Pending' && <Clock className="w-3.5 h-3.5" />}
                        {req.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
