import React, { useState } from 'react';
import { MessageSquarePlus, X, Send } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';

export default function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState('bug');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { notify } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));
      notify({
        title: 'Feedback Submitted',
        message: 'Thank you for your feedback! We will review it shortly.',
        type: 'success',
      });
      setIsOpen(false);
      setMessage('');
    } catch (error) {
      notify({
        title: 'Error',
        message: 'Failed to submit feedback. Please try again later.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center group"
        aria-label="Give Feedback"
      >
        <MessageSquarePlus className="w-6 h-6" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs group-hover:ml-2 transition-all duration-300 ease-in-out font-medium text-sm">
          Feedback
        </span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h3 className="font-semibold text-lg text-slate-800 dark:text-white">Submit Feedback</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Feedback Type
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setType('bug')}
                    className={`py-2 px-4 rounded-lg border text-sm font-medium transition-colors ${
                      type === 'bug'
                        ? 'border-red-200 bg-red-50 text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                    }`}
                  >
                    Report Bug
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('suggestion')}
                    className={`py-2 px-4 rounded-lg border text-sm font-medium transition-colors ${
                      type === 'suggestion'
                        ? 'border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                    }`}
                  >
                    Suggestion
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="feedback-message" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Message
                </label>
                <textarea
                  id="feedback-message"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={type === 'bug' ? 'Describe the issue you encountered...' : 'How can we improve?'}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !message.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  {isSubmitting ? 'Submitting...' : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
