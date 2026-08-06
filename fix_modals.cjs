const fs = require('fs');

const createModalCode = (isWidget = false) => `      {/* Paystack Payment Gateway Modal */}
      {isPaymentModalOpen && selectedInvoice && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white ${isWidget ? 'dark:bg-slate-800 border border-slate-200 dark:border-slate-700 ' : ''}rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
            <div className="p-6 border-b border-slate-100 ${isWidget ? 'dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50' : 'bg-slate-50'} flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 font-bold tracking-wider uppercase">Secure Checkout</span>
                <h3 className="text-xl font-bold text-slate-900 ${isWidget ? 'dark:text-white ' : ''}mt-1">
                  Pay ₦{installmentPlan === 'full' 
                    ? selectedInvoice.amount.toLocaleString() 
                    : installmentPlan === 'half' 
                      ? (selectedInvoice.amount / 2).toLocaleString()
                      : (selectedInvoice.amount / 4).toLocaleString()}
                </h3>
              </div>
              <CreditCard className="w-8 h-8 text-slate-300 ${isWidget ? 'dark:text-slate-600' : ''}" />
            </div>
            
            <div className="p-6 space-y-5">
              <div className="p-4 bg-emerald-50 ${isWidget ? 'dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800/30' : 'text-emerald-800'} rounded-xl text-sm mb-4">
                You are paying for <strong>{selectedInvoice.purpose}</strong> (Ref: {selectedInvoice.reference}).
              </div>
              
              {selectedInvoice.amount > 10000 && (
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-slate-700 ${isWidget ? 'dark:text-slate-300' : ''}">Payment Plan</label>
                  <div className="grid grid-cols-1 gap-2">
                    <label className={\`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-colors \${installmentPlan === 'full' ? 'border-emerald-500 bg-emerald-50 ${isWidget ? 'dark:bg-emerald-900/10' : ''}' : 'border-slate-200 ${isWidget ? 'dark:border-slate-700' : ''} hover:bg-slate-50 ${isWidget ? 'dark:hover:bg-slate-800/50' : ''}'}\`}>
                      <div className="flex items-center gap-3">
                        <input type="radio" name="plan" value="full" checked={installmentPlan === 'full'} onChange={() => setInstallmentPlan('full')} className="text-emerald-600 focus:ring-emerald-500" />
                        <div>
                          <p className="font-bold text-sm text-slate-900 ${isWidget ? 'dark:text-white' : ''}">Pay in Full</p>
                          <p className="text-xs text-slate-500">₦{selectedInvoice.amount.toLocaleString()} today</p>
                        </div>
                      </div>
                    </label>
                    <label className={\`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-colors \${installmentPlan === 'half' ? 'border-emerald-500 bg-emerald-50 ${isWidget ? 'dark:bg-emerald-900/10' : ''}' : 'border-slate-200 ${isWidget ? 'dark:border-slate-700' : ''} hover:bg-slate-50 ${isWidget ? 'dark:hover:bg-slate-800/50' : ''}'}\`}>
                      <div className="flex items-center gap-3">
                        <input type="radio" name="plan" value="half" checked={installmentPlan === 'half'} onChange={() => setInstallmentPlan('half')} className="text-emerald-600 focus:ring-emerald-500" />
                        <div>
                          <p className="font-bold text-sm text-slate-900 ${isWidget ? 'dark:text-white' : ''}">2 Installments</p>
                          <p className="text-xs text-slate-500">₦{(selectedInvoice.amount / 2).toLocaleString()} today</p>
                        </div>
                      </div>
                    </label>
                    <label className={\`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-colors \${installmentPlan === 'quarter' ? 'border-emerald-500 bg-emerald-50 ${isWidget ? 'dark:bg-emerald-900/10' : ''}' : 'border-slate-200 ${isWidget ? 'dark:border-slate-700' : ''} hover:bg-slate-50 ${isWidget ? 'dark:hover:bg-slate-800/50' : ''}'}\`}>
                      <div className="flex items-center gap-3">
                        <input type="radio" name="plan" value="quarter" checked={installmentPlan === 'quarter'} onChange={() => setInstallmentPlan('quarter')} className="text-emerald-600 focus:ring-emerald-500" />
                        <div>
                          <p className="font-bold text-sm text-slate-900 ${isWidget ? 'dark:text-white' : ''}">4 Installments</p>
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
                  className="px-4 py-3 text-slate-600 ${isWidget ? 'dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700' : 'hover:bg-slate-100'} font-medium rounded-lg transition-colors w-full sm:w-auto"
                >
                  Cancel
                </button>
                <PaystackButton
                  className="px-6 py-3 bg-slate-900 ${isWidget ? 'dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700' : 'hover:bg-slate-800'} text-white font-bold rounded-lg transition-colors disabled:opacity-50 w-full sm:w-auto flex items-center justify-center gap-2"
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
      )}`;

const replaceModal = (filePath, isWidget) => {
  let code = fs.readFileSync(filePath, 'utf8');
  
  // Add state if not exists
  if (!code.includes('const [installmentPlan')) {
    code = code.replace('const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);', "const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);\n  const [installmentPlan, setInstallmentPlan] = useState('full');");
  }

  // Find where the modal starts
  const modalStartStr = '{/* Paystack Payment Gateway Modal */}';
  const modalStartIndex = code.indexOf(modalStartStr);
  
  if (modalStartIndex !== -1) {
    const codeBeforeModal = code.substring(0, modalStartIndex);
    const codeAfterModal = createModalCode(isWidget) + "\n    </div>\n  );\n}";
    
    // Check if the original ended with the same ending tag
    // We can just replace everything from modalStartStr to the end of the return statement.
    const lastClosingDiv = code.lastIndexOf('</div>');
    
    // A simpler way: we know it's at the end of the file.
    // Let's replace the whole modal manually.
    fs.writeFileSync(filePath, codeBeforeModal + createModalCode(isWidget) + "\n    </div>\n  );\n}");
    console.log("Updated " + filePath);
  } else {
    console.log("Could not find modal in " + filePath);
  }
}

replaceModal('src/pages/dashboards/student/Payments.tsx', false);
replaceModal('src/components/StudentFeeWidget.tsx', true);

