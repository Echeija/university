import React from 'react';
import { X, Printer, Download, Building } from 'lucide-react';
import html2canvas from 'html2canvas';

interface Payment {
  id?: string;
  reference: string;
  purpose: string;
  amount: number;
  status: string;
  created_at?: string;
  date?: string;
  session?: string;
  semester?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  studentId?: string;
  matricNumber?: string;
  department?: string;
  faculty?: string;
}

interface FeeSummaryReportModalProps {
  payments: Payment[];
  user: any;
  onClose: () => void;
}

export default function FeeSummaryReportModal({ payments, user, onClose }: FeeSummaryReportModalProps) {
  const printRef = React.useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    if (!printRef.current) return;
    
    try {
      const canvas = await html2canvas(printRef.current, { scale: 2 });
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `Fee_Summary_${user.matricNumber || user.studentId || 'Report'}.png`;
      link.click();
    } catch (error) {
      console.error('Error generating receipt image:', error);
    }
  };

  const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const completedPayments = payments.filter(p => p.status === 'Completed' || p.status === 'successful' || p.status === 'success');
  const completedAmount = completedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const pendingAmount = totalAmount - completedAmount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm print:static print:block print:bg-white print:p-0">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col print:shadow-none print:w-full print:max-w-none print:h-auto print:max-h-none print:block">
        
        {/* Modal Header - Hidden on Print */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 print:hidden">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Fee Summary Report</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-medium text-sm"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium text-sm"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Content */}
        <div className="p-8 overflow-y-auto print:overflow-visible print:p-0 bg-white" ref={printRef}>
          
          <div className="flex justify-between items-start mb-8 pb-8 border-b-2 border-slate-200">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-emerald-600 rounded-xl flex items-center justify-center text-white shrink-0">
                <Building className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">University Name</h1>
                <p className="text-slate-500 font-medium">Fee Summary Report</p>
                <p className="text-sm text-slate-400">Generated on {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Student Details</h3>
              <div className="space-y-1">
                <p className="text-lg font-bold text-slate-900">{user.name}</p>
                <p className="text-slate-600">ID: <span className="font-medium text-slate-900">{user.matricNumber || user.studentId || 'N/A'}</span></p>
                {user.department && <p className="text-slate-600">{user.department}</p>}
                {user.faculty && <p className="text-slate-600">{user.faculty}</p>}
              </div>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Summary Overview</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Transactions:</span>
                  <span className="font-bold text-slate-900">{payments.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Completed Payments:</span>
                  <span className="font-bold text-emerald-600">₦{completedAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pending/Failed:</span>
                  <span className="font-bold text-amber-600">₦{pendingAmount.toLocaleString()}</span>
                </div>
                <div className="pt-2 mt-2 border-t border-slate-200 flex justify-between">
                  <span className="text-slate-700 font-bold">Total Amount:</span>
                  <span className="font-black text-slate-900">₦{totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto"><table className="w-full text-left border-collapse mb-8">
            <thead>
              <tr className="border-b-2 border-slate-800">
                <th className="py-3 px-2 font-bold text-slate-900 text-sm">Date</th>
                <th className="py-3 px-2 font-bold text-slate-900 text-sm">Reference</th>
                <th className="py-3 px-2 font-bold text-slate-900 text-sm">Purpose & Session</th>
                <th className="py-3 px-2 font-bold text-slate-900 text-sm text-center">Status</th>
                <th className="py-3 px-2 font-bold text-slate-900 text-sm text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {payments.map((payment) => (
                <tr key={payment.id || payment.reference}>
                  <td className="py-4 px-2 text-sm text-slate-600">
                    {new Date(payment.date || payment.created_at || '').toLocaleDateString()}
                  </td>
                  <td className="py-4 px-2 text-sm font-mono text-slate-600">
                    {payment.reference}
                  </td>
                  <td className="py-4 px-2">
                    <p className="text-sm font-bold text-slate-900">{payment.purpose}</p>
                    {(payment.session || payment.semester) && (
                      <p className="text-xs text-slate-500">
                        {payment.session} {payment.semester ? `- ${payment.semester}` : ''}
                      </p>
                    )}
                  </td>
                  <td className="py-4 px-2 text-sm text-center">
                    {(payment.status === 'Completed' || payment.status === 'successful' || payment.status === 'success') 
                      ? <span className="text-emerald-600 font-bold">Completed</span>
                      : payment.status === 'Pending' 
                      ? <span className="text-amber-600 font-bold">Pending</span>
                      : <span className="text-red-600 font-bold">{payment.status}</span>}
                  </td>
                  <td className="py-4 px-2 text-sm font-bold text-slate-900 text-right">
                    ₦{(payment.amount || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-800">
                <td colSpan={4} className="py-4 px-2 text-right font-bold text-slate-900">
                  Total Completed:
                </td>
                <td className="py-4 px-2 text-right font-black text-slate-900 text-lg">
                  ₦{completedAmount.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table></div>

          <div className="mt-12 text-sm text-slate-500 text-center border-t border-slate-200 pt-8">
            <p className="font-bold text-slate-900 mb-1">Official Payment Summary Report</p>
            <p>This document serves as a consolidated summary of the selected transactions.</p>
          </div>

        </div>
      </div>
    </div>
  );
}
