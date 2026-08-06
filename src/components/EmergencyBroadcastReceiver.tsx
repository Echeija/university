import React, { useEffect, useState } from 'react';
import { AlertTriangle, X, Info, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

interface EmergencyPayload {
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: number;
}

export default function EmergencyBroadcastReceiver() {
  const [activeBroadcast, setActiveBroadcast] = useState<EmergencyPayload | null>(null);

  useEffect(() => {
    // We create a single broadcast channel for emergencies
    const channel = supabase.channel('emergency_broadcast');
    
    channel.on('broadcast', { event: 'emergency' }, (payload) => {
      console.log('Received emergency broadcast:', payload);
      if (payload.payload) {
        setActiveBroadcast(payload.payload as EmergencyPayload);
      }
    });

    channel.subscribe((status) => {
      console.log('Emergency channel status:', status);
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const dismiss = () => {
    setActiveBroadcast(null);
  };

  return (
    <AnimatePresence>
      {activeBroadcast && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed top-0 left-0 right-0 z-[9999] p-4 flex justify-center pointer-events-none"
        >
          <div 
            className={`pointer-events-auto max-w-3xl w-full rounded-2xl shadow-2xl border-l-4 p-5 flex items-start gap-4 ${
              activeBroadcast.severity === 'critical' 
                ? 'bg-red-50 dark:bg-red-950/90 border-red-600 shadow-red-900/20' 
                : activeBroadcast.severity === 'warning'
                ? 'bg-amber-50 dark:bg-amber-950/90 border-amber-500 shadow-amber-900/20'
                : 'bg-blue-50 dark:bg-blue-950/90 border-blue-500 shadow-blue-900/20'
            }`}
          >
            <div className={`shrink-0 p-3 rounded-full ${
              activeBroadcast.severity === 'critical'
                ? 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400'
                : activeBroadcast.severity === 'warning'
                ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400'
                : 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
            }`}>
              {activeBroadcast.severity === 'critical' ? (
                <AlertTriangle className="w-8 h-8 animate-pulse" />
              ) : activeBroadcast.severity === 'warning' ? (
                <AlertCircle className="w-8 h-8" />
              ) : (
                <Info className="w-8 h-8" />
              )}
            </div>
            
            <div className="flex-1 mt-1">
              <div className="flex items-center gap-3 mb-1">
                <h3 className={`text-lg font-black ${
                  activeBroadcast.severity === 'critical'
                    ? 'text-red-900 dark:text-red-100'
                    : activeBroadcast.severity === 'warning'
                    ? 'text-amber-900 dark:text-amber-100'
                    : 'text-blue-900 dark:text-blue-100'
                }`}>
                  {activeBroadcast.title}
                </h3>
                {activeBroadcast.severity === 'critical' && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-600 text-white animate-pulse">
                    EMERGENCY
                  </span>
                )}
              </div>
              <p className={`text-sm ${
                  activeBroadcast.severity === 'critical'
                    ? 'text-red-800 dark:text-red-200'
                    : activeBroadcast.severity === 'warning'
                    ? 'text-amber-800 dark:text-amber-200'
                    : 'text-blue-800 dark:text-blue-200'
                }`}>
                {activeBroadcast.message}
              </p>
              <p className="text-[10px] mt-2 opacity-70">
                Broadcasted at {new Date(activeBroadcast.timestamp).toLocaleTimeString()}
              </p>
            </div>
            
            <button 
              onClick={dismiss}
              className={`p-2 rounded-xl transition-colors shrink-0 ${
                activeBroadcast.severity === 'critical'
                  ? 'hover:bg-red-200/50 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300'
                  : activeBroadcast.severity === 'warning'
                  ? 'hover:bg-amber-200/50 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300'
                  : 'hover:bg-blue-200/50 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
