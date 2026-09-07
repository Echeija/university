const fs = require('fs');
let code = fs.readFileSync('src/pages/dashboards/lecturer/LecturerResultUpload.tsx', 'utf8');

const targetHeaderRegex = /<th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">S\/N<\/th>\s*<th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Matric No<\/th>\s*<th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Student Name<\/th>/g;

const replacementHeader = `<th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Student</th>`;

const targetBodyRegex = /<td className="px-6 py-4 text-sm font-medium text-slate-500 text-center">\s*\{index \+ 1\}\s*<\/td>\s*<td className="px-6 py-4 font-medium text-slate-700">\s*\{st\.matricNo\}\s*<\/td>\s*<td className="px-6 py-4">\s*<div className="font-bold text-slate-900">\{st\.name\}<\/div>\s*<div className="text-xs text-slate-500">\{st\.department\}<\/div>\s*<\/td>/g;

const replacementBody = `<td className="px-4 sm:px-6 py-4 sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-slate-400 w-5 hidden sm:inline-block">{index + 1}</span>
                            <div>
                              <div className="font-bold text-slate-900 whitespace-normal min-w-[140px] leading-tight">{st.name}</div>
                              <div className="text-xs text-slate-500 mt-0.5">{st.matricNo} • {st.department}</div>
                            </div>
                          </div>
                        </td>`;

// Also fix colSpan=10 to colSpan=8
code = code.replace(/colSpan=\{10\}/g, 'colSpan={8}');

// Also increase touch target of inputs
code = code.replace(/w-20 text-center px-3 py-2/g, 'w-24 text-center px-3 py-2.5 text-base sm:text-sm');

if (targetHeaderRegex.test(code)) {
    code = code.replace(targetHeaderRegex, replacementHeader);
    code = code.replace(targetBodyRegex, replacementBody);
    fs.writeFileSync('src/pages/dashboards/lecturer/LecturerResultUpload.tsx', code);
    console.log('Patched Lecturer table for mobile responsiveness');
} else {
    console.log('Target not found for Lecturer table');
}
