import React from 'react';
import { CheckCircle2, Clock, PlayCircle, AlertCircle } from 'lucide-react';
import { Skeleton } from './ui/Skeleton';

interface Payment {
  id: number;
  purpose: string;
  amount: number;
  status: string;
  createdAt: string;
  reference: string;
}

interface FeeAuditLogProps {
  payments: Payment[];
  isLoading: boolean;
}

export default function FeeAuditLog({ payments, isLoading }: FeeAuditLogProps) {
  // Generate audit log entries based on payment status
  const getAuditLogs = () => {
    let logs: any[] = [];
    
    payments.forEach(payment => {
      const createdDate = new Date(payment.createdAt || new Date());
      
      // Initiation entry
      logs.push({
        id: `init-${payment.id}`,
        paymentId: payment.id,
        purpose: payment.purpose,
        reference: payment.reference,
        status: 'initiated',
        description: 'Payment invoice generated',
        timestamp: createdDate,
        icon: PlayCircle,
        color: 'text-blue-500',
        bgColor: 'bg-blue-100 dark:bg-blue-900/30'
      });
      
      if (payment.status === 'successful' || payment.status === 'Successful') {
        // Mock processing entry
        const processDate = new Date(createdDate.getTime() + 1000 * 60 * 5); // 5 mins later
        logs.push({
          id: `proc-${payment.id}`,
          paymentId: payment.id,
          purpose: payment.purpose,
          reference: payment.reference,
          status: 'processing',
          description: 'Payment processing via gateway',
          timestamp: processDate,
          icon: Clock,
          color: 'text-amber-500',
          bgColor: 'bg-amber-100 dark:bg-amber-900/30'
        });
        
        // Completion entry
        const completeDate = new Date(createdDate.getTime() + 1000 * 60 * 7); // 7 mins later
        logs.push({
          id: `comp-${payment.id}`,
          paymentId: payment.id,
          purpose: payment.purpose,
          reference: payment.reference,
          status: 'completed',
          description: 'Payment successfully completed',
          timestamp: completeDate,
          icon: CheckCircle2,
          color: 'text-emerald-500',
          bgColor: 'bg-emerald-100 dark:bg-emerald-900/30'
        });
      } else if (payment.status === 'failed' || payment.status === 'Failed') {
        const failedDate = new Date(createdDate.getTime() + 1000 * 60 * 5);
        logs.push({
          id: `fail-${payment.id}`,
          paymentId: payment.id,
          purpose: payment.purpose,
          reference: payment.reference,
          status: 'failed',
          description: 'Payment transaction failed',
          timestamp: failedDate,
          icon: AlertCircle,
          color: 'text-rose-500',
          bgColor: 'bg-rose-100 dark:bg-rose-900/30'
        });
      }
    });
    
    // Sort by timestamp descending
    return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  };

  const logs = getAuditLogs();

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="p-6 space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-4">
              <Skeleton className="w-10 h-10 rounded-full shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
        <h3 className="font-bold text-slate-800 dark:text-white">Fee Audit Log</h3>
        <span className="text-xs font-medium bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-full">
          {logs.length} Entries
        </span>
      </div>
      
      <div className="p-6">
        {logs.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
            No audit logs available.
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-100 dark:border-slate-700 ml-4 space-y-6">
            {logs.slice(0, 10).map((log, index) => {
              const Icon = log.icon;
              return (
                <div key={log.id} className="relative pl-6">
                  {/* Timeline dot */}
                  <div className={`absolute -left-[17px] top-0.5 w-8 h-8 rounded-full border-4 border-white dark:border-slate-800 ${log.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-3.5 h-3.5 ${log.color}`} />
                  </div>
                  
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {log.purpose}
                      </p>
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {log.timestamp.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {log.description}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-mono">
                      Ref: {log.reference}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {logs.length > 10 && (
          <button className="w-full mt-6 py-2 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors">
            View Complete Audit Trail
          </button>
        )}
      </div>
    </div>
  );
}
