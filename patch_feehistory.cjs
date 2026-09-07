const fs = require('fs');

let file = fs.readFileSync('src/components/FeeHistory.tsx', 'utf8');

const oldButton = `<button onClick={() => onViewReceipt && onViewReceipt(payment)} className="text-sm text-emerald-600 font-medium hover:text-emerald-700">Receipt</button>`;
const newButtons = `<div className="flex items-center gap-3 justify-end">
  <button onClick={() => onViewReceipt && onViewReceipt(payment)} className="text-sm text-emerald-600 font-medium hover:text-emerald-700">View</button>
  <a href={\`/uploads/receipts/\${payment.reference}.pdf\`} target="_blank" download={\`Receipt_\${payment.reference}.pdf\`} className="text-sm bg-emerald-50 text-emerald-700 px-3 py-1 rounded hover:bg-emerald-100 transition-colors">Download PDF</a>
</div>`;

if (file.includes(oldButton)) {
  file = file.replace(oldButton, newButtons);
  fs.writeFileSync('src/components/FeeHistory.tsx', file);
  console.log('FeeHistory.tsx patched.');
} else {
  console.log('Old button not found in FeeHistory.');
}
