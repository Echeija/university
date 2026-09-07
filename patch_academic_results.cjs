const fs = require('fs');
let content = fs.readFileSync('src/pages/dashboards/student/AcademicResults.tsx', 'utf8');

const oldTableHead = `<thead className="bg-white text-slate-500 text-xs uppercase tracking-wider font-bold border-b border-slate-100">
                          <tr>
                            <th className="px-6 py-4">Course Code</th>
                            <th className="px-6 py-4">Course Title</th>
                            <th className="px-4 py-4 text-center">CU</th>
                            <th className="px-4 py-4 text-center">Total Score</th>
                            <th className="px-4 py-4 text-center">Grade</th>
                          </tr>
                        </thead>`;

const newTableHead = `<thead className="bg-white text-slate-500 text-xs uppercase tracking-wider font-bold border-b border-slate-100">
                          <tr>
                            <th className="px-6 py-4">Course Code</th>
                            <th className="px-6 py-4">Course Title</th>
                            <th className="px-4 py-4 text-center" title="Credit Units">Units (CU)</th>
                            <th className="px-4 py-4 text-center">Score</th>
                            <th className="px-4 py-4 text-center">Grade</th>
                            <th className="px-4 py-4 text-center" title="Grade Point">GP</th>
                            <th className="px-4 py-4 text-center" title="Quality Point (CU × GP)">QP</th>
                          </tr>
                        </thead>`;

content = content.replace(oldTableHead, newTableHead);

const oldTableRow = `<td className="px-4 py-4 text-center font-medium text-slate-700">{r.score}</td>
                            <td className="px-4 py-4 text-center">
                              <span className={\`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm \${
                                ['A','B','C'].includes(r.grade) ? 'bg-emerald-100 text-emerald-700' :
                                ['D','E'].includes(r.grade) ? 'bg-amber-100 text-amber-700' :
                                'bg-rose-100 text-rose-700'
                              }\`}>
                                {r.grade}
                              </span>
                            </td>`;

const newTableRow = `<td className="px-4 py-4 text-center font-medium text-slate-700">{r.score}</td>
                            <td className="px-4 py-4 text-center">
                              <span className={\`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm \${
                                ['A','B','C'].includes(r.grade) ? 'bg-emerald-100 text-emerald-700' :
                                ['D','E'].includes(r.grade) ? 'bg-amber-100 text-amber-700' :
                                'bg-rose-100 text-rose-700'
                              }\`}>
                                {r.grade}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-center font-bold text-slate-600">{r.gradePoint?.toFixed(2) || '0.00'}</td>
                            <td className="px-4 py-4 text-center font-black text-indigo-700">{r.qualityPoint?.toFixed(2) || '0.00'}</td>`;

content = content.replace(oldTableRow, newTableRow);

const oldHeaderRight = `<div className="text-right">
                          <span className="text-xs font-bold uppercase text-slate-400 mr-2">Semester GPA</span>
                          <span className="bg-slate-200 text-slate-800 font-black px-3 py-1 rounded-lg">
                            {semesterStats.gpa.toFixed(2)}
                          </span>
                        </div>`;

const newHeaderRight = `<div className="text-right flex items-center gap-4">
                          <div className="hidden md:block text-xs font-medium text-slate-500">
                            Total Units = {semesterStats.totalCreditUnits} <br/>
                            Total QP = {semesterStats.totalQualityPoints}
                          </div>
                          <div>
                            <span className="text-xs font-bold uppercase text-slate-400 mr-2" title={\`\${semesterStats.totalQualityPoints} / \${semesterStats.totalCreditUnits}\`}>GPA</span>
                            <span className="bg-emerald-100 text-emerald-800 font-black px-3 py-1.5 rounded-lg border border-emerald-200">
                              {semesterStats.gpa.toFixed(2)}
                            </span>
                          </div>
                        </div>`;

content = content.replace(oldHeaderRight, newHeaderRight);

fs.writeFileSync('src/pages/dashboards/student/AcademicResults.tsx', content);
console.log('Patched AcademicResults.tsx');
