import React, { useState } from 'react';
import { AlertTriangle, Send, AlertCircle, Info, Clock, RotateCcw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useNotification } from '../../contexts/NotificationContext';

export default function EmergencyBroadcastForm() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<'info' | 'warning' | 'critical'>('warning');
  const [isSending, setIsSending] = useState(false);
  const { notify } = useNotification();

  const handleBroadcast = async () => {
    if (!title.trim() || !message.trim()) {
      notify({
        title: 'Validation Error',
        message: 'Please provide both a title and a message.',
        type: 'error'
      });
      return;
    }

    setIsSending(true);
    try {
      const channel = supabase.channel('emergency_broadcast');
      
      const payload = {
        title,
        message,
        severity,
        timestamp: Date.now()
      };

      await channel.send({
        type: 'broadcast',
        event: 'emergency',
        payload
      });

      notify({
        title: 'Broadcast Sent',
        message: 'The emergency broadcast was successfully dispatched to all active clients.',
        type: 'success'
      });
      
      // Optionally reset form
      setTitle('');
      setMessage('');
      setSeverity('warning');
    } catch (error) {
      console.error(error);
      notify({
        title: 'Broadcast Failed',
        message: 'There was an error dispatching the broadcast.',
        type: 'error'
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          Emergency Broadcast System
        </h3>
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          Use this system to push real-time alerts to all currently logged-in users across the platform. 
          Broadcasts appear instantly as prominent banners on their screens.
        </p>
      </div>

      <div className="space-y-6 max-w-2xl">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Severity Level</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setSeverity('info')}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                severity === 'info' 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-sm' 
                  : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 text-slate-500'
              }`}
            >
              <Info className={`w-6 h-6 ${severity === 'info' ? 'text-blue-600' : ''}`} />
              <span className="font-bold">Information</span>
            </button>
            <button
              onClick={() => setSeverity('warning')}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                severity === 'warning' 
                  ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 shadow-sm' 
                  : 'border-slate-200 dark:border-slate-700 hover:border-amber-300 text-slate-500'
              }`}
            >
              <AlertCircle className={`w-6 h-6 ${severity === 'warning' ? 'text-amber-600' : ''}`} />
              <span className="font-bold">Warning</span>
            </button>
            <button
              onClick={() => setSeverity('critical')}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                severity === 'critical' 
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 shadow-sm' 
                  : 'border-slate-200 dark:border-slate-700 hover:border-red-300 text-slate-500'
              }`}
            >
              <AlertTriangle className={`w-6 h-6 ${severity === 'critical' ? 'text-red-600' : ''}`} />
              <span className="font-bold">Critical</span>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Alert Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. CAMPUS CLOSURE, FIRE ALARM, SERVER MAINTENANCE"
            className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Message Content</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Provide clear, concise instructions or information..."
            rows={4}
            className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white resize-none"
          />
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
          <button 
            onClick={() => { setTitle(''); setMessage(''); setSeverity('warning'); }}
            className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
          <button 
            onClick={handleBroadcast}
            disabled={isSending}
            className={`px-8 py-3 rounded-xl font-bold text-white transition-all shadow-sm flex items-center gap-2 ${
              isSending ? 'opacity-75 cursor-wait' : 'hover:scale-[1.02] hover:shadow-md'
            } ${
              severity === 'critical' ? 'bg-red-600 hover:bg-red-700' :
              severity === 'warning' ? 'bg-amber-600 hover:bg-amber-700' :
              'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <Send className={`w-4 h-4 ${isSending ? 'animate-pulse' : ''}`} />
            {isSending ? 'Broadcasting...' : 'Broadcast Alert Now'}
          </button>
        </div>
      </div>
    </div>
  );
}
