import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle, Calendar, ArrowRight, Wallet, BellRing } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Skeleton } from './ui/Skeleton';

export default function PaymentAlertsWidget() {
  const { token } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, [token]);

  const fetchPayments = async () => {
    try {
      const res = await fetch('/api/student/payments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPayments(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="w-5 h-5 rounded-full" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
    );
  }

  const pendingPayments = payments.filter(p => p.status === 'pending' || p.status === 'Pending');

  if (pendingPayments.length === 0) {
    return null; // Hide if no pending payments
  }

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-rose-100 dark:border-rose-900/30 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
            <AlertCircle className="w-5 h-5 text-rose-500" />
            Upcoming Payment Deadlines
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            You have {pendingPayments.length} outstanding fee{pendingPayments.length > 1 ? 's' : ''} requiring attention.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/dashboard/profile"
            className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm whitespace-nowrap border border-slate-200 dark:border-slate-700"
            title="Notification Preferences"
          >
            <BellRing className="w-4 h-4" />
            Alerts
          </Link>
        
        <Link
          to="/dashboard/payments"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 font-bold rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors text-sm whitespace-nowrap"
        >
          <Wallet className="w-4 h-4" />
          Pay Now
          <ArrowRight className="w-4 h-4" />
        </Link>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {pendingPayments.slice(0, 3).map(payment => {
          // Calculate mock deadline (14 days from creation)
          const createdAt = new Date(payment.createdAt || payment.created_at);
          const deadline = new Date(createdAt);
          deadline.setDate(deadline.getDate() + 14);
          
          const now = new Date();
          const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          const isOverdue = daysLeft < 0;
          const isUrgent = daysLeft <= 3 && !isOverdue;

          return (
            <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <div>
                <p className="font-medium text-slate-900 dark:text-white text-sm">{payment.purpose}</p>
                <div className="flex items-center gap-1.5 mt-0.5 text-xs">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-500 dark:text-slate-400">
                    Due: {deadline.toLocaleDateString()}
                  </span>
                  <span className={`ml-2 font-medium ${
                    isOverdue ? 'text-rose-600 dark:text-rose-400' : 
                    isUrgent ? 'text-amber-600 dark:text-amber-400' : 
                    'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {isOverdue ? 'Overdue' : `${daysLeft} days left`}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-900 dark:text-white">₦{payment.amount.toLocaleString()}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
