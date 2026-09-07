import React, { useState, useEffect } from 'react';
import { Clock, Calendar, AlertCircle } from 'lucide-react';

interface ExamCountdownWidgetProps {
  title: string;
  targetDate: string | Date;
  courseName?: string;
}

export default function ExamCountdownWidget({ title, targetDate, courseName }: ExamCountdownWidgetProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();
      
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isExpired: false
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) return null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-500" />
            {title}
          </h3>
          {courseName && (
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">{courseName}</p>
          )}
        </div>
        <div className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider rounded-full">
          Countdown
        </div>
      </div>

      {timeLeft.isExpired ? (
        <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 p-4 rounded-xl flex items-center gap-3 border border-rose-100 dark:border-rose-800/30">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="font-bold">Time has expired for this assessment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-3 text-center border border-slate-100 dark:border-slate-700">
            <div className="text-2xl font-black text-slate-900 dark:text-white">{timeLeft.days}</div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">Days</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-3 text-center border border-slate-100 dark:border-slate-700">
            <div className="text-2xl font-black text-slate-900 dark:text-white">{timeLeft.hours}</div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">Hrs</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-3 text-center border border-slate-100 dark:border-slate-700">
            <div className="text-2xl font-black text-slate-900 dark:text-white">{timeLeft.minutes}</div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">Min</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-3 text-center border border-slate-100 dark:border-slate-700">
            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 animate-pulse">{timeLeft.seconds}</div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">Sec</div>
          </div>
        </div>
      )}
      
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
        <Calendar className="w-4 h-4 text-slate-400" />
        Due: {new Date(targetDate).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  );
}
