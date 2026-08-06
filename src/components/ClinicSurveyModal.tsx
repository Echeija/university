import React, { useState } from 'react';
import { X, Star, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

interface Props {
  appointmentId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ClinicSurveyModal({ appointmentId, onClose, onSuccess }: Props) {
  const { token } = useAuth();
  const { notify } = useNotification();
  const [formData, setFormData] = useState({
    overallRating: 0,
    waitTimeRating: 0,
    cleanlinessRating: 0,
    staffFriendlinessRating: 0,
    comments: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.overallRating || !formData.waitTimeRating || !formData.cleanlinessRating || !formData.staffFriendlinessRating) {
      notify({ title: 'Error', message: 'Please provide all ratings', type: 'error' });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/clinic/surveys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ appointmentId, ...formData })
      });
      
      if (res.ok) {
        setIsSuccess(true);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      } else {
        notify({ title: 'Error', message: 'Failed to submit survey', type: 'error' });
      }
    } catch (err) {
      notify({ title: 'Error', message: 'An error occurred', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({ value, onChange }: { value: number, onChange: (val: number) => void }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`p-1 transition-colors ${value >= star ? 'text-amber-400' : 'text-slate-200 hover:text-amber-200'}`}
          >
            <Star className="w-6 h-6 fill-current" />
          </button>
        ))}
      </div>
    );
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Thank You!</h3>
          <p className="text-slate-500 dark:text-slate-400">Your feedback helps us improve our clinic services.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200">Rate Your Visit</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Overall Experience</span>
              <StarRating value={formData.overallRating} onChange={(val) => setFormData({...formData, overallRating: val})} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Wait Time</span>
              <StarRating value={formData.waitTimeRating} onChange={(val) => setFormData({...formData, waitTimeRating: val})} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Cleanliness</span>
              <StarRating value={formData.cleanlinessRating} onChange={(val) => setFormData({...formData, cleanlinessRating: val})} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Staff Friendliness</span>
              <StarRating value={formData.staffFriendlinessRating} onChange={(val) => setFormData({...formData, staffFriendlinessRating: val})} />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Additional Comments (Optional)</label>
            <textarea
              rows={3}
              value={formData.comments}
              onChange={(e) => setFormData({...formData, comments: e.target.value})}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 bg-slate-50 dark:bg-slate-700/50 text-slate-800 dark:text-slate-200"
              placeholder="Tell us what you liked or how we can improve..."
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl font-medium transition-colors"
            >
              Skip
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
