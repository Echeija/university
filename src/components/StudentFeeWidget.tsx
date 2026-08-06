import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CreditCard, CheckCircle2, Clock, Wallet, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Skeleton } from './ui/Skeleton';
import { PaystackButton } from 'react-paystack';
import { useNotification } from '../contexts/NotificationContext';

export default function StudentFeeWidget() {
  const { token, user } = useAuth();
  const { notify } = useNotification();
  const navigate = useNavigate();
  const [payments, setPayments] = useState<any[]>([]);
  const [balanceInfo, setBalanceInfo] = useState({ totalExpected: 0, totalPaid: 0, balance: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [installmentPlan, setInstallmentPlan] = useState('full');

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      const [paymentsRes, balanceRes] = await Promise.all([
        fetch('/api/student/payments', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/student/balance', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      if (paymentsRes.ok) {
        setPayments(await paymentsRes.json());
      }
      
      if (balanceRes.ok) {
        setBalanceInfo(await balanceRes.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaystackSuccess = async (reference: any) => {
    console.log(reference);
    notify({ title: 'Success', message: 'Payment successful', type: 'success' });
    setIsPaymentModalOpen(false);
    
    try {
      const res = await fetch(`/api/student/payments/${selectedInvoice?.id}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          invoiceId: selectedInvoice?.id,
          reference: reference.reference, amountPaid: reference.amountPaid
        })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePaystackClose = () => {
    console.log('Payment closed');
  };

  const openPaymentModal = (invoice: any) => {
    setSelectedInvoice(invoice);
    setIsPaymentModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2 mb-6">
          <Skeleton className="w-5 h-5 rounded-full" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-24 w-full mb-4 rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
    );
  }

  const pendingPayments = payments.filter(p => p.status === 'pending');

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Wallet className="w-5 h-5 text-rose-500" />
          Fee Management
        </h3>
        <Link 
          to="/dashboard/payments" 
          className="text-sm font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 flex items-center"
        >
          View All <ChevronRight className="w-4 h-4 ml-1" />
        </Link>
      </div>

      <div className="bg-rose-50 dark:bg-rose-900/20 rounded-xl p-5 mb-6 border border-rose-100 dark:border-rose-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-rose-600 dark:text-rose-400 font-bold mb-1">Outstanding Balance</p>
          <p className="text-3xl font-black text-rose-700 dark:text-rose-300 leading-none">
            ₦{balanceInfo.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
        {balanceInfo.balance > 0 && pendingPayments.length > 0 && (
          <button
            onClick={() => openPaymentModal(pendingPayments[0])}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-bold transition-colors shadow-sm shrink-0"
          >
            Pay Now
          </button>
        )}
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Recent Invoices</h4>
        {payments.slice(0, 4).map((payment) => (
          <div key={payment.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-3 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                payment.status === 'successful' 
                  ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' 
                  : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
              }`}>
                {payment.status === 'successful' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{payment.purpose}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(payment.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center w-full sm:w-auto">
              <p className="text-sm font-bold text-slate-900 dark:text-white">₦{payment.amount.toLocaleString()}</p>
              {payment.status === 'pending' ? (
                 <button
                   onClick={() => openPaymentModal(payment)}
                   className="text-[10px] font-bold uppercase px-2 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded transition-colors hover:bg-amber-200 dark:hover:bg-amber-900/50"
                 >
                   Pay Now
                 </button>
              ) : (
                <p className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400">
                  {payment.status}
                </p>
              )}
            </div>
          </div>
        ))}
        {payments.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No recent invoices found.</p>
        )}
      </div>

            {/* Paystack Payment Gateway Modal */}
      {isPaymentModalOpen && selectedInvoice && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 font-bold tracking-wider uppercase">Secure Checkout</span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  Pay ₦{installmentPlan === 'full' 
                    ? selectedInvoice.amount.toLocaleString() 
                    : installmentPlan === 'half' 
                      ? (selectedInvoice.amount / 2).toLocaleString()
                      : (selectedInvoice.amount / 4).toLocaleString()}
                </h3>
              </div>
              <CreditCard className="w-8 h-8 text-slate-300 dark:text-slate-600" />
            </div>
            
            <div className="p-6 space-y-5">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800/30 rounded-xl text-sm mb-4">
                You are paying for <strong>{selectedInvoice.purpose}</strong> (Ref: {selectedInvoice.reference}).
              </div>
              
              {selectedInvoice.amount > 10000 && (
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Payment Plan</label>
                  <div className="grid grid-cols-1 gap-2">
                    <label className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-colors ${installmentPlan === 'full' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                      <div className="flex items-center gap-3">
                        <input type="radio" name="plan" value="full" checked={installmentPlan === 'full'} onChange={() => setInstallmentPlan('full')} className="text-emerald-600 focus:ring-emerald-500" />
                        <div>
                          <p className="font-bold text-sm text-slate-900 dark:text-white">Pay in Full</p>
                          <p className="text-xs text-slate-500">₦{selectedInvoice.amount.toLocaleString()} today</p>
                        </div>
                      </div>
                    </label>
                    <label className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-colors ${installmentPlan === 'half' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                      <div className="flex items-center gap-3">
                        <input type="radio" name="plan" value="half" checked={installmentPlan === 'half'} onChange={() => setInstallmentPlan('half')} className="text-emerald-600 focus:ring-emerald-500" />
                        <div>
                          <p className="font-bold text-sm text-slate-900 dark:text-white">2 Installments</p>
                          <p className="text-xs text-slate-500">₦{(selectedInvoice.amount / 2).toLocaleString()} today</p>
                        </div>
                      </div>
                    </label>
                    <label className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-colors ${installmentPlan === 'quarter' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                      <div className="flex items-center gap-3">
                        <input type="radio" name="plan" value="quarter" checked={installmentPlan === 'quarter'} onChange={() => setInstallmentPlan('quarter')} className="text-emerald-600 focus:ring-emerald-500" />
                        <div>
                          <p className="font-bold text-sm text-slate-900 dark:text-white">4 Installments</p>
                          <p className="text-xs text-slate-500">₦{(selectedInvoice.amount / 4).toLocaleString()} today</p>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-3 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium rounded-lg transition-colors w-full sm:w-auto"
                >
                  Cancel
                </button>
                <PaystackButton
                  className="px-6 py-3 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 w-full sm:w-auto flex items-center justify-center gap-2"
                  email={user?.email || 'student@example.com'}
                  amount={installmentPlan === 'full' 
                    ? selectedInvoice.amount * 100 
                    : installmentPlan === 'half' 
                      ? (selectedInvoice.amount / 2) * 100
                      : (selectedInvoice.amount / 4) * 100}
                  publicKey={import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_placeholder'}
                  text="Pay with Paystack"
                  onSuccess={(reference) => handlePaystackSuccess({
                     ...reference,
                     amountPaid: installmentPlan === 'full' 
                       ? selectedInvoice.amount 
                       : installmentPlan === 'half' 
                         ? (selectedInvoice.amount / 2)
                         : (selectedInvoice.amount / 4)
                  })}
                  onClose={handlePaystackClose}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}