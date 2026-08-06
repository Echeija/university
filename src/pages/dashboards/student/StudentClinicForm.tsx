import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotification } from '../../../contexts/NotificationContext';
import { FileText, Loader2, Send } from 'lucide-react';

export default function StudentClinicForm() {
  const { formId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { notify } = useNotification();
  
  const [form, setForm] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchForm();
  }, [formId, token]);

  const fetchForm = async () => {
    try {
      const res = await fetch('/api/clinic/forms', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const forms = await res.json();
        const currentForm = forms.find((f: any) => f.id === parseInt(formId || '0'));
        if (currentForm) {
          currentForm.fields = JSON.parse(currentForm.fields);
          setForm(currentForm);
          
          // Initialize form data
          const initialData: Record<string, any> = {};
          currentForm.fields.forEach((f: any) => {
            if (f.type === 'checkbox') initialData[f.label] = false;
            else initialData[f.label] = '';
          });
          setFormData(initialData);
        } else {
          notify({ title: 'Error', message: 'Form not found', type: 'error' });
          navigate('/dashboard');
        }
      }
    } catch (e) {
      console.error(e);
      notify({ title: 'Error', message: 'Failed to load form', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch('/api/clinic/form-submissions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          formId: form.id,
          data: JSON.stringify(formData)
        })
      });
      
      if (res.ok) {
        notify({ title: 'Success', message: 'Form submitted successfully', type: 'success' });
        navigate('/dashboard');
      } else {
        throw new Error('Failed to submit');
      }
    } catch (e) {
      console.error(e);
      notify({ title: 'Error', message: 'Failed to submit form', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFieldChange = (label: string, value: any) => {
    setFormData(prev => ({ ...prev, [label]: value }));
  };

  if (loading) {
    return <div className="flex items-center justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;
  }

  if (!form) return null;

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="p-8 bg-indigo-600 text-white">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-8 h-8 text-indigo-200" />
            <h1 className="text-2xl font-bold">{form.title}</h1>
          </div>
          {form.description && (
            <p className="text-indigo-100">{form.description}</p>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {form.fields.map((field: any) => (
            <div key={field.id} className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                {field.label} {field.required && <span className="text-rose-500">*</span>}
              </label>
              
              {field.type === 'text' && (
                <input 
                  type="text" 
                  required={field.required}
                  value={formData[field.label] || ''}
                  onChange={e => handleFieldChange(field.label, e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              )}
              
              {field.type === 'textarea' && (
                <textarea 
                  required={field.required}
                  rows={4}
                  value={formData[field.label] || ''}
                  onChange={e => handleFieldChange(field.label, e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                ></textarea>
              )}
              
              {field.type === 'select' && (
                <select
                  required={field.required}
                  value={formData[field.label] || ''}
                  onChange={e => handleFieldChange(field.label, e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select an option</option>
                  {field.options?.map((opt: string) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              )}
              
              {field.type === 'radio' && (
                <div className="space-y-2 mt-2">
                  {field.options?.map((opt: string) => (
                    <label key={opt} className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name={field.id}
                        required={field.required}
                        value={opt}
                        checked={formData[field.label] === opt}
                        onChange={e => handleFieldChange(field.label, e.target.value)}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-slate-700 dark:text-slate-300">{opt}</span>
                    </label>
                  ))}
                </div>
              )}
              
              {field.type === 'checkbox' && (
                <label className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    required={field.required}
                    checked={formData[field.label] || false}
                    onChange={e => handleFieldChange(field.label, e.target.checked)}
                    className="text-indigo-600 focus:ring-indigo-500 rounded"
                  />
                  <span className="text-slate-700 dark:text-slate-300 text-sm">Yes, I confirm</span>
                </label>
              )}
            </div>
          ))}
          
          <div className="pt-6 border-t border-slate-100 dark:border-slate-700">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              Submit Form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
