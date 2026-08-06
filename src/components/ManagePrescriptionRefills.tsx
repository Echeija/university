import React, { useState } from 'react';
import { Pill, CheckCircle2, XCircle, Clock, Search, FileText } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';

export default function ManagePrescriptionRefills() {
  const { notify } = useNotification();
  const [filter, setFilter] = useState('Pending');
  const [search, setSearch] = useState('');

  const [requests, setRequests] = useState([
    { id: 1, studentName: 'Jane Smith', studentId: 'STD/2026/001', medication: 'Loratadine 10mg', dosage: '1 tablet daily', requestedDate: '2026-07-15', status: 'Pending', notes: 'Seasonal allergies' },
    { id: 2, studentName: 'John Doe', studentId: 'STD/2026/042', medication: 'Amoxicillin 500mg', dosage: '1 capsule every 8 hours', requestedDate: '2026-07-10', status: 'Approved', notes: 'Completed previous course' },
    { id: 3, studentName: 'Alice Johnson', studentId: 'STD/2026/089', medication: 'Ibuprofen 400mg', dosage: 'As needed for pain', requestedDate: '2026-07-14', status: 'Pending', notes: 'Headaches' },
    { id: 4, studentName: 'Robert Williams', studentId: 'STD/2026/112', medication: 'Adderall 10mg', dosage: '1 tablet morning', requestedDate: '2026-07-12', status: 'Denied', notes: 'Requires in-person consultation' },
  ]);

  const handleApprove = (id: number) => {
    setRequests(requests.map(req => req.id === id ? { ...req, status: 'Approved' } : req));
    notify({
      title: 'Refill Approved',
      message: 'Prescription refill has been approved and sent to pharmacy.',
      type: 'success'
    });
  };

  const handleDeny = (id: number) => {
    setRequests(requests.map(req => req.id === id ? { ...req, status: 'Denied' } : req));
    notify({
      title: 'Refill Denied',
      message: 'Prescription refill request was denied.',
      type: 'error'
    });
  };

  const filteredRequests = requests.filter(req => {
    const matchesFilter = filter === 'All' || req.status === filter;
    const matchesSearch = req.studentName.toLowerCase().includes(search.toLowerCase()) || 
                          req.medication.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Prescription Refill Requests</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Manage student automated refill requests</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search patient or medication..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 w-full sm:w-64"
            />
          </div>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Denied">Denied</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 font-bold">
            <tr>
              <th className="p-4 rounded-tl-lg">Patient</th>
              <th className="p-4">Medication</th>
              <th className="p-4">Requested</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right rounded-tr-lg">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {filteredRequests.map((req) => (
              <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="p-4">
                  <p className="font-bold text-slate-900 dark:text-white">{req.studentName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{req.studentId}</p>
                </td>
                <td className="p-4">
                  <p className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <FileText className="w-3 h-3 text-indigo-500" /> {req.medication}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{req.dosage}</p>
                  {req.notes && <p className="text-[10px] text-slate-400 italic mt-1">Note: {req.notes}</p>}
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-400 font-medium">
                  {req.requestedDate}
                </td>
                <td className="p-4">
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
                      <XCircle className="w-3 h-3" /> Denied
                    </span>
                  )}
                </td>
                <td className="p-4 text-right">
                  {req.status === 'Pending' ? (
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleApprove(req.id)}
                        className="p-1.5 bg-emerald-100 text-emerald-600 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 rounded-lg transition-colors"
                        title="Approve"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeny(req.id)}
                        className="p-1.5 bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                        title="Deny"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">Action taken</span>
                  )}
                </td>
              </tr>
            ))}
            
            {filteredRequests.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500 dark:text-slate-400 font-medium">
                  No refill requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
