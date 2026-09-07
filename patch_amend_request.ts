import fs from 'fs';
let content = fs.readFileSync('src/pages/dashboards/lecturer/LecturerResultUpload.tsx', 'utf8');

// Imports
content = content.replace(
  /import \{ FileSpreadsheet, Save, Search, AlertCircle, ChevronDown, CheckCircle2, Send, Lock, FileUp, FileDown, ShieldCheck, X \} from 'lucide-react';/,
  `import { FileSpreadsheet, Save, Search, AlertCircle, ChevronDown, CheckCircle2, Send, Lock, FileUp, FileDown, ShieldCheck, X, FileEdit } from 'lucide-react';`
);

// State
content = content.replace(
  /const \[importPreview, setImportPreview\] = useState<PreviewRow\[\] \| null>\(null\);/,
  `const [importPreview, setImportPreview] = useState<PreviewRow[] | null>(null);
  const [amendModalOpen, setAmendModalOpen] = useState(false);
  const [resultToAmend, setResultToAmend] = useState<any>(null);
  const [amendData, setAmendData] = useState({ newCa: '', newExam: '', reason: '' });`
);

// Handlers
const handlersCode = `
  const handleRequestAmendment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resultToAmend) return;
    
    try {
      const res = await fetch(\`/api/results/\${resultToAmend.resultId}/amend/request\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: \`Bearer \${token}\`
        },
        body: JSON.stringify({
          newCa: Number(amendData.newCa),
          newExam: Number(amendData.newExam),
          reason: amendData.reason
        })
      });
      
      if (res.ok) {
        notify({ title: 'Success', message: 'Amendment request submitted to HOD', type: 'success' });
        setAmendModalOpen(false);
        setResultToAmend(null);
      } else {
        const error = await res.json();
        notify({ title: 'Error', message: error.error || 'Failed to request amendment', type: 'error' });
      }
    } catch (e) {
      notify({ title: 'Error', message: 'Network error', type: 'error' });
    }
  };

  const openAmendModal = (student: any) => {
    setResultToAmend(student);
    setAmendData({ newCa: student.caScore?.toString() || '', newExam: student.examScore?.toString() || '', reason: '' });
    setAmendModalOpen(true);
  };
`;

content = content.replace(
  /const handleImport = \(e: React\.ChangeEvent<HTMLInputElement>\) => \{/,
  handlersCode + '\n  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {'
);

// Edit icon in table
content = content.replace(
  /<Lock className="w-3.5 h-3.5" \/>\s*\{st.status.charAt\(0\).toUpperCase\(\) \+ st.status.slice\(1\).replace\('_', ' '\)\}\s*<\/div>/,
  `<Lock className="w-3.5 h-3.5" />
                                {st.status.charAt(0).toUpperCase() + st.status.slice(1).replace('_', ' ')}
                              </div>
                              {st.status === 'published' && (
                                <button 
                                  onClick={() => openAmendModal(st)}
                                  className="ml-2 p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                                  title="Request Amendment"
                                >
                                  <FileEdit className="w-4 h-4" />
                                </button>
                              )}`
);

// The Modal JSX
const modalJSX = `
      {/* Amendment Modal */}
      {amendModalOpen && resultToAmend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Request Amendment</h3>
                <p className="text-sm text-slate-500">Submit a correction for {resultToAmend.name}</p>
              </div>
              <button 
                onClick={() => setAmendModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleRequestAmendment} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">New CA Score (Max {caRules.caMax})</label>
                  <input 
                    type="number" 
                    required 
                    min="0" 
                    max={caRules.caMax}
                    value={amendData.newCa}
                    onChange={(e) => setAmendData({...amendData, newCa: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">New Exam Score (Max {caRules.examMax})</label>
                  <input 
                    type="number" 
                    required 
                    min="0" 
                    max={caRules.examMax}
                    value={amendData.newExam}
                    onChange={(e) => setAmendData({...amendData, newExam: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reason for Amendment</label>
                <textarea 
                  required
                  rows={3}
                  value={amendData.reason}
                  onChange={(e) => setAmendData({...amendData, reason: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  placeholder="Explain why this result needs to be changed..."
                ></textarea>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setAmendModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
`;

content = content.replace(
  /\{\/\* Import Preview Modal \*\/\}/,
  modalJSX + '\n      {/* Import Preview Modal */}'
);

fs.writeFileSync('src/pages/dashboards/lecturer/LecturerResultUpload.tsx', content);
