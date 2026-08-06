import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Clock, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SessionManager() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!token) {
      setShowWarning(false);
      return;
    }

    try {
      const payloadBase64 = token.split('.')[1];
      const decodedJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
      const payload = JSON.parse(decodedJson);
      
      if (!payload.exp) return;

      const expTime = payload.exp * 1000;
      
      // Check every second
      const interval = setInterval(() => {
        const now = Date.now();
        const remaining = expTime - now;

        if (remaining <= 0) {
          clearInterval(interval);
          setShowWarning(false);
          logout();
          navigate('/login');
        } else if (remaining <= 5 * 60 * 1000) { // 5 minutes warning
          setTimeLeft(Math.floor(remaining / 1000));
          if (!showWarning) setShowWarning(true);
        } else {
          setShowWarning(false);
        }
      }, 1000);

      return () => clearInterval(interval);
    } catch (e) {
      console.error('Failed to parse token', e);
    }
  }, [token, logout, navigate, showWarning]);

  if (!showWarning) return null;

  // Only show for students and lecturers
  if (user?.role !== 'Student' && user?.role !== 'Lecturer') return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 max-w-md w-full border border-rose-100 dark:border-rose-900/30 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-rose-500">
          <div 
            className="h-full bg-rose-300 transition-all duration-1000 ease-linear" 
            style={{ width: `${(timeLeft / 300) * 100}%` }}
          />
        </div>
        
        <div className="w-20 h-20 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-600 dark:text-rose-400">
          <Clock className="w-10 h-10" />
        </div>
        
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Session Expiring Soon</h2>
        
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          For your security, your session will automatically end in:
        </p>
        
        <div className="text-5xl font-mono font-bold text-rose-600 dark:text-rose-400 mb-8 flex justify-center items-baseline gap-2">
          <span>{String(minutes).padStart(2, '0')}</span>
          <span className="text-2xl animate-pulse">:</span>
          <span>{String(seconds).padStart(2, '0')}</span>
        </div>
        
        <button 
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="w-full py-4 bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold rounded-xl transition-colors"
        >
          Log Out Now
        </button>
      </div>
    </div>
  );
}
