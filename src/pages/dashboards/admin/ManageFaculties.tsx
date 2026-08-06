import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Network, Users, Building2 } from 'lucide-react';
import { useNotification } from '../../../contexts/NotificationContext';

interface Faculty {
  id: number;
  name: string;
  description: string;
  departmentCount?: number;
  studentCount?: number;
}

export default function ManageFaculties() {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { notify } = useNotification();
  
  const [showNewModal, setShowNewModal] = useState(false);
  const [newFaculty, setNewFaculty] = useState({ name: '', description: '' });
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);

  useEffect(() => {
    fetchFaculties();
  }, []);

  const fetchFaculties = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/faculties', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setFaculties(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/faculties', {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        method: 'POST',
        body: JSON.stringify(newFaculty)
      });
      if (res.ok) {
        notify({ title: 'Success', message: 'Faculty created successfully', type: 'success' });
        setShowNewModal(false);
        setNewFaculty({ name: '', description: '' });
        fetchFaculties();
      } else {
        notify({ title: 'Error', message: 'Failed to create faculty', type: 'error' });
      }
    } catch (error) {
      notify({ title: 'Error', message: 'An error occurred', type: 'error' });
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaculty) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/faculties/${editingFaculty.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ name: editingFaculty.name, description: editingFaculty.description })
      });
      if (res.ok) {
        notify({ title: 'Success', message: 'Faculty updated successfully', type: 'success' });
        setShowEditModal(false);
        setEditingFaculty(null);
        fetchFaculties();
      } else {
        notify({ title: 'Error', message: 'Failed to update faculty', type: 'error' });
      }
    } catch (error) {
      notify({ title: 'Error', message: 'An error occurred', type: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    // removed confirm
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/faculties/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        notify({ title: 'Success', message: 'Faculty deleted', type: 'success' });
        fetchFaculties();
      } else {
        notify({ title: 'Error', message: 'Failed to delete faculty', type: 'error' });
      }
    } catch (error) {
      notify({ title: 'Error', message: 'An error occurred', type: 'error' });
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500 font-bold">Loading faculties...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Manage Faculties</h2>
          <p className="text-slate-500 mt-1">Add or remove faculties.</p>
        </div>
        <button 
          onClick={() => setShowNewModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-5 h-5" /> New Faculty
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {faculties.map(faculty => (
          <div key={faculty.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm transition-all">
            <div className="p-6 cursor-pointer flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Network className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">{faculty.name}</h3>
                  <p className="text-slate-500 text-sm mb-2">{faculty.description || 'No description'}</p>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-1.5 text-sm text-slate-600 font-medium">
                      <Building2 className="w-4 h-4 text-emerald-600" />
                      {faculty.departmentCount || 0} Departments
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-slate-600 font-medium">
                      <Users className="w-4 h-4 text-blue-600" />
                      {faculty.studentCount || 0} Students
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); setEditingFaculty(faculty); setShowEditModal(true); }}
                  className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(faculty.id); }}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showNewModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-900">Add New Faculty</h3>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Faculty Name</label>
                <input 
                  type="text" 
                  required
                  value={newFaculty.name}
                  onChange={e => setNewFaculty({...newFaculty, name: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="e.g. Faculty of Science"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Description (Optional)</label>
                <textarea 
                  value={newFaculty.description}
                  onChange={e => setNewFaculty({...newFaculty, description: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  rows={3}
                  placeholder="Brief description"
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && editingFaculty && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-900">Edit Faculty</h3>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Faculty Name</label>
                <input 
                  type="text" 
                  required
                  value={editingFaculty.name}
                  onChange={e => setEditingFaculty({...editingFaculty, name: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Description (Optional)</label>
                <textarea 
                  value={editingFaculty.description}
                  onChange={e => setEditingFaculty({...editingFaculty, description: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  rows={3}
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
