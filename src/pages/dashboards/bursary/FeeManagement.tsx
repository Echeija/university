import React from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotification } from '../../../contexts/NotificationContext';
import { Calculator, Plus, Trash2, Building, DollarSign, Calendar } from 'lucide-react';
import { Skeleton } from '../../../components/ui/Skeleton';

export default function FeeManagement() {
  const { token } = useAuth();
  const { notify } = useNotification();
  
  const [fees, setFees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  const [newFee, setNewFee] = useState({
    type: 'Tuition Fee',
    amount: '',
    department: '',
    level: '',
    session: '2025/2026',
    semester: 'First',
    description: ''
  });

  const loadFees = async () => {
    try {
      const res = await fetch('/api/bursary/fee-settings', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setFees(data);
    } catch (e) {
      console.error(e);
      notify({ title: 'Error', message: 'Failed to load fee configurations', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFees();
  }, [token]);

  const handleAddFee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/bursary/fee-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newFee,
          amount: parseFloat(newFee.amount)
        })
      });
      
      if (res.ok) {
        notify({ title: 'Success', message: 'Fee configuration added successfully', type: 'success' });
        setIsAdding(false);
        setNewFee({ type: 'Tuition Fee', amount: '', department: '', level: '', session: '2025/2026', semester: 'First', description: '' });
        loadFees();
      }
    } catch (e) {
      notify({ title: 'Error', message: 'Failed to add fee', type: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this fee configuration?')) return;
    try {
      const res = await fetch(`/api/bursary/fee-settings/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        notify({ title: 'Deleted', message: 'Fee configuration removed', type: 'success' });
        loadFees();
      }
    } catch (e) {
      notify({ title: 'Error', message: 'Failed to delete fee', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Fee Management</h2>
          <p className="text-slate-500 mt-1">Configure and assign institutional fees to students.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all font-bold shadow-sm"
        >
          {isAdding ? 'Cancel' : <><Plus className="w-5 h-5" /> Add New Fee</>}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddFee} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 animate-in slide-in-from-top-4 fade-in">
          <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">Define New Fee Structure</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fee Type</label>
              <select required value={newFee.type} onChange={e => setNewFee({...newFee, type: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-emerald-500 focus:border-emerald-500">
                <option>Tuition Fee</option>
                <option>Acceptance Fee</option>
                <option>Hostel Fee</option>
                <option>Departmental Dues</option>
                <option>Medical Fee</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₦)</label>
              <input required type="number" min="0" value={newFee.amount} onChange={e => setNewFee({...newFee, amount: e.target.value})} placeholder="e.g. 150000" className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Department Constraint (Optional)</label>
              <input type="text" value={newFee.department} onChange={e => setNewFee({...newFee, department: e.target.value})} placeholder="Leave blank for all departments" className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Level Constraint (Optional)</label>
              <input type="text" value={newFee.level} onChange={e => setNewFee({...newFee, level: e.target.value})} placeholder="e.g. 100L (Leave blank for all)" className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Academic Session</label>
              <input required type="text" value={newFee.session} onChange={e => setNewFee({...newFee, session: e.target.value})} placeholder="e.g. 2025/2026" className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <input type="text" value={newFee.description} onChange={e => setNewFee({...newFee, description: e.target.value})} placeholder="Brief details about this fee" className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button type="submit" className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800">
              Save Fee Configuration
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="font-bold text-slate-800">Active Fee Configurations</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white text-slate-500 text-xs uppercase tracking-wider font-bold border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Fee Type</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4">Applies To</th>
                <th className="px-6 py-4">Session</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Loading configurations...</td></tr>
              ) : fees.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">No fee configurations defined.</td></tr>
              ) : (
                fees.map(f => (
                  <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {f.type}
                      {f.description && <p className="text-xs text-slate-500 font-normal mt-0.5">{f.description}</p>}
                    </td>
                    <td className="px-6 py-4 text-right font-black text-emerald-700">
                      ₦{f.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      <div className="flex flex-col gap-1 text-xs">
                        {f.department ? <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded inline-block w-max">Dept: {f.department}</span> : <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded inline-block w-max">All Departments</span>}
                        {f.level && <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded inline-block w-max">Level: {f.level}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-600">{f.session}</td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => handleDelete(f.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
