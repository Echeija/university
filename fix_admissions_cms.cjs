const fs = require('fs');
let code = fs.readFileSync('src/pages/AdmissionsPage.tsx', 'utf8');

const importStatement = `import CMSBlockEditor from '../components/cms/CMSBlockEditor';\n`;
if (!code.includes('import CMSBlockEditor')) {
    code = code.replace("import React, { useState } from 'react';", "import React, { useState } from 'react';\n" + importStatement);
}

const oldBlock = `        {/* Application Portal Card */}
        <div className="bg-white p-10 rounded-3xl shadow-xl shadow-emerald-900/5 border border-slate-100 text-center flex flex-col justify-center h-full">
          <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Ready to Apply?</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            All admission applications are handled securely through our new student applicant portal. Create an account to begin your journey with Smart Global College of Technology.
          </p>
          
          <a href="/register-applicant" className="inline-flex w-full justify-center mt-auto py-4 bg-gradient-to-r from-emerald-600 to-purple-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 uppercase tracking-wider text-sm hover:opacity-90 transition-opacity">
            Create Applicant Account
          </a>
          <div className="mt-6 text-sm font-medium text-slate-600">
            Already have an account? <a href="/login" className="text-emerald-600 hover:underline">Log in here</a>
          </div>
          
          <div className="mt-8 pt-8 border-t border-slate-100 text-sm text-slate-500">
            <p>Demo Note: Use <strong className="text-slate-700">applicant@smartglobal.edu.ng</strong> (Password: password123) to access the application dashboard.</p>
          </div>
        </div>`;

const newBlock = `        {/* Application Portal Card */}
        <CMSBlockEditor
          section="Admissions"
          title="Ready to Apply"
          defaultContent="All admission applications are handled securely through our new student applicant portal. Create an account to begin your journey with Smart Global College of Technology."
          renderContent={(displayTitle, displayContent) => (
            <div className="bg-white p-10 rounded-3xl shadow-xl shadow-emerald-900/5 border border-slate-100 text-center flex flex-col justify-center h-full">
              <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">{displayTitle || "Ready to Apply?"}</h2>
              <p className="text-slate-600 mb-8 leading-relaxed">
                {displayContent}
              </p>
              
              <a href="/register-applicant" className="inline-flex w-full justify-center mt-auto py-4 bg-gradient-to-r from-emerald-600 to-purple-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 uppercase tracking-wider text-sm hover:opacity-90 transition-opacity">
                Create Applicant Account
              </a>
              <div className="mt-6 text-sm font-medium text-slate-600">
                Already have an account? <a href="/login" className="text-emerald-600 hover:underline">Log in here</a>
              </div>
              
              <div className="mt-8 pt-8 border-t border-slate-100 text-sm text-slate-500">
                <p>Demo Note: Use <strong className="text-slate-700">applicant@smartglobal.edu.ng</strong> (Password: password123) to access the application dashboard.</p>
              </div>
            </div>
          )}
        />`;

code = code.replace(oldBlock, newBlock);
fs.writeFileSync('src/pages/AdmissionsPage.tsx', code);
console.log("Updated AdmissionsPage with CMSBlockEditor");
