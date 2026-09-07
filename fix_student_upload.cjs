const fs = require('fs');

let fileContent = fs.readFileSync('src/pages/dashboards/student/StudentAssignments.tsx', 'utf8');

// Add Firebase storage imports
fileContent = fileContent.replace(
  "import { useAuth } from '../../../contexts/AuthContext';",
  "import { useAuth } from '../../../contexts/AuthContext';\nimport { storage } from '../../../lib/firebase';\nimport { ref, uploadBytes, getDownloadURL } from 'firebase/storage';"
);

// Add loading state
fileContent = fileContent.replace(
  "const [fileUrl, setFileUrl] = useState('');",
  "const [fileUrl, setFileUrl] = useState('');\n  const [selectedFile, setSelectedFile] = useState<File | null>(null);\n  const [isUploading, setIsUploading] = useState(false);"
);

// Rewrite submitAssignment
const newSubmit = `
  const submitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingAssignment || !selectedFile) return;

    try {
      setIsUploading(true);
      
      const fileExt = selectedFile.name.split('.').pop();
      const finalFileName = fileName || selectedFile.name;
      const filePath = \`assignments/\${user?.id || 'unknown'}/\${submittingAssignment.id}_\${Date.now()}.\${fileExt}\`;
      const storageRef = ref(storage, filePath);
      
      await uploadBytes(storageRef, selectedFile);
      const downloadUrl = await getDownloadURL(storageRef);

      const res = await fetch(\`/api/assignments/\${submittingAssignment.id}/submit\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: \`Bearer \${token}\`
        },
        body: JSON.stringify({ fileUrl: downloadUrl, fileName: finalFileName })
      });
      
      if (res.ok) {
        notify({ title: 'Success', message: 'Assignment submitted successfully via Firebase Storage', type: 'success' });
        setSubmittingAssignment(null);
        setSelectedFile(null);
        setFileName('');
        fetchMySubmissions();
      } else {
        const data = await res.json();
        notify({ title: 'Error', message: data.error || 'Failed to submit', type: 'error' });
      }
    } catch (e: any) {
      console.error(e);
      notify({ title: 'Upload Failed', message: e.message || 'Failed to upload to Firebase storage.', type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };
`;

fileContent = fileContent.replace(
  /const submitAssignment = async \(e: React\.FormEvent\) => \{[\s\S]*?setIsLoadingContent\(false\);\s*\}\s*\n\s*\};/,
  newSubmit.trim()
);

// Update form
const oldForm = `
                <form onSubmit={submitAssignment} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Document File Name</label>
                    <input required type="text" value={fileName} onChange={e => setFileName(e.target.value)} placeholder="e.g. Essay_Final.pdf" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Document URL (Drive/Cloud)</label>
                    <input required type="url" value={fileUrl} onChange={e => setFileUrl(e.target.value)} placeholder="https://..." className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
`;

const newForm = `
                <form onSubmit={submitAssignment} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Upload Assignment File</label>
                    <input 
                      required 
                      type="file" 
                      onChange={e => {
                        const file = e.target.files?.[0] || null;
                        setSelectedFile(file);
                        if (file && !fileName) setFileName(file.name);
                      }}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Document File Name (Optional)</label>
                    <input type="text" value={fileName} onChange={e => setFileName(e.target.value)} placeholder="e.g. Essay_Final.pdf" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
`;

fileContent = fileContent.replace(oldForm.trim(), newForm.trim());

fileContent = fileContent.replace(
  "disabled={!fileName || !fileUrl}",
  "disabled={!selectedFile || isUploading}"
);

fileContent = fileContent.replace(
  ">Submit Work</button>",
  ">{isUploading ? 'Uploading...' : 'Submit Work'}</button>"
);

fs.writeFileSync('src/pages/dashboards/student/StudentAssignments.tsx', fileContent);
console.log("Updated StudentAssignments.tsx");
