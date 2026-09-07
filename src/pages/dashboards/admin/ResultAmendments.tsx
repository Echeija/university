import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotification } from '../../../contexts/NotificationContext';
import { Edit, CheckCircle, XCircle, Search, Clock, FileWarning } from 'lucide-react';

export default function ResultAmendments() {
  const { token, user } = useAuth();
  const { notify } = useNotification();
  const [amendments, setAmendments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAmendments();
  }, [token]);

  const fetchAmendments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/amendments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setAmendments(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    try {
      const res = await fetch(`/api/admin/amendments/${id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        notify({ title: 'Success', message: `Amendment ${action}d successfully`, type: 'success' });
        fetchAmendments();
      } else {
        notify({ title: 'Error', message: 'Failed to process amendment', type: 'error' });
      }
    } catch (e) {
      notify({ title: 'Error', message: 'Network error', type: 'error' });
    }
  };

  const filtered = amendments.filter(a => 
    a.course?.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.requestedBy?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const role = user?.role;
  if (role !== 'Administrator' && role !== 'Registrar') {
    return <div className="p-8 text-center text-slate-500">Access Restricted</div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Amendment Requests</h2>
          <p className="text-slate-500 mt-1">Review and approve changes to published academic results.</p>
        </div>
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search amendments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 w-full sm:w-64"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500">Loading amendments...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl shadow-sm border border-slate-200">
            <FileWarning className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-700">No Amendment Requests</h3>
            <p className="text-slate-500">All caught up! There are no pending requests matching your criteria.</p>
          </div>
        ) : (
          filtered.map(amend => (
            <div key={amend.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row gap-6 md:items-center justify-between hover:shadow-md transition-shadow">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    amend.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                    amend.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {amend.status === 'pending' && <Clock className="w-3.5 h-3.5" />}
                    {amend.status === 'approved' && <CheckCircle className="w-3.5 h-3.5" />}
                    {amend.status === 'rejected' && <XCircle className="w-3.5 h-3.5" />}
                    {amend.status.toUpperCase()}
                  </span>
                  <span className="text-sm text-slate-500">
                    Requested on {new Date(amend.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{amend.course?.code} - {amend.course?.title}</p>
                    <p className="text-sm text-slate-500 mt-1">Requested by: {amend.requestedBy?.name}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-500">CA Score:</span>
                      <span className="font-bold"><span className="text-red-500 line-through mr-2">{amend.oldCa}</span> <span className="text-emerald-600">{amend.newCa}</span></span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Exam Score:</span>
                      <span className="font-bold"><span className="text-red-500 line-through mr-2">{amend.oldExam}</span> <span className="text-emerald-600">{amend.newExam}</span></span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Reason for Amendment</p>
                  <p className="text-sm text-slate-700 mt-1">{amend.reason}</p>
                </div>
              </div>
              
              {amend.status === 'pending' && (
                <div className="flex md:flex-col gap-3 shrink-0">
                  <button 
                    onClick={() => handleAction(amend.id, 'approve')}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors"
                  >
                    <CheckCircle className="w-5 h-5" /> Approve
                  </button>
                  <button 
                    onClick={() => handleAction(amend.id, 'reject')}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl font-bold transition-colors"
                  >
                    <XCircle className="w-5 h-5" /> Reject
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
