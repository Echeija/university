import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotification } from '../../../contexts/NotificationContext';
import { CreditCard, Edit, Trash2, Plus, X } from 'lucide-react';

import { coursesList } from '../../../lib/courses';

export default function PaymentSettings() {
  const { token } = useAuth();
  const { notify } = useNotification();
  const [fees, setFees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [currentFee, setCurrentFee] = useState({
    id: null as number | null,
    type: '',
    amount: '',
    level: '',
    department: '',
    programme: '',
    indigene: '',
    session: '',
    semester: '',
    description: '', deadline: ''
  });

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    try {
      const res = await fetch('/api/admin/fees', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFees(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const openAddModal = () => {
    setModalMode('add');
    setCurrentFee({ id: null, type: '', amount: '', level: '', department: '', programme: '', indigene: '', session: '', semester: '', description: '', deadline: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (fee: any) => {
    setModalMode('edit');
    setCurrentFee({ 
      id: fee.id, 
      type: fee.type, 
      amount: fee.amount.toString(), 
      level: fee.level || '',
      department: fee.department || '',
      programme: fee.programme || '',
      indigene: fee.indigene || '',
      session: fee.session || '',
      semester: fee.semester || '',
      description: fee.description || '',
      deadline: fee.deadline ? new Date(fee.deadline).toISOString().split('T')[0] : ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number, type: string) => {
    // removed confirm
    try {
      const res = await fetch(`/api/admin/fees/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setFees(fees.filter(f => f.id !== id));
        notify({ title: 'Success', message: 'Fee setting deleted.', type: 'success' });
      } else {
        const data = await res.json();
        notify({ title: 'Error', message: data.error || 'Failed to delete fee setting.', type: 'error' });
      }
    } catch (e) {
      notify({ title: 'Error', message: 'Failed to delete fee setting.', type: 'error' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const method = modalMode === 'add' ? 'POST' : 'PUT';
    const url = modalMode === 'add' ? '/api/admin/fees' : `/api/admin/fees/${currentFee.id}`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          type: currentFee.type,
          amount: parseFloat(currentFee.amount) || 0,
          level: currentFee.level,
          department: currentFee.department,
          programme: currentFee.programme,
          indigene: currentFee.indigene,
          session: currentFee.session,
          semester: currentFee.semester,
          description: currentFee.description, deadline: currentFee.deadline || null
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        if (modalMode === 'add') {
          setFees([...fees, data.fee]);
        } else {
          setFees(fees.map(f => f.id === data.fee.id ? data.fee : f));
        }
        notify({ title: 'Success', message: `Fee setting ${modalMode === 'add' ? 'added' : 'updated'} successfully.`, type: 'success' });
        setIsModalOpen(false);
      } else {
        notify({ title: 'Error', message: data.error || 'Failed to save fee setting.', type: 'error' });
      }
    } catch (e) {
      notify({ title: 'Error', message: 'An error occurred: ' + (e as Error).message, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Payment Settings</h2>
          <p className="text-slate-500 mt-1">Manage institutional fee types, amounts, and conditions.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-lg shadow-emerald-200 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add Fee Type
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Fee Type</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Level</th>
                <th className="px-6 py-4">Course of Study</th>
                <th className="px-6 py-4">Programme</th>
                <th className="px-6 py-4">Indigene</th>
                <th className="px-6 py-4">Session</th>
                <th className="px-6 py-4">Semester</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {isLoading ? (
                <tr><td colSpan={9} className="p-8 text-center text-slate-500">Loading fees...</td></tr>
              ) : fees.length === 0 ? (
                <tr><td colSpan={9} className="p-8 text-center text-slate-500">No fee types configured.</td></tr>
              ) : (
                fees.map(fee => (
                  <tr key={fee.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100 text-blue-700 font-bold shrink-0">
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <p className="font-bold text-slate-900 line-clamp-2">{fee.type}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap">
                      ${parseFloat(fee.amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-sm whitespace-nowrap">{fee.level || '-'}</td>
                    <td className="px-6 py-4 text-slate-500 text-sm whitespace-nowrap">{fee.department || '-'}</td>
                    <td className="px-6 py-4 text-slate-500 text-sm whitespace-nowrap">{fee.programme || '-'}</td>
                    <td className="px-6 py-4 text-slate-500 text-sm whitespace-nowrap">{fee.indigene === 'Benue' ? 'Yes (Benue)' : fee.indigene === 'Other' ? 'No (Other)' : '-'}</td>
                    <td className="px-6 py-4 text-slate-500 text-sm whitespace-nowrap">{fee.session || '-'}</td>
                    <td className="px-6 py-4 text-slate-500 text-sm whitespace-nowrap">{fee.semester || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(fee)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(fee.id, fee.type)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{modalMode === 'add' ? 'Add Fee Type' : 'Edit Fee Type'}</h3>
                <p className="text-sm text-slate-500">{modalMode === 'add' ? 'Define a new institutional fee' : 'Update fee details'}</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fee Type Name</label>
                  <input 
                    type="text" 
                    required
                    value={currentFee.type}
                    onChange={(e) => setCurrentFee({...currentFee, type: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50"
                    placeholder="e.g. Tuition Fee"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₦)</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    step="0.01"
                    value={currentFee.amount}
                    onChange={(e) => setCurrentFee({...currentFee, amount: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50"
                    placeholder="e.g. 1500.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Programme</label>
                  <select 
                    value={currentFee.programme}
                    onChange={(e) => setCurrentFee({...currentFee, programme: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50"
                  >
                    <option value="">All Programmes</option>
                    <option value="PhD">PhD</option>
                    <option value="MSc">MSc</option>
                    <option value="BSc">BSc</option>
                    <option value="HND">HND</option>
                    <option value="ND">ND</option>
                    <option value="NTC">NTC</option>
                    <option value="NVC">NVC</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Course of Study</label>
                  <select 
                    value={currentFee.department}
                    onChange={(e) => setCurrentFee({...currentFee, department: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50"
                  >
                    <option value="">All Courses</option>
                    {coursesList.map(course => (
                      <option key={course} value={course}>{course}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Level</label>
                  <select 
                    value={currentFee.level}
                    onChange={(e) => setCurrentFee({...currentFee, level: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50"
                  >
                    <option value="">All Levels</option>
                    <option value="100L">100L</option>
                    <option value="200L">200L</option>
                    <option value="300L">300L</option>
                    <option value="400L">400L</option>
                    <option value="500L">500L</option>
                    <option value="600L">600L</option>
                    <option value="700L">700L</option>
                    <option value="800L">800L</option>
                    <option value="900L">900L</option>
                    <option value="HND I">HND I</option>
                    <option value="HND II">HND II</option>
                    <option value="ND I">ND I</option>
                    <option value="ND II">ND II</option>
                    <option value="NVC">NVC</option>
                    <option value="NTC">NTC</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Indigene Status</label>
                  <select 
                    value={currentFee.indigene}
                    onChange={(e) => setCurrentFee({...currentFee, indigene: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50"
                  >
                    <option value="">Any</option>
                    <option value="Benue">Yes (Benue)</option>
                    <option value="Other">No (Other)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Semester</label>
                  <select 
                    value={currentFee.semester}
                    onChange={(e) => setCurrentFee({...currentFee, semester: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50"
                  >
                    <option value="">All Semesters</option>
                    <option value="First">First</option>
                    <option value="Second">Second</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Session</label>
                <select 
                  value={currentFee.session}
                  onChange={(e) => setCurrentFee({...currentFee, session: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50"
                >
                  <option value="">All Sessions</option>
                  <option value="2024/2025">2024/2025</option>
                  <option value="2025/2026">2025/2026</option>
                  <option value="2026/2027">2026/2027</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optional)</label>
                <textarea 
                  value={currentFee.description}
                  onChange={(e) => setCurrentFee({...currentFee, description: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50"
                  placeholder="Brief description of this fee"
                  rows={2}
                ></textarea>
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Payment Deadline (Optional)</label>
                <input 
                  type="date"
                  value={currentFee.deadline ? new Date(currentFee.deadline).toISOString().split('T')[0] : ''}
                  onChange={(e) => setCurrentFee({...currentFee, deadline: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-white border-t border-slate-100 mt-6 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? 'Saving...' : (modalMode === 'add' ? 'Create Fee Type' : 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
