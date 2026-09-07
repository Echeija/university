const fs = require('fs');
let code = fs.readFileSync('src/pages/dashboards/lecturer/LecturerContinuousAssessment.tsx', 'utf8');

// Ensure overflow-x-auto is wrapping the table
// It seems it already might be, let's check
const targetWrapperRegex = /<div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">\s*<table/g;
if (targetWrapperRegex.test(code)) {
    code = code.replace(targetWrapperRegex, `<div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">\n          <div className="overflow-x-auto">\n            <table`);
    
    // Also we need to close the div. Let's find </table>
    code = code.replace(/<\/table>\s*<\/div>\s*<\/div>\s*<\/div>/g, '</table>\n          </div>\n        </div>\n      </div>\n    </div>'); // A bit risky without knowing exact structure, let's just use string replacement on </table>
    code = code.replace(/<\/table>/g, '</table>\n          </div>');
}

// Update header to sticky
code = code.replace(/<th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Student<\/th>/g, 
    '<th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider sticky left-0 bg-slate-50 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Student</th>');

// Update body to sticky
const bodyRegex = /<td className="px-6 py-4">\s*<div className="font-bold text-slate-900">\{st\.name\}<\/div>\s*<div className="text-xs text-slate-500">\{st\.matricNo\} • \{st\.department\}<\/div>\s*<\/td>/g;
const newBody = `<td className="px-4 sm:px-6 py-4 sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                          <div className="font-bold text-slate-900 whitespace-normal min-w-[140px] leading-tight">{st.name}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{st.matricNo} • {st.department}</div>
                        </td>`;
code = code.replace(bodyRegex, newBody);

// Update inputs
code = code.replace(/w-20 text-center px-3 py-2/g, 'w-24 text-center px-3 py-2.5 text-base sm:text-sm');

// In CA, we might also have <table className="w-full text-left border-collapse whitespace-nowrap"> instead of just border-collapse
code = code.replace(/<table className="w-full text-left border-collapse">/g, '<table className="w-full text-left border-collapse whitespace-nowrap">');

fs.writeFileSync('src/pages/dashboards/lecturer/LecturerContinuousAssessment.tsx', code);
console.log('Patched CA table for mobile responsiveness');
