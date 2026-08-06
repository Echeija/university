const fs = require('fs');
let code = fs.readFileSync('src/pages/dashboards/student/Payments.tsx', 'utf8');

const divStart = '<div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">';
const invoiceTitle = 'Payment History & Invoices';

let index = code.indexOf(invoiceTitle);
if (index !== -1) {
    // Find the enclosing div
    let startIdx = code.lastIndexOf(divStart, index);
    
    if (startIdx !== -1) {
        // Find the closing div of this block. It's followed by {/* Receipt Modal */}
        let endIdx = code.indexOf('{/* Receipt Modal */}', startIdx);
        
        if (endIdx !== -1) {
            let section = code.substring(startIdx, endIdx);
            
            let newSection = `<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
${section.substring(divStart.length)}
        <div className="lg:col-span-1">
          <FeeAuditLog payments={payments} isLoading={isLoading} />
        </div>
      </div>
      
      `;
            
            code = code.substring(0, startIdx) + newSection + code.substring(endIdx);
            
            if (!code.includes("import FeeAuditLog")) {
                code = code.replace("import FeeHistory", "import FeeHistory from '../../../components/FeeHistory';\nimport FeeAuditLog from '../../../components/FeeAuditLog';\n// import FeeHistory");
            }
            
            fs.writeFileSync('src/pages/dashboards/student/Payments.tsx', code);
            console.log("Updated Payments.tsx successfully using index logic");
        } else {
             console.log("Could not find Receipt Modal comment");
        }
    } else {
         console.log("Could not find start div");
    }
} else {
     console.log("Could not find Payment History & Invoices");
}

