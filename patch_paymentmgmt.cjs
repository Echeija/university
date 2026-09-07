const fs = require('fs');

let file = fs.readFileSync('src/pages/dashboards/bursary/PaymentManagement.tsx', 'utf8');

const oldHeader = `<th className="px-6 py-4">Date</th>
              </tr>`;
const newHeader = `<th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-center">Receipt</th>
              </tr>`;

const oldCell = `<td className="px-6 py-4 text-sm text-slate-500 font-medium">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                  </tr>`;
const newCell = `<td className="px-6 py-4 text-sm text-slate-500 font-medium">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {(payment.status === 'completed' || payment.status === 'successful') && (
                        <a href={\`/uploads/receipts/\${payment.reference}.pdf\`} target="_blank" download={\`Receipt_\${payment.reference}.pdf\`} className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg font-bold hover:bg-emerald-100 transition-colors inline-block">
                          Download
                        </a>
                      )}
                    </td>
                  </tr>`;

if (file.includes(oldHeader) && file.includes(oldCell)) {
  file = file.replace(oldHeader, newHeader).replace(oldCell, newCell);
  fs.writeFileSync('src/pages/dashboards/bursary/PaymentManagement.tsx', file);
  console.log('PaymentManagement.tsx patched.');
} else {
  console.log('Targets not found in PaymentManagement.');
}
