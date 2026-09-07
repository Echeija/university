import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { FileText, Download, Printer, Search, CheckCircle2, XCircle, Clock, AlertCircle, Filter, Calendar } from 'lucide-react';
import { Skeleton } from '../../../components/ui/Skeleton';
import PaymentReceiptModal from '../../../components/PaymentReceiptModal';
import FeeSummaryReportModal from '../../../components/FeeSummaryReportModal';

export default function FeeReceiptModule() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedTransactions, setSelectedTransactions] = useState<any[]>([]);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, [user?.id]);

  const fetchPayments = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      } else {
        setPayments(data || []);
      }
    } catch (err) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/student/payments', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setPayments(data);
        } else {
          setError("Could not load payment history.");
        }
      } catch (fallbackErr) {
        setError("Network error while loading payments.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPayments = payments.filter(p => {
    const matchesSearch = (p.purpose && p.purpose.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.reference && p.reference.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.session && p.session.toLowerCase().includes(searchQuery.toLowerCase()));

    const paymentDateStr = p.date || p.created_at;
    const paymentDate = paymentDateStr ? new Date(paymentDateStr) : new Date();
    
    let matchesStartDate = true;
    if (startDate) {
      matchesStartDate = paymentDate >= new Date(startDate);
    }
    
    let matchesEndDate = true;
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      matchesEndDate = paymentDate <= end;
    }

    let matchesCategory = true;
    if (categoryFilter) {
      if (categoryFilter === 'Tuition') {
        matchesCategory = p.purpose?.toLowerCase().includes('tuition') || p.purpose?.toLowerCase().includes('school fee');
      } else if (categoryFilter === 'Hostel') {
        matchesCategory = p.purpose?.toLowerCase().includes('hostel') || p.purpose?.toLowerCase().includes('accommodation');
      } else {
        matchesCategory = p.purpose?.toLowerCase().includes(categoryFilter.toLowerCase());
      }
    }

    return matchesSearch && matchesStartDate && matchesEndDate && matchesCategory;
  });

  const completedFilteredPayments = filteredPayments.filter(p => p.status === 'Completed' || p.status === 'successful' || p.status === 'success');

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedTransactions(completedFilteredPayments);
    } else {
      setSelectedTransactions([]);
    }
  };

  const handleSelectPayment = (e: React.ChangeEvent<HTMLInputElement>, payment: any) => {
    if (e.target.checked) {
      setSelectedTransactions([...selectedTransactions, payment]);
    } else {
      setSelectedTransactions(selectedTransactions.filter(t => (t.id || t.reference) !== (payment.id || payment.reference)));
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Fee Receipts</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">View your payment history and download official receipts.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
              Transaction History
            </h3>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              {selectedTransactions.length > 0 && (
                <button
                  onClick={() => setIsSummaryModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm whitespace-nowrap"
                >
                  <FileText className="w-4 h-4" />
                  Generate Report ({selectedTransactions.length})
                </button>
              )}
              <div className="relative w-full md:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${showFilters ? 'bg-slate-200 border-slate-300 dark:bg-slate-700 dark:border-slate-600' : 'bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700'} text-slate-700 dark:text-slate-300`}
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>
          </div>
          
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Start Date</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">End Date</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="">All Categories</option>
                  <option value="Tuition">Tuition / School Fees</option>
                  <option value="Hostel">Hostel / Accommodation</option>
                  <option value="Medical">Medical Fees</option>
                  <option value="Departmental">Departmental Dues</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="p-4 m-6 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-y border-slate-200 dark:border-slate-700">
                <th className="px-6 py-4 text-left w-12">
                  <input 
                    type="checkbox"
                    id="select-all"
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    onChange={handleSelectAll}
                    checked={completedFilteredPayments.length > 0 && selectedTransactions.length === completedFilteredPayments.length}
                  />
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Reference</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Purpose</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {isLoading ? (
                Array(4).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-4" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-40" /></td>
                    <td className="px-6 py-4 flex justify-end"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-20 mx-auto rounded-full" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-8 w-24 mx-auto rounded-lg" /></td>
                  </tr>
                ))
              ) : filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => (
                  <tr key={payment.id || payment.reference} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      {(payment.status === 'Completed' || payment.status === 'successful' || payment.status === 'success') ? (
                        <input 
                          type="checkbox"
                          className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          checked={selectedTransactions.some(t => (t.id || t.reference) === (payment.id || payment.reference))}
                          onChange={(e) => handleSelectPayment(e, payment)}
                        />
                      ) : (
                        <span className="w-4 h-4 inline-block"></span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                      {new Date(payment.date || payment.created_at || new Date()).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-900 dark:text-slate-200">
                      {payment.reference}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900 dark:text-white">{payment.purpose}</div>
                      {payment.session && <div className="text-xs text-slate-500 dark:text-slate-400">{payment.session} {payment.semester ? `- ${payment.semester} Semester` : ''}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900 dark:text-white text-right">
                      ₦{(payment.amount || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                        ${payment.status === 'Completed' || payment.status === 'successful' || payment.status === 'success' 
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                          : payment.status === 'Pending' 
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}
                      >
                        {payment.status === 'Completed' || payment.status === 'successful' || payment.status === 'success' ? <CheckCircle2 className="w-3 h-3" /> : payment.status === 'Pending' ? <Clock className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {payment.status === 'successful' ? 'Completed' : payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {(payment.status === 'Completed' || payment.status === 'successful' || payment.status === 'success') ? (
                        <button
                          onClick={() => setSelectedReceipt(payment)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-lg transition-colors"
                        >
                          <Printer className="w-4 h-4" />
                          Receipt
                        </button>
                      ) : (
                        <span className="text-sm text-slate-400 dark:text-slate-500 italic">Not available</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    No payment history found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isSummaryModalOpen && user && (
        <FeeSummaryReportModal
          payments={selectedTransactions}
          user={user}
          onClose={() => setIsSummaryModalOpen(false)}
        />
      )}
      
      {selectedReceipt && user && (
        <PaymentReceiptModal
          payment={selectedReceipt}
          user={user}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
}
