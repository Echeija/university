import React from 'react';
import { useState } from 'react';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNotification } from '../../../contexts/NotificationContext';

export default function Complaints() {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Academic');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { notify } = useNotification();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      notify({
        title: 'Complaint Submitted',
        message: 'Your complaint has been forwarded to the appropriate department.',
        type: 'success'
      });
      setIsSubmitting(false);
      setSubject('');
      setDescription('');
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Complaints & Helpdesk</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Submit issues or complaints to the university administration.</p>
      </div>
      
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Subject</label>
              <input 
                type="text" 
                required
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                placeholder="Brief summary of the issue"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Category</label>
              <select 
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                <option value="Academic">Academic / Grading</option>
                <option value="Financial">Financial / Fees</option>
                <option value="Hostel">Hostel / Accommodation</option>
                <option value="Technical">IT / Technical Support</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Description</label>
            <textarea 
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white h-32 resize-none"
              placeholder="Provide detailed information about your complaint..."
            ></textarea>
          </div>
          
          <div className="flex justify-end">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors disabled:opacity-70"
            >
              {isSubmitting ? <span className="animate-pulse">Submitting...</span> : <><Send className="w-4 h-4" /> Submit Complaint</>}
            </button>
          </div>
        </form>
      </div>
      
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-xl p-4 flex gap-4">
        <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-500 shrink-0" />
        <div>
          <h4 className="font-bold text-amber-800 dark:text-amber-400">Response Time</h4>
          <p className="text-sm text-amber-700 dark:text-amber-500 mt-1">Most complaints are reviewed and responded to within 48-72 working hours. You will be notified via email once there is an update.</p>
        </div>
      </div>
    </div>
  );
}
