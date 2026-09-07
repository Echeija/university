const fs = require('fs');
let code = fs.readFileSync('src/pages/dashboards/lecturer/LecturerResultUpload.tsx', 'utf8');

code = code.replace(
  /<div className="flex items-center gap-1\.5 px-2\.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">\s*<Lock className="w-3\.5 h-3\.5" \/>\s*\{st\.status\.charAt\(0\)\.toUpperCase\(\) \+ st\.status\.slice\(1\)\.replace\('_', ' '\)\}\s*<\/div>\s*\{st\.status === 'published' && \(/,
  `<>
                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                                  <Lock className="w-3.5 h-3.5" />
                                  {st.status.charAt(0).toUpperCase() + st.status.slice(1).replace('_', ' ')}
                                </div>
                                {st.status === 'published' && (`
);

code = code.replace(
  /<\/button>\s*\)\}\s*\) : \(/,
  `</button>
                                )}
                              </>
                            ) : (`
);

fs.writeFileSync('src/pages/dashboards/lecturer/LecturerResultUpload.tsx', code);
