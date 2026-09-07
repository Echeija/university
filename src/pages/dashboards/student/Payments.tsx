import { PaystackButton } from 'react-paystack';
import { useAuth } from '../../../contexts/AuthContext';
import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, Clock, Wallet, FileText, X, AlertCircle } from 'lucide-react';
import { Skeleton } from '../../../components/ui/Skeleton';
import { useNotification } from '../../../contexts/NotificationContext';
import FeeHistory from '../../../components/FeeHistory';
import FeeAuditLog from '../../../components/FeeAuditLog';
// import FeeHistory from "../../../components/FeeHistory";
import PaymentReceiptModal from "../../../components/PaymentReceiptModal";

export default function Payments() {
  const { token } = useAuth();
  const { notify } = useNotification();
  
  const [payments, setPayments] = useState<any[]>([]);
  const [balanceInfo, setBalanceInfo] = useState({ totalExpected: 0, totalPaid: 0, balance: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [installmentPlan, setInstallmentPlan] = useState('full');
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  
  const [invoiceForm, setInvoiceForm] = useState({ purpose: 'Tuition Fee', amount: '', session: '2025/2026', semester: 'First' });

  const [isProcessing, setIsProcessing] = useState(false);
  const [receiptPayment, setReceiptPayment] = useState<any>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [paymentsRes, balanceRes] = await Promise.all([
        fetch('/api/student/payments', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/student/balance', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      const paymentsData = await paymentsRes.json();
      const balanceData = await balanceRes.json();
      
      setPayments(paymentsData);
      setBalanceInfo(balanceData);
    } catch (err) {
      console.error(err);
      notify({ title: 'Error', message: 'Failed to load payment data', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const res = await fetch('/api/student/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          purpose: invoiceForm.purpose,
          amount: parseFloat(invoiceForm.amount), session: invoiceForm.session, semester: invoiceForm.semester
        })
      });
      if (res.ok) {
        notify({ title: 'Success', message: 'Invoice generated successfully', type: 'success' });
        setIsInvoiceModalOpen(false);
        setInvoiceForm({ purpose: 'Tuition Fee', amount: '', session: '2025/2026', semester: 'First' });
        fetchData();
      } else {
        throw new Error('Failed to generate');
      }
    } catch (err) {
      notify({ title: 'Error', message: 'Could not generate invoice', type: 'error' });
    } finally {
      setIsProcessing(false);
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



  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Payments & Invoices</h2>
          <p className="text-slate-500 mt-1">Manage your tuition, view balance, and pay securely.</p>
        </div>
        <button 
          onClick={() => setIsInvoiceModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-lg shadow-emerald-200 flex items-center gap-2"
        >
          <FileText className="w-5 h-5" />
          Generate Invoice
        </button>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Expected</p>
            <h3 className="text-2xl font-black text-slate-900">
              {isLoading ? <Skeleton className="h-8 w-24" /> : `₦${balanceInfo.totalExpected.toLocaleString()}`}
            </h3>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Paid</p>
            <h3 className="text-2xl font-black text-emerald-600">
              {isLoading ? <Skeleton className="h-8 w-24" /> : `₦${balanceInfo.totalPaid.toLocaleString()}`}
            </h3>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-amber-200 bg-amber-50 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-amber-700">Outstanding Balance</p>
            <h3 className="text-2xl font-black text-amber-700">
              {isLoading ? <Skeleton className="h-8 w-24" /> : `₦${balanceInfo.balance.toLocaleString()}`}
            </h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="font-bold text-slate-800">Payment History & Invoices</h3>
        </div>
        <div className="p-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <Skeleton className="h-6 w-24 ml-auto" />
                    <Skeleton className="h-3 w-16 ml-auto" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <FeeHistory 
              payments={payments} 
              onPay={(payment) => { 
                setSelectedInvoice(payment); 
                setIsPaymentModalOpen(true); 
              }} 
              onViewReceipt={(payment) => setReceiptPayment(payment)} 
            />
          )}
        </div>
      </div>

      
        <div className="lg:col-span-1">
          <FeeAuditLog payments={payments} isLoading={isLoading} />
        </div>
      </div>
      
      {/* Receipt Modal */}
      {receiptPayment && user && (
        <PaymentReceiptModal
          payment={receiptPayment}
          user={user}
          onClose={() => setReceiptPayment(null)}
        />
      )}

      {/* Generate Invoice Modal */}
      {isInvoiceModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Generate Invoice</h3>
                <p className="text-sm text-slate-500">Create a new fee invoice</p>
              </div>
              <button onClick={() => setIsInvoiceModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleGenerateInvoice} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Fee Purpose</label>
                <select 
                  required
                  value={invoiceForm.purpose}
                  onChange={(e) => setInvoiceForm({...invoiceForm, purpose: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option>Tuition Fee</option>
                  <option>Acceptance Fee</option>
                  <option>Hostel Accommodation</option>
                  <option>Library Fee</option>
                  <option>Departmental Dues</option>
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Session</label>
                  <select 
                    required
                    value={invoiceForm.session}
                    onChange={(e) => setInvoiceForm({...invoiceForm, session: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="">Select Session</option>
                    <option value="2024/2025">2024/2025</option>
                    <option value="2025/2026">2025/2026</option>
                    <option value="2026/2027">2026/2027</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Semester</label>
                  <select 
                    required
                    value={invoiceForm.semester}
                    onChange={(e) => setInvoiceForm({...invoiceForm, semester: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option>First</option>
                    <option>Second</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₦)</label>
                <input 
                  type="number" 
                  required
                  min="1000"
                  value={invoiceForm.amount}
                  onChange={(e) => setInvoiceForm({...invoiceForm, amount: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="e.g. 50000"
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsInvoiceModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isProcessing}
                  className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {isProcessing ? 'Generating...' : 'Generate Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

            {/* Paystack Payment Gateway Modal */}
      {isPaymentModalOpen && selectedInvoice && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 font-bold tracking-wider uppercase">Secure Checkout</span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  Pay ₦{installmentPlan === 'full' 
                    ? selectedInvoice.amount.toLocaleString() 
                    : installmentPlan === 'half' 
                      ? (selectedInvoice.amount / 2).toLocaleString()
                      : (selectedInvoice.amount / 4).toLocaleString()}
                </h3>
              </div>
              <CreditCard className="w-8 h-8 text-slate-300 " />
            </div>
            
            <div className="p-6 space-y-5">
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-sm mb-4">
                You are paying for <strong>{selectedInvoice.purpose}</strong> (Ref: {selectedInvoice.reference}).
              </div>
              
              {selectedInvoice.amount > 10000 && (
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-slate-700 ">Payment Plan</label>
                  <div className="grid grid-cols-1 gap-2">
                    <label className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-colors ${installmentPlan === 'full' ? 'border-emerald-500 bg-emerald-50 ' : 'border-slate-200  hover:bg-slate-50 '}`}>
                      <div className="flex items-center gap-3">
                        <input type="radio" name="plan" value="full" checked={installmentPlan === 'full'} onChange={() => setInstallmentPlan('full')} className="text-emerald-600 focus:ring-emerald-500" />
                        <div>
                          <p className="font-bold text-sm text-slate-900 ">Pay in Full</p>
                          <p className="text-xs text-slate-500">₦{selectedInvoice.amount.toLocaleString()} today</p>
                        </div>
                      </div>
                    </label>
                    <label className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-colors ${installmentPlan === 'half' ? 'border-emerald-500 bg-emerald-50 ' : 'border-slate-200  hover:bg-slate-50 '}`}>
                      <div className="flex items-center gap-3">
                        <input type="radio" name="plan" value="half" checked={installmentPlan === 'half'} onChange={() => setInstallmentPlan('half')} className="text-emerald-600 focus:ring-emerald-500" />
                        <div>
                          <p className="font-bold text-sm text-slate-900 ">2 Installments</p>
                          <p className="text-xs text-slate-500">₦{(selectedInvoice.amount / 2).toLocaleString()} today</p>
                        </div>
                      </div>
                    </label>
                    <label className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-colors ${installmentPlan === 'quarter' ? 'border-emerald-500 bg-emerald-50 ' : 'border-slate-200  hover:bg-slate-50 '}`}>
                      <div className="flex items-center gap-3">
                        <input type="radio" name="plan" value="quarter" checked={installmentPlan === 'quarter'} onChange={() => setInstallmentPlan('quarter')} className="text-emerald-600 focus:ring-emerald-500" />
                        <div>
                          <p className="font-bold text-sm text-slate-900 ">4 Installments</p>
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
                  className="px-4 py-3 text-slate-600 hover:bg-slate-100 font-medium rounded-lg transition-colors w-full sm:w-auto"
                >
                  Cancel
                </button>
                <PaystackButton
                  className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-colors disabled:opacity-50 w-full sm:w-auto flex items-center justify-center gap-2"
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