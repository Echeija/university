import { useAuth } from '../../../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { Search, Filter, FileSpreadsheet, CheckCircle2, Clock } from 'lucide-react';

export default function PaymentManagement() {
  const { token } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/api/bursary/payments', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        setPayments(data);
        setIsLoading(false);
      });
  }, [token]);

  const filteredPayments = payments.filter(p => 
    p.reference.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.studentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Payment Management</h2>
          <p className="text-slate-500 mt-1">Track student fees and transactions.</p>
        </div>
        <button className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl font-bold transition-colors flex items-center gap-2 shadow-sm text-sm">
          <FileSpreadsheet className="w-4 h-4" /> Export Ledger
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-slate-500 font-bold mb-2">Total Collected (Session)</h3>
          <p className="text-3xl font-black text-slate-900">₦24,500,000</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-slate-500 font-bold mb-2">Pending Payments</h3>
          <p className="text-3xl font-black text-amber-600">₦1,250,000</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-slate-500 font-bold mb-2">Transaction Count</h3>
          <p className="text-3xl font-black text-blue-600">842</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white transition-all text-sm"
              placeholder="Search by reference or student name..."
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50">
            <Filter className="w-4 h-4" /> Filter Status
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white text-slate-500 text-xs uppercase tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Reference</th>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Purpose</th>
                <th className="px-6 py-4">Amount (₦)</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {isLoading ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-500">Loading payments...</td></tr>
              ) : filteredPayments.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-500">No transactions found.</td></tr>
              ) : (
                filteredPayments.map(payment => (
                  <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm font-bold text-slate-700">
                      {payment.reference}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{payment.studentName}</p>
                      <p className="text-xs text-slate-500">{payment.studentEmail}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{payment.purpose}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {payment.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      {payment.status === 'completed' || payment.status === 'successful' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
                          <CheckCircle2 className="w-3 h-3" /> Successful
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
