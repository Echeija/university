import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, FileText, CheckCircle2, Eye, Copy } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { format } from 'date-fns';

type FieldType = 'text' | 'textarea' | 'checkbox' | 'radio' | 'select' | 'number';

interface FormField {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  options?: string[]; // For radio and select
}

export default function ClinicFormBuilder() {
  const { token } = useAuth();
  const { notify } = useNotification();
  
  const [forms, setForms] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isBuilding, setIsBuilding] = useState(false);
  
  // Builder State
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [fields, setFields] = useState<FormField[]>([]);
  
  // Submission View State
  const [viewingSubmission, setViewingSubmission] = useState<any>(null);

  useEffect(() => {
    fetchForms();
    fetchSubmissions();
  }, [token]);

  const fetchForms = async () => {
    try {
      const res = await fetch('/api/clinic/forms', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setForms(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const res = await fetch('/api/clinic/form-submissions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setSubmissions(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const addField = (type: FieldType) => {
    setFields([...fields, { 
      id: Math.random().toString(36).substring(7),
      type, 
      label: `New ${type} field`, 
      required: false,
      options: ['Option 1', 'Option 2']
    }]);
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const handleSaveForm = async () => {
    if (!formTitle.trim()) {
      notify({ title: 'Error', message: 'Form title is required', type: 'error' });
      return;
    }
    if (fields.length === 0) {
      notify({ title: 'Error', message: 'Form must have at least one field', type: 'error' });
      return;
    }

    try {
      const res = await fetch('/api/clinic/forms', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          title: formTitle,
          description: formDescription,
          fields: JSON.stringify(fields)
        })
      });

      if (res.ok) {
        notify({ title: 'Success', message: 'Form created successfully', type: 'success' });
        setIsBuilding(false);
        setFormTitle('');
        setFormDescription('');
        setFields([]);
        fetchForms();
      } else {
        throw new Error('Failed to save');
      }
    } catch (e) {
      notify({ title: 'Error', message: 'Failed to save form', type: 'error' });
    }
  };

  const handleReviewSubmission = async (id: number) => {
    try {
      const res = await fetch(`/api/clinic/form-submissions/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status: 'Reviewed' })
      });
      
      if (res.ok) {
        notify({ title: 'Success', message: 'Submission marked as reviewed', type: 'success' });
        fetchSubmissions();
        setViewingSubmission(null);
      }
    } catch (e) {
      notify({ title: 'Error', message: 'Failed to update submission', type: 'error' });
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Intake Forms</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Manage symptom & intake forms</p>
          </div>
        </div>
        {!isBuilding && (
          <button 
            onClick={() => setIsBuilding(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors"
          >
            Create New Form
          </button>
        )}
      </div>

      {isBuilding ? (
        <div className="space-y-6">
          <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
            <input 
              type="text" 
              placeholder="Form Title (e.g., Pre-visit Symptom Checker)" 
              value={formTitle}
              onChange={e => setFormTitle(e.target.value)}
              className="w-full text-lg font-bold bg-transparent border-none focus:ring-0 p-0 mb-2 text-slate-900 dark:text-white placeholder:text-slate-400"
            />
            <input 
              type="text" 
              placeholder="Form Description (optional)" 
              value={formDescription}
              onChange={e => setFormDescription(e.target.value)}
              className="w-full text-sm bg-transparent border-none focus:ring-0 p-0 text-slate-600 dark:text-slate-400 placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex gap-4 items-start shadow-sm relative">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-500 px-2 py-1 rounded">
                      {field.type.toUpperCase()}
                    </span>
                    <label className="flex items-center gap-2 text-sm text-slate-600">
                      <input 
                        type="checkbox" 
                        checked={field.required} 
                        onChange={e => updateField(field.id, { required: e.target.checked })} 
                      /> Required
                    </label>
                  </div>
                  <input 
                    type="text" 
                    value={field.label}
                    onChange={e => updateField(field.id, { label: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-900"
                  />
                  
                  {(field.type === 'radio' || field.type === 'select') && (
                    <div className="pl-4 border-l-2 border-indigo-200 dark:border-indigo-900/50">
                      <p className="text-xs font-bold text-slate-500 mb-2">Options (comma separated)</p>
                      <input 
                        type="text" 
                        value={field.options?.join(', ')}
                        onChange={e => updateField(field.id, { options: e.target.value.split(',').map(s => s.trim()) })}
                        className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-900"
                      />
                    </div>
                  )}
                </div>
                <button onClick={() => removeField(field.id)} className="text-slate-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
            <span className="text-sm font-bold text-slate-500 flex items-center mr-2">Add Field:</span>
            <button onClick={() => addField('text')} className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm hover:bg-slate-100 transition-colors">Text</button>
            <button onClick={() => addField('textarea')} className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm hover:bg-slate-100 transition-colors">Long Text</button>
            <button onClick={() => addField('radio')} className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm hover:bg-slate-100 transition-colors">Multiple Choice</button>
            <button onClick={() => addField('checkbox')} className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm hover:bg-slate-100 transition-colors">Checkbox</button>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
            <button onClick={() => setIsBuilding(false)} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg">Cancel</button>
            <button onClick={handleSaveForm} className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 flex items-center gap-2">
              <Save className="w-4 h-4" /> Save Form Template
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Forms */}
          <div>
            <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-4 border-b pb-2">Active Templates</h4>
            <div className="space-y-3">
              {forms.map(form => (
                <div key={form.id} className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700 flex justify-between items-center">
                  <div>
                    <h5 className="font-bold text-sm text-slate-900 dark:text-white">{form.title}</h5>
                    <p className="text-xs text-slate-500">{format(new Date(form.createdAt), 'MMM d, yyyy')}</p>
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/dashboard/forms/${form.id}`);
                      notify({ title: 'Copied', message: 'Form link copied to clipboard', type: 'info' });
                    }}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Copy Form Link"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {forms.length === 0 && <p className="text-sm text-slate-500 italic">No templates created yet.</p>}
            </div>
          </div>

          {/* Submissions */}
          <div>
            <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-4 border-b pb-2">Recent Submissions</h4>
            <div className="space-y-3">
              {submissions.map(sub => (
                <div key={sub.id} className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 flex justify-between items-center shadow-sm">
                  <div>
                    <h5 className="font-bold text-sm text-slate-900 dark:text-white">{sub.studentName}</h5>
                    <p className="text-xs text-slate-500">{sub.formTitle} • {format(new Date(sub.createdAt), 'MMM d, h:mm a')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {sub.status === 'Pending' && (
                      <span className="w-2 h-2 rounded-full bg-amber-500" title="Pending Review" />
                    )}
                    <button 
                      onClick={() => setViewingSubmission(sub)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded transition-colors text-xs font-bold flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" /> View
                    </button>
                  </div>
                </div>
              ))}
              {submissions.length === 0 && <p className="text-sm text-slate-500 italic">No submissions yet.</p>}
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {viewingSubmission && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Form Submission</h3>
              <button onClick={() => setViewingSubmission(null)} className="text-slate-400 hover:text-slate-600">
                <Trash2 className="w-5 h-5 hidden" />
                <span className="text-xl leading-none">&times;</span>
              </button>
            </div>
            <div className="p-6">
              <div className="mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
                <p className="text-sm text-slate-500 mb-1">Student: <strong className="text-slate-900 dark:text-white">{viewingSubmission.studentName}</strong></p>
                <p className="text-sm text-slate-500 mb-1">Form: <strong className="text-slate-900 dark:text-white">{viewingSubmission.formTitle}</strong></p>
                <p className="text-sm text-slate-500">Submitted: {format(new Date(viewingSubmission.createdAt), 'MMM d, yyyy h:mm a')}</p>
              </div>
              
              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                {Object.entries(JSON.parse(viewingSubmission.data)).map(([key, value]: [string, any]) => (
                  <div key={key} className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg">
                    <p className="text-xs font-bold text-slate-500 mb-1">{key}</p>
                    <p className="text-sm text-slate-900 dark:text-white whitespace-pre-wrap">{value.toString() || '—'}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900">
              <button onClick={() => setViewingSubmission(null)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg">Close</button>
              {viewingSubmission.status === 'Pending' && (
                <button 
                  onClick={() => handleReviewSubmission(viewingSubmission.id)}
                  className="px-4 py-2 text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> Mark Reviewed
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
