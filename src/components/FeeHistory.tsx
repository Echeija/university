import React from 'react';
import { CheckCircle2, Clock, Calendar } from 'lucide-react';

interface Payment {
  id: number;
  amount: number;
  purpose: string;
  reference: string;
  status: string;
  createdAt: string;
  session?: string;
  semester?: string;
}

interface FeeHistoryProps {
  payments: Payment[];
  onPay?: (payment: Payment) => void;
  onViewReceipt?: (payment: Payment) => void;
}

export default function FeeHistory({ payments, onPay, onViewReceipt }: FeeHistoryProps) {
  // Group payments by session and semester
  const groupedPayments = payments.reduce((acc, payment) => {
    const session = payment.session || 'Unknown Session';
    const semester = payment.semester || 'Unknown Semester';
    const key = `${session} - ${semester}`;
    
    if (!acc[key]) {
      acc[key] = {
        session,
        semester,
        payments: []
      };
    }
    acc[key].payments.push(payment);
    return acc;
  }, {} as Record<string, { session: string; semester: string; payments: Payment[] }>);

  const groups = Object.values(groupedPayments).sort((a, b) => {
    if (a.session !== b.session) {
      return b.session.localeCompare(a.session);
    }
    return b.semester.localeCompare(a.semester);
  });

  if (payments.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center text-slate-500">
        No payment history available. Generate an invoice to begin.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groups.map((group, index) => (
        <div key={index} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">{group.session} Academic Session</h3>
                <p className="text-sm text-slate-500">{group.semester} Semester</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-slate-900">
                Total: ₦{group.payments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
              </p>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white text-slate-500 text-xs uppercase tracking-wider font-bold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Fee Type</th>
                  <th className="px-6 py-4">Reference</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {group.payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-500 text-sm whitespace-nowrap">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {payment.purpose}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-500 font-mono text-xs">{payment.reference}</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      ₦{payment.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                        payment.status === 'successful' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {payment.status === 'successful' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {payment.status === 'pending' && onPay ? (
                        <button
                          onClick={() => onPay(payment)}
                          className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors whitespace-nowrap"
                        >
                          Pay Now
                        </button>
                      ) : payment.status === 'successful' ? (
                        <button onClick={() => onViewReceipt && onViewReceipt(payment)} className="text-sm text-emerald-600 font-medium hover:text-emerald-700">Receipt</button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
