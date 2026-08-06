const fs = require('fs');
let code = fs.readFileSync('src/components/PaymentReceiptModal.tsx', 'utf8');

const newCode = `import React, { useRef } from 'react';
import { X, Printer, CheckCircle2, GraduationCap, ShieldCheck } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import QRCode from 'react-qr-code';

interface PaymentReceiptModalProps {
  payment: any;
  user: any;
  onClose: () => void;
}

export default function PaymentReceiptModal({ payment, user, onClose }: PaymentReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: \`Receipt_\${payment.reference}\`,
  });
  
  // URL or verification string for the QR code
  const verificationUrl = \`https://verify.university.edu/receipt/\${payment.reference}\`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Official Payment Receipt
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePrint()}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" /> Print Receipt
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-8 overflow-y-auto bg-slate-100" ref={receiptRef}>
          <div className="max-w-2xl mx-auto border border-slate-200 p-10 rounded-xl bg-white shadow-sm relative">
            
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
              <GraduationCap className="w-96 h-96" />
            </div>

            {/* Header: University Branding */}
            <div className="flex justify-between items-start mb-8 pb-8 border-b-2 border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-slate-900 text-white rounded-xl flex items-center justify-center shrink-0">
                  <GraduationCap className="w-10 h-10" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-900 uppercase tracking-wider">Grand State</h1>
                  <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">University</h2>
                  <p className="text-xs text-slate-400 mt-1">Bursary Department</p>
                </div>
              </div>
              
              <div className="text-right">
                <h2 className="text-2xl font-black text-emerald-600 uppercase tracking-tight">Receipt</h2>
                <p className="text-sm font-bold text-slate-500 mt-1">NO. <span className="text-slate-900">{payment.reference}</span></p>
                <div className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded uppercase tracking-wider">
                  <ShieldCheck className="w-3 h-3" /> Confirmed
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Received From</p>
                  <p className="font-bold text-slate-900 text-lg">{user?.name}</p>
                  <p className="text-sm font-medium text-slate-600 mt-1">{user?.email}</p>
                  <p className="text-sm font-medium text-slate-600">Matric No: {user?.id?.substring(0, 8).toUpperCase() || 'STD-000000'}</p>
                </div>
              </div>
              <div className="space-y-4 text-right">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Payment Date & Time</p>
                  <p className="font-bold text-slate-900">{new Date(payment.createdAt || payment.created_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p className="text-sm font-medium text-slate-600 mt-1">{new Date(payment.createdAt || payment.created_at).toLocaleTimeString()}</p>
                </div>
              </div>
            </div>
            
            {/* Table */}
            <div className="rounded-xl border border-slate-200 overflow-hidden mb-8">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Payment Description</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Academic Session</th>
                    <th className="text-right py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-4 px-4 text-slate-900">
                      <div className="font-bold">{payment.purpose}</div>
                    </td>
                    <td className="py-4 px-4 text-slate-600 text-sm">
                      {payment.session} Session <br/> {payment.semester} Semester
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-slate-900">
                      ₦{payment.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="border-t border-slate-200 bg-slate-50">
                    <td colSpan={2} className="py-4 px-4 font-black text-slate-900 text-right uppercase text-sm tracking-wider">Total Paid</td>
                    <td className="py-4 px-4 font-black text-emerald-600 text-xl text-right">
                      ₦{payment.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            {/* Footer with QR Code */}
            <div className="flex justify-between items-end border-t-2 border-slate-100 pt-8 mt-8">
              <div className="max-w-xs">
                <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Authenticity Verification</p>
                <div className="bg-white p-2 border border-slate-200 rounded-lg inline-block shadow-sm">
                  <QRCode value={verificationUrl} size={80} />
                </div>
                <p className="text-[10px] text-slate-400 mt-2">Scan QR code to verify this receipt's authenticity on the official university portal.</p>
              </div>
              
              <div className="text-right max-w-xs">
                <div className="mb-4">
                  <div className="h-10 border-b border-slate-300 w-40 ml-auto mb-2 relative">
                    <div className="absolute bottom-1 right-2 w-16 h-8 opacity-40 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCAxMDAgMzAiPjxwYXRoIGQ9Ik0xMCAyMCBDIDIwIDEwLCAzMCAzMCwgNDAgMjAgUyA2MCAxMCwgNzAgMjAgUyA5MCAzMCwgMTAwIDIwIiBzdHJva2U9IiMwMDAiIGZpbGw9Im5vbmUiIHN0cm9rZS13aWR0aD0iMiIvPjwvc3ZnPg==')] bg-no-repeat bg-contain"></div>
                  </div>
                  <p className="text-xs font-bold text-slate-900">Authorized Signature</p>
                  <p className="text-[10px] text-slate-500">Bursary Department</p>
                </div>
                <p className="text-[10px] text-slate-400">
                  This is a computer-generated receipt valid only upon successful payment clearance.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
`

fs.writeFileSync('src/components/PaymentReceiptModal.tsx', newCode);
console.log("Updated PaymentReceiptModal.tsx");
