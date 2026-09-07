const fs = require('fs');
let content = fs.readFileSync('src/pages/dashboards/student/AcademicResults.tsx', 'utf8');

const oldGrid = `<div className="px-8 py-5 grid grid-cols-2 md:grid-cols-4 gap-4 bg-white">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Credits</p>
                <p className="text-lg font-bold text-slate-700">{profile?.totalCreditUnits || 0}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Quality Points</p>
                <p className="text-lg font-bold text-slate-700">{profile?.totalQualityPoints?.toFixed(1) || 0}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Program</p>
                <p className="text-sm font-bold text-slate-700 mt-1">{profile?.user.department} - {profile?.user.faculty}</p>
              </div>
            </div>`;

const newGrid = `<div className="px-8 py-5 grid grid-cols-1 md:grid-cols-3 gap-6 bg-white border-b border-slate-100">
              <div className="md:col-span-2 bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col justify-center">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-3">Official CGPA Calculation</p>
                <div className="flex items-center gap-4 text-sm font-medium text-slate-700">
                  <div className="text-center bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
                    <span className="block border-b-2 border-slate-200 px-2 pb-1" title="Total Quality Points (Across All Semesters)">{profile?.totalQualityPoints?.toFixed(2) || '0.00'} QP</span>
                    <span className="block px-2 pt-1" title="Total Credit Units (Across All Semesters)">{profile?.totalCreditUnits || 0} Units</span>
                  </div>
                  <span className="text-slate-400 font-black text-xl">=</span>
                  <span className="font-black text-2xl text-emerald-700">{profile?.cgpa ? profile.cgpa.toFixed(2) : '0.00'}</span>
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Program</p>
                <p className="text-sm font-bold text-slate-700 mt-1">{profile?.user.department}</p>
                <p className="text-sm text-slate-500">{profile?.user.faculty}</p>
              </div>
            </div>`;

content = content.replace(oldGrid, newGrid);

fs.writeFileSync('src/pages/dashboards/student/AcademicResults.tsx', content);
console.log('Patched AcademicResults.tsx for CGPA');
