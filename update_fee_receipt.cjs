const fs = require('fs');

let code = fs.readFileSync('src/pages/dashboards/student/FeeReceiptModule.tsx', 'utf8');

// 1. Add import for FeeSummaryReportModal
if (!code.includes("import FeeSummaryReportModal")) {
    code = code.replace(
        "import PaymentReceiptModal from '../../../components/PaymentReceiptModal';",
        "import PaymentReceiptModal from '../../../components/PaymentReceiptModal';\nimport FeeSummaryReportModal from '../../../components/FeeSummaryReportModal';"
    );
}

// 2. Add state for selected items
if (!code.includes("const [selectedTransactions, setSelectedTransactions] = useState")) {
    code = code.replace(
        "const [error, setError] = useState<string | null>(null);",
        "const [error, setError] = useState<string | null>(null);\n  const [selectedTransactions, setSelectedTransactions] = useState<any[]>([]);\n  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);"
    );
}

// 3. Add checkbox column to header
const thString = '<th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>';
if (!code.includes("select-all")) {
    const newHeader = `<th className="px-6 py-4 text-left w-12">
                  <input 
                    type="checkbox"
                    id="select-all"
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTransactions(filteredPayments.filter(p => p.status === 'Completed' || p.status === 'successful' || p.status === 'success'));
                      } else {
                        setSelectedTransactions([]);
                      }
                    }}
                    checked={filteredPayments.length > 0 && selectedTransactions.length === filteredPayments.filter(p => p.status === 'Completed' || p.status === 'successful' || p.status === 'success').length}
                  />
                </th>
                ${thString}`;
    code = code.replace(thString, newHeader);
}

// 4. Add checkbox to rows
const tdString = '<td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">';
if (!code.includes("onChange={(e) => {")) {
    const newTd = `<td className="px-6 py-4">
                      {(payment.status === 'Completed' || payment.status === 'successful' || payment.status === 'success') ? (
                        <input 
                          type="checkbox"
                          className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          checked={selectedTransactions.some(t => (t.id || t.reference) === (payment.id || payment.reference))}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTransactions([...selectedTransactions, payment]);
                            } else {
                              setSelectedTransactions(selectedTransactions.filter(t => (t.id || t.reference) !== (payment.id || payment.reference)));
                            }
                          }}
                        />
                      ) : (
                        <span className="w-4 h-4 inline-block"></span>
                      )}
                    </td>
                    ${tdString}`;
    // We only want to replace the FIRST occurrence in the tbody map
    // The previous tdString is inside the map, let's do a more robust replace
    
    // Instead of simple replace, let's use a regex to find the right spot
    code = code.replace(/<td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">/g, (match, offset) => {
       // Check if this is the start of the row (right after <tr key...>)
       // Since it's the first td, this should be fine to replace all since there's only one date column
       return `<td className="px-6 py-4">
                      {(payment.status === 'Completed' || payment.status === 'successful' || payment.status === 'success') ? (
                        <input 
                          type="checkbox"
                          className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          checked={selectedTransactions.some(t => (t.id || t.reference) === (payment.id || payment.reference))}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTransactions([...selectedTransactions, payment]);
                            } else {
                              setSelectedTransactions(selectedTransactions.filter(t => (t.id || t.reference) !== (payment.id || payment.reference)));
                            }
                          }}
                        />
                      ) : (
                        <span className="w-4 h-4 inline-block"></span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">`;
    });
}

// 5. Add "Generate Summary Report" button to header
const headerSearch = '<div className="relative w-full md:w-64">';
if (!code.includes("Generate Summary Report")) {
    const newButtons = `<div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {selectedTransactions.length > 0 && (
              <button
                onClick={() => setIsSummaryModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
              >
                <FileText className="w-4 h-4" />
                Generate Summary Report ({selectedTransactions.length})
              </button>
            )}
            <div className="relative w-full md:w-64">`;
    code = code.replace(headerSearch, newButtons);
    
    // Don't forget to close the div we opened!
    code = code.replace('</div>\n        </div>\n        {error &&', '</div>\n          </div>\n        </div>\n        {error &&');
}

// 6. Fix skeleton columns (add one more td)
if (!code.includes('<td className="px-6 py-4"><Skeleton className="h-4 w-4" /></td>')) {
    code = code.replace('<td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>', '<td className="px-6 py-4"><Skeleton className="h-4 w-4" /></td>\n                    <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>');
}

// 7. Add colSpan=7 to empty state
code = code.replace('colSpan={6}', 'colSpan={7}');

// 8. Add modal at the bottom
if (!code.includes("<FeeSummaryReportModal")) {
    code = code.replace(
        "{selectedReceipt && user && (",
        `{isSummaryModalOpen && user && (
        <FeeSummaryReportModal
          payments={selectedTransactions}
          user={user}
          onClose={() => setIsSummaryModalOpen(false)}
        />
      )}
      
      {selectedReceipt && user && (`
    );
}

fs.writeFileSync('src/pages/dashboards/student/FeeReceiptModule.tsx', code);
console.log("Updated FeeReceiptModule");
