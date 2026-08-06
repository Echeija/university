const fs = require('fs');
let content = fs.readFileSync('src/pages/dashboards/admin/AdminDashboard.tsx', 'utf8');
const searchString = `                  Manage Clinic
                </Link>
              </div>`;
              
const insertString = `              <div className="flex flex-col gap-3 p-4 border border-slate-100 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <Globe className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">Website CMS</span>
                </div>
                <Link
                  to="/dashboard/cms"
                  className="w-full px-4 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600"
                >
                  Manage Content
                </Link>
              </div>`;

if (content.includes(searchString)) {
  content = content.replace(searchString, searchString + '\n' + insertString);
  fs.writeFileSync('src/pages/dashboards/admin/AdminDashboard.tsx', content);
  console.log('Inserted successfully');
} else {
  console.log('Search string not found');
}
