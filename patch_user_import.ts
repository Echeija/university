import fs from 'fs';

let content = fs.readFileSync('src/pages/dashboards/admin/UserManagement.tsx', 'utf8');

// Ensure XLSX is imported
content = `import * as XLSX from 'xlsx';\n` + content;
content = content.replace(
    /import \{ Users, Search, Filter, MoreVertical, Shield, GraduationCap, Edit, Trash2, X \} from 'lucide-react';/,
    `import { Users, Search, Filter, MoreVertical, Shield, GraduationCap, Edit, Trash2, X, Upload } from 'lucide-react';\nimport { useRef } from 'react';`
);

const importCode = `
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        if (data.length === 0) {
          notify({ title: 'Import Failed', message: 'The Excel file is empty', type: 'error' });
          return;
        }

        setIsLoading(true);
        let successCount = 0;
        let failCount = 0;

        for (const row of data as any[]) {
          const userPayload = {
            name: row.Name || row.name,
            email: row.Email || row.email,
            role: row.Role || row.role || 'Student',
            password: row.Password || row.password || 'password123'
          };
          
          if (!userPayload.name || !userPayload.email) {
            failCount++;
            continue;
          }

          try {
            const res = await fetch('/api/admin/users', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                Authorization: \`Bearer \${token}\`
              },
              body: JSON.stringify(userPayload)
            });
            if (res.ok) successCount++;
            else failCount++;
          } catch(e) {
            failCount++;
          }
        }
        
        notify({ title: 'Import Complete', message: \`Successfully imported \${successCount} users. Failed: \${failCount}\`, type: successCount > 0 ? 'success' : 'error' });
        fetchUsers();
      } catch (err) {
        notify({ title: 'Import Failed', message: 'Failed to read Excel file', type: 'error' });
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
`;

content = content.replace(
  /const fetchUsers = \(\) => \{/,
  importCode + '\n  const fetchUsers = () => {'
);

// Add Import button next to Add button
content = content.replace(
  /<button \s*onClick=\{openAddModal\}\s*className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-lg shadow-emerald-200 flex items-center gap-2"\s*>/,
  `<input type="file" accept=".xlsx, .xls" ref={fileInputRef} className="hidden" onChange={handleImportExcel} />
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-6 py-3 rounded-xl font-bold transition-colors shadow-sm flex items-center gap-2"
        >
          <Upload className="w-5 h-5" />
          <span>Import Excel</span>
        </button>
        <button 
          onClick={openAddModal}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-lg shadow-emerald-200 flex items-center gap-2"
        >`
);

// Group the buttons nicely in a div
content = content.replace(
  /<div>\s*<h2 className="text-3xl font-black text-slate-900 tracking-tight">User Management<\/h2>\s*<p className="text-slate-500 mt-1">Manage staff, students, and applicants across the system.<\/p>\s*<\/div>/,
  `<div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">User Management</h2>
          <p className="text-slate-500 mt-1">Manage staff, students, and applicants across the system.</p>
        </div>
        <div className="flex gap-3">`
);

content = content.replace(
  /<span>Add User<\/span>\s*<\/button>/,
  `<span>Add User</span>
        </button>
        </div>`
);

fs.writeFileSync('src/pages/dashboards/admin/UserManagement.tsx', content);
