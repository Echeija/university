const fs = require('fs');

let fileContent = fs.readFileSync('src/pages/dashboards/student/StudentAssignments.tsx', 'utf8');

const oldSubmitStart = 'const submitAssignment = async (e: React.FormEvent) => {';
const submitEndRegex = /const submitAssignment = async \(e: React\.FormEvent\) => \{[\s\S]*?setIsLoadingContent\(false\);\s*\}\s*\n\s*\};/;

const oldRegex = /const submitAssignment = async \(e: React\.FormEvent\) => \{[\s\S]*?fetchMySubmissions\(\);\s*\}\s*catch\s*\(e\)\s*\{\s*console\.error\(e\);\s*\}\s*finally\s*\{\s*setIsLoadingContent\(false\);\s*\}\s*\};/

// Wait, the original submit assignment is:
/*
  const submitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingAssignment || !fileUrl || !fileName) return;

    try {
      const res = await fetch(`/api/assignments/${submittingAssignment.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ fileUrl, fileName })
      });
      
      if (res.ok) {
        notify({ title: 'Success', message: 'Assignment submitted successfully', type: 'success' });
        setSubmittingAssignment(null);
        setFileUrl('');
        setFileName('');
        fetchMySubmissions();
      } else {
        notify({ title: 'Error', message: 'Failed to submit assignment', type: 'error' });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingContent(false);
    }
  };
*/

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
        notify({ title: 'Error', message: data.error || 'Failed to submit assignment', type: 'error' });
      }
    } catch (e: any) {
      console.error(e);
      notify({ title: 'Upload Failed', message: e.message || 'Failed to upload to Firebase storage.', type: 'error' });
    } finally {
      setIsUploading(false);
      setIsLoadingContent(false);
    }
  };
`;

let startIndex = fileContent.indexOf(oldSubmitStart);
if (startIndex !== -1) {
  let endIndex = fileContent.indexOf('};', startIndex) + 2;
  // Make sure we find the end of the submitAssignment function
  // Actually, we can just replace the block between submitAssignment and the next function/variable declaration.
  
  fileContent = fileContent.substring(0, startIndex) + newSubmit.trim() + '\n\n' + fileContent.substring(fileContent.indexOf('return (', startIndex));
}

fs.writeFileSync('src/pages/dashboards/student/StudentAssignments.tsx', fileContent);
console.log("Submit assignment updated!");
