import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotification } from '../../../contexts/NotificationContext';
import { Save, Plus, Trash2, Edit2, ShieldCheck, Check, X } from 'lucide-react';
import { Skeleton } from '../../../components/ui/Skeleton';

export default function GradingSettings() {
  const { token } = useAuth();
  const { notify } = useNotification();
  
  const [isLoading, setIsLoading] = useState(true);
  const [rules, setRules] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    minScore: '',
    maxScore: '',
    grade: '',
    gradePoint: '',
    description: '',
    isPass: true
  });

  const fetchRules = async () => {
    try {
      const res = await fetch('/api/settings/grading_rules', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setRules(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, [token]);

  const handleEdit = (rule: any) => {
    setEditingId(rule.id);
    setFormData({
      minScore: rule.minScore.toString(),
      maxScore: rule.maxScore.toString(),
      grade: rule.grade,
      gradePoint: rule.gradePoint.toString(),
      description: rule.description,
      isPass: rule.isPass
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ minScore: '', maxScore: '', grade: '', gradePoint: '', description: '', isPass: true });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        minScore: parseFloat(formData.minScore),
        maxScore: parseFloat(formData.maxScore),
        grade: formData.grade,
        gradePoint: parseFloat(formData.gradePoint),
        description: formData.description,
        isPass: formData.isPass
      };

      const url = editingId ? `/api/settings/grading_rules/${editingId}` : '/api/settings/grading_rules';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        notify({ title: 'Success', message: 'Grading rule saved successfully.', type: 'success' });
        await fetchRules();
        handleCancel();
      } else {
        throw new Error('Failed');
      }
    } catch (e) {
      notify({ title: 'Error', message: 'Failed to save grading rule.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this grading rule?')) return;
    
    try {
      const res = await fetch(`/api/settings/grading_rules/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        notify({ title: 'Success', message: 'Rule deleted successfully.', type: 'success' });
        fetchRules();
      }
    } catch (e) {
      notify({ title: 'Error', message: 'Failed to delete rule.', type: 'error' });
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-8 w-64 rounded-lg" />
        <Skeleton className="h-[400px] rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Grading Rules</h1>
          <p className="text-slate-500 mt-2">Configure institutional grading scales and GPA points.</p>
        </div>
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-all shadow-sm shadow-emerald-200"
          >
            <Plus className="w-5 h-5" />
            Add New Rule
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-emerald-50/50 flex items-center gap-3">
             <ShieldCheck className="w-6 h-6 text-emerald-600" />
             <h2 className="text-lg font-bold text-slate-900">{editingId ? 'Edit Grading Rule' : 'New Grading Rule'}</h2>
          </div>
          <form onSubmit={handleSave} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Minimum Score</label>
                <input 
                  type="number" 
                  step="0.01"
                  required
                  value={formData.minScore}
                  onChange={e => setFormData({...formData, minScore: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Maximum Score</label>
                <input 
                  type="number" 
                  step="0.01"
                  required
                  value={formData.maxScore}
                  onChange={e => setFormData({...formData, maxScore: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Grade Letter (e.g. A, B)</label>
                <input 
                  type="text" 
                  required
                  value={formData.grade}
                  onChange={e => setFormData({...formData, grade: e.target.value.toUpperCase()})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-medium uppercase"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Grade Point (e.g. 5, 4)</label>
                <input 
                  type="number" 
                  step="0.01"
                  required
                  value={formData.gradePoint}
                  onChange={e => setFormData({...formData, gradePoint: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-medium"
                />
              </div>
              <div className="space-y-2 lg:col-span-2">
                <label className="text-sm font-bold text-slate-700">Description (e.g. Excellent)</label>
                <input 
                  type="text" 
                  required
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 block">Pass Status</label>
                <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={formData.isPass}
                    onChange={e => setFormData({...formData, isPass: e.target.checked})}
                    className="w-5 h-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <span className="font-medium text-slate-700">Students Pass with this Grade</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button 
                type="button"
                onClick={handleCancel}
                className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-all shadow-sm"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Rule'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Score Range</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Grade</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Grade Point</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Pass/Fail</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rules.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No grading rules configured.
                  </td>
                </tr>
              ) : (
                rules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-700">
                      {rule.minScore} - {rule.maxScore}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm ${rule.isPass ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {rule.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {rule.gradePoint.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {rule.description}
                    </td>
                    <td className="px-6 py-4">
                      {rule.isPass ? (
                        <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-sm">
                          <Check className="w-4 h-4" /> Pass
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-red-600 font-bold text-sm">
                          <X className="w-4 h-4" /> Fail
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(rule)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(rule.id)}
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
    </div>
  );
}
