import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotification } from '../../../contexts/NotificationContext';
import { ClipboardList, Check, X, Building } from 'lucide-react';

interface Application {
  id: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Allocated';
  session: string;
  applicationDate: string;
  studentName: string;
  studentMatric: string;
  hostelName: string | null;
  roomNumber: string | null;
}

export default function HostelApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hostels, setHostels] = useState<any[]>([]);
  const [selectedApp, setSelectedApp] = useState<number | null>(null);
  const [allocationData, setAllocationData] = useState({ hostelId: '', roomId: '' });
  const [rooms, setRooms] = useState<any[]>([]);
  
  const { token } = useAuth();
  const { notify } = useNotification();

  useEffect(() => {
    fetchApplications();
    fetchHostels();
  }, [token]);

  const fetchApplications = () => {
    fetch('/api/hostel-applications', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      setApplications(Array.isArray(data) ? data : []);
      setIsLoading(false);
    })
    .catch(err => {
      console.error(err);
      setIsLoading(false);
    });
  };

  const fetchHostels = () => {
    fetch('/api/hostels', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setHostels(Array.isArray(data) ? data : []));
  };

  const fetchRooms = (hostelId: string) => {
    fetch(`/api/hostels/${hostelId}/rooms`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setRooms(Array.isArray(data) ? data : []));
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/hostel-applications/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      
      if (res.ok) {
        notify({ title: 'Success', message: `Application ${status.toLowerCase()} successfully`, type: 'success' });
        fetchApplications();
      } else {
        notify({ title: 'Error', message: 'Failed to update status', type: 'error' });
      }
    } catch (e) {
      console.error(e);
      notify({ title: 'Error', message: 'An unexpected error occurred', type: 'error' });
    }
  };

  const handleAllocate = async (id: number) => {
    if (!allocationData.hostelId || !allocationData.roomId) {
      notify({ title: 'Error', message: 'Please select a hostel and a room', type: 'error' });
      return;
    }
    try {
      const res = await fetch(`/api/hostel-applications/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          status: 'Allocated',
          hostelId: allocationData.hostelId,
          roomId: allocationData.roomId
        })
      });
      
      if (res.ok) {
        notify({ title: 'Success', message: 'Room allocated successfully', type: 'success' });
        setSelectedApp(null);
        setAllocationData({ hostelId: '', roomId: '' });
        fetchApplications();
      } else {
        notify({ title: 'Error', message: 'Failed to allocate room', type: 'error' });
      }
    } catch (e) {
      console.error(e);
      notify({ title: 'Error', message: 'An unexpected error occurred', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <ClipboardList className="w-8 h-8 text-indigo-600" />
          Hostel Applications
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Review and manage student accommodation requests.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                <th className="p-4 font-bold text-slate-700 dark:text-slate-300">Student</th>
                <th className="p-4 font-bold text-slate-700 dark:text-slate-300">Session</th>
                <th className="p-4 font-bold text-slate-700 dark:text-slate-300">Date</th>
                <th className="p-4 font-bold text-slate-700 dark:text-slate-300">Status</th>
                <th className="p-4 font-bold text-slate-700 dark:text-slate-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Loading applications...</td></tr>
              ) : applications.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">No applications found.</td></tr>
              ) : applications.map(app => (
                <tr key={app.id} className="border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-900/50">
                  <td className="p-4">
                    <p className="font-bold text-slate-900 dark:text-white">{app.studentName}</p>
                    <p className="text-sm text-slate-500">{app.studentMatric}</p>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">{app.session}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">{new Date(app.applicationDate).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      app.status === 'Allocated' ? 'bg-emerald-100 text-emerald-700' : 
                      app.status === 'Approved' ? 'bg-blue-100 text-blue-700' : 
                      app.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {app.status}
                    </span>
                    {app.status === 'Allocated' && (
                      <p className="text-xs text-slate-500 mt-1">{app.hostelName} - Room {app.roomNumber}</p>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {app.status === 'Pending' && (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleUpdateStatus(app.id, 'Approved')} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded" title="Approve">
                          <Check className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleUpdateStatus(app.id, 'Rejected')} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded" title="Reject">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                    {app.status === 'Approved' && selectedApp !== app.id && (
                      <button 
                        onClick={() => setSelectedApp(app.id)} 
                        className="px-3 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 rounded hover:bg-indigo-200 text-sm font-medium flex items-center gap-2 ml-auto"
                      >
                        <Building className="w-4 h-4" /> Allocate Room
                      </button>
                    )}
                    
                    {selectedApp === app.id && (
                      <div className="mt-2 text-left bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700 w-64 ml-auto">
                        <select 
                          className="w-full mb-2 px-2 py-1 text-sm border rounded dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                          value={allocationData.hostelId}
                          onChange={(e) => {
                            setAllocationData({ hostelId: e.target.value, roomId: '' });
                            fetchRooms(e.target.value);
                          }}
                        >
                          <option value="">Select Hostel</option>
                          {hostels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                        </select>
                        <select 
                          className="w-full mb-2 px-2 py-1 text-sm border rounded dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                          value={allocationData.roomId}
                          onChange={(e) => setAllocationData({ ...allocationData, roomId: e.target.value })}
                          disabled={!allocationData.hostelId}
                        >
                          <option value="">Select Room</option>
                          {rooms.map(r => <option key={r.id} value={r.id}>{r.roomNumber} ({r.occupancy}/{r.capacity})</option>)}
                        </select>
                        <div className="flex justify-end gap-2 mt-2">
                          <button onClick={() => setSelectedApp(null)} className="px-2 py-1 text-xs bg-slate-200 dark:bg-slate-700 rounded hover:bg-slate-300 dark:hover:bg-slate-600">Cancel</button>
                          <button onClick={() => handleAllocate(app.id)} className="px-2 py-1 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700">Confirm</button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
