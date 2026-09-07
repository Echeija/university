import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const IDLE_TIMEOUT_MS = 14 * 60 * 1000; // 14 minutes
const WARNING_DURATION_MS = 60 * 1000; // 1 minute countdown

export default function IdleTimeoutHandler() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(WARNING_DURATION_MS / 1000);
  
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearAllTimers = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
  }, []);

  const resetTimer = useCallback(() => {
    if (showWarning) return; // Don't reset if warning is already showing

    clearAllTimers();

    idleTimerRef.current = setTimeout(() => {
      setShowWarning(true);
      setCountdown(WARNING_DURATION_MS / 1000);
      
      // Start countdown
      countdownIntervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Set final logout timer
      warningTimerRef.current = setTimeout(() => {
        logout();
        navigate('/login');
        setShowWarning(false);
        clearAllTimers();
      }, WARNING_DURATION_MS);
      
    }, IDLE_TIMEOUT_MS);
  }, [logout, navigate, showWarning, clearAllTimers]);

  const handleStayLoggedIn = () => {
    setShowWarning(false);
    resetTimer();
  };

  const handleLogoutNow = () => {
    clearAllTimers();
    setShowWarning(false);
    logout();
    navigate('/login');
  };

  useEffect(() => {
    if (!user) {
      clearAllTimers();
      setShowWarning(false);
      return; 
    }

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'wheel', 'click'];
    
    // Throttle the event listeners
    let timeout: NodeJS.Timeout | null = null;
    const handleEvent = () => {
      if (timeout) return;
      timeout = setTimeout(() => {
        resetTimer();
        timeout = null;
      }, 1000); // 1-second throttle is enough for idle
    };

    events.forEach(event => window.addEventListener(event, handleEvent));
    resetTimer();

    return () => {
      events.forEach(event => window.removeEventListener(event, handleEvent));
      clearAllTimers();
      if (timeout) clearTimeout(timeout);
    };
  }, [user, resetTimer, clearAllTimers]);

  if (!showWarning) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700"
        >
          <div className="flex items-center space-x-4 mb-4 text-amber-500">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full flex-shrink-0">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Session Expiring Soon</h2>
            </div>
          </div>
          
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            You have been inactive for a while. For your security, you will be automatically logged out in <strong className="text-slate-900 dark:text-white">{countdown}</strong> seconds.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleStayLoggedIn}
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
            >
              <Clock className="w-4 h-4 mr-2" />
              Stay Logged In
            </button>
            <button
              onClick={handleLogoutNow}
              className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-white font-medium rounded-lg transition-colors"
            >
              Log Out Now
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
