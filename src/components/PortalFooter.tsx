import React, { useState } from 'react';
import { MessageSquare, Send, CheckCircle2, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

export default function PortalFooter() {
  const { token, user } = useAuth();
  const { notify } = useNotification();
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState('Suggestion');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Only show to Students and Lecturers as requested
  if (user?.role !== 'Student' && user?.role !== 'Lecturer') {
    return (
      <footer className="mt-auto py-6 px-8 border-t border-slate-200 dark:border-slate-800 text-center text-sm text-slate-500 dark:text-slate-400">
        &copy; {new Date().getFullYear()} Smart Global College of Technology. All rights reserved.
      </footer>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ type: feedbackType, message })
      });

      if (!res.ok) throw new Error('Failed to submit feedback');

      setIsSuccess(true);
      setMessage('');
      setTimeout(() => {
        setIsOpen(false);
        setIsSuccess(false);
      }, 3000);
    } catch (error) {
      notify({ title: 'Error', message: 'Could not submit feedback.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="mt-auto relative z-10 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          &copy; {new Date().getFullYear()} Smart Global College of Technology. All rights reserved.
        </p>
        
        <div className="relative">
          {!isOpen ? (
            <button 
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-full"
            >
              <MessageSquare className="w-4 h-4" />
              Submit Feedback
            </button>
          ) : (
            <div className="absolute bottom-full right-0 mb-4 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl rounded-2xl p-5 overflow-hidden origin-bottom-right animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-indigo-500" />
                  Portal Feedback
                </h4>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {isSuccess ? (
                <div className="py-8 flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mb-3">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h5 className="font-bold text-slate-900 dark:text-white">Thank You!</h5>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Your feedback helps us improve the portal.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Feedback Type</label>
                    <div className="flex gap-2">
                      <button 
                        type="button"
                        onClick={() => setFeedbackType('Suggestion')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${feedbackType === 'Suggestion' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                      >
                        Suggestion
                      </button>
                      <button 
                        type="button"
                        onClick={() => setFeedbackType('Bug')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${feedbackType === 'Bug' ? 'bg-rose-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                      >
                        Report Bug
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Message</label>
                    <textarea 
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us what's on your mind..."
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-24"
                    />
                  </div>
                  
                  <button 
                    type="submit"
                    disabled={isSubmitting || !message.trim()}
                    className="w-full py-2 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit to Admin
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
