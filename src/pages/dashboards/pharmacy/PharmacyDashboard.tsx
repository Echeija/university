import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotification } from '../../../contexts/NotificationContext';
import { Activity, Pill, CheckCircle2, Clock, Search } from 'lucide-react';
import PharmacyInventory from '../clinic/PharmacyInventory';
import { format } from 'date-fns';
import SkeletonLoader from '../../../components/SkeletonLoader';

export default function PharmacyDashboard() {
  const { token } = useAuth();
  const { notify } = useNotification();
  const [activeTab, setActiveTab] = useState<'prescriptions' | 'inventory'>('prescriptions');
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (activeTab === 'prescriptions') {
      fetchPrescriptions();
    }
  }, [activeTab, token]);

  const fetchPrescriptions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/pharmacy/prescriptions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setPrescriptions(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/pharmacy/prescriptions/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        notify({ title: 'Success', message: `Prescription marked as ${status}`, type: 'success' });
        fetchPrescriptions();
      } else {
        notify({ title: 'Error', message: 'Failed to update status', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      notify({ title: 'Error', message: 'An error occurred', type: 'error' });
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Pill className="w-8 h-8 text-indigo-500" />
          Pharmacy Management
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage e-prescriptions and inventory</p>
      </div>

      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('prescriptions')}
          className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
            activeTab === 'prescriptions' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Incoming Prescriptions
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
            activeTab === 'inventory' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Inventory Management
        </button>
      </div>

      {activeTab === 'prescriptions' ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
          {isLoading ? (
            <div className="p-6">
              <SkeletonLoader type="list" count={4} />
            </div>
          ) : prescriptions.length === 0 ? (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-200 mb-3" />
              <p>No pending prescriptions at this time.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700 text-xs uppercase tracking-wider text-slate-500">
                    <th className="p-4 font-medium">Date</th>
                    <th className="p-4 font-medium">Patient</th>
                    <th className="p-4 font-medium">Doctor</th>
                    <th className="p-4 font-medium">Prescription details</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {prescriptions.map(req => (
                    <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-4 text-sm text-slate-600 whitespace-nowrap">
                        {format(new Date(req.visitDate), 'MMM d, yyyy h:mm a')}
                      </td>
                      <td className="p-4 text-sm">
                        <div className="font-medium text-slate-900 dark:text-slate-100">{req.studentName}</div>
                        <div className="text-xs text-slate-500">{req.studentUsername}</div>
                      </td>
                      <td className="p-4 text-sm text-slate-600 whitespace-nowrap">Dr. {req.doctorName}</td>
                      <td className="p-4 text-sm">
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-200 p-2 rounded text-xs whitespace-pre-wrap max-w-sm">
                          {req.prescription}
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-wide ${
                          req.prescriptionStatus === 'Pending' ? 'bg-amber-100 text-amber-700' :
                          req.prescriptionStatus === 'Ready for Pickup' ? 'bg-blue-100 text-blue-700' :
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          {req.prescriptionStatus}
                        </span>
                      </td>
                      <td className="p-4 text-right whitespace-nowrap space-x-2">
                        {req.prescriptionStatus === 'Pending' && (
                          <button
                            onClick={() => updateStatus(req.id, 'Ready for Pickup')}
                            className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded font-medium text-xs transition-colors"
                          >
                            Mark Ready
                          </button>
                        )}
                        {(req.prescriptionStatus === 'Ready for Pickup' || req.prescriptionStatus === 'Pending') && (
                          <button
                            onClick={() => updateStatus(req.id, 'Collected')}
                            className="px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded font-medium text-xs transition-colors"
                          >
                            Mark Collected
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="-mx-8">
          <PharmacyInventory />
        </div>
      )}
    </div>
  );
}
