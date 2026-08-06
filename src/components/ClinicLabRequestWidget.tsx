import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { Beaker, Plus, Loader2, Send, CheckCircle2, FlaskConical, Clock } from 'lucide-react';
import { format } from 'date-fns';

const COMMON_TESTS = [
  'Complete Blood Count (CBC)',
  'Malaria Parasite (MP)',
  'Widal Test (Typhoid)',
  'Urinalysis',
  'Fasting Blood Sugar (FBS)',
  'Lipid Profile',
  'Liver Function Test (LFT)',
  'Kidney Function Test (KFT)',
  'Hepatitis B Surface Antigen (HBsAg)',
  'HIV Screening'
];

export default function ClinicLabRequestWidget({ student }: { student: any }) {
  const { token, user } = useAuth();
  const { notify } = useNotification();
  
  const [requests, setRequests] = useState<any[]>([]);
  const [isRequesting, setIsRequesting] = useState(false);
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [customTest, setCustomTest] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (student) {
      fetchRequests();
    }
  }, [student, token]);

  const fetchRequests = async () => {
    try {
      const res = await fetch(`/api/clinic/lab-requests/student/${student.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setRequests(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const toggleTest = (test: string) => {
    if (selectedTests.includes(test)) {
      setSelectedTests(selectedTests.filter(t => t !== test));
    } else {
      setSelectedTests([...selectedTests, test]);
    }
  };

  const handleAddCustomTest = () => {
    if (customTest.trim() && !selectedTests.includes(customTest.trim())) {
      setSelectedTests([...selectedTests, customTest.trim()]);
      setCustomTest('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTests.length === 0) {
      notify({ title: 'Error', message: 'Please select at least one test', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/clinic/lab-requests', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          studentId: student.id,
          testsRequested: selectedTests,
          notes
        })
      });

      if (res.ok) {
        notify({ title: 'Success', message: 'Lab request sent successfully', type: 'success' });
        setIsRequesting(false);
        setSelectedTests([]);
        setNotes('');
        fetchRequests();
      } else {
        throw new Error('Failed to send request');
      }
    } catch (e) {
      notify({ title: 'Error', message: 'Failed to send lab request', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'In Progress': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Completed': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-indigo-500" />
          Laboratory Requests
        </h3>
        {!isRequesting && (
          <button 
            onClick={() => setIsRequesting(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 rounded-lg transition-colors font-medium"
          >
            <Plus className="w-4 h-4" /> New Request
          </button>
        )}
      </div>

      {isRequesting ? (
        <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Select Tests</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
              {COMMON_TESTS.map(test => (
                <label key={test} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                  <input 
                    type="checkbox" 
                    checked={selectedTests.includes(test)}
                    onChange={() => toggleTest(test)}
                    className="text-indigo-600 focus:ring-indigo-500 rounded"
                  />
                  {test}
                </label>
              ))}
            </div>
            
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Other test (specify)"
                value={customTest}
                onChange={e => setCustomTest(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddCustomTest())}
                className="flex-1 px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
              />
              <button 
                type="button" 
                onClick={handleAddCustomTest}
                className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              >
                Add
              </button>
            </div>
            
            {selectedTests.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-wrap gap-2">
                {selectedTests.map(test => (
                  <span key={test} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">
                    {test}
                    <button type="button" onClick={() => toggleTest(test)} className="hover:text-indigo-900 dark:hover:text-indigo-100">&times;</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Clinical Notes (Optional)</label>
            <textarea
              rows={2}
              placeholder="E.g., Patient experiencing high fever and chills for 3 days."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-slate-50 dark:bg-slate-900 text-sm"
            ></textarea>
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              type="button" 
              onClick={() => setIsRequesting(false)}
              className="flex-1 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-[2] flex justify-center items-center gap-2 py-2 text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send Request to Lab
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
              <Beaker className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No lab requests for this patient.</p>
            </div>
          ) : (
            requests.map(req => {
              const tests = typeof req.testsRequested === 'string' ? JSON.parse(req.testsRequested) : req.testsRequested;
              return (
                <div key={req.id} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mb-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(req.createdAt), 'MMM d, yyyy h:mm a')}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {tests.map((test: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs rounded shadow-sm">{test}</span>
                        ))}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(req.status)}`}>
                      {req.status}
                    </span>
                  </div>
                  
                  {(req.notes || req.resultsSummary) && (
                    <div className="text-sm pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
                      {req.notes && (
                        <div><span className="font-bold text-slate-600 dark:text-slate-400">Notes:</span> <span className="text-slate-700 dark:text-slate-300">{req.notes}</span></div>
                      )}
                      {req.resultsSummary && (
                        <div className="bg-white dark:bg-slate-800 p-2 rounded border border-slate-100 dark:border-slate-700">
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">Results:</span> <span className="text-slate-700 dark:text-slate-300">{req.resultsSummary}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
