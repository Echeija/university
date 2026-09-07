const fs = require('fs');

let fileContent = fs.readFileSync('src/pages/dashboards/lms/components/LMSAssignments.tsx', 'utf8');

// Replace imports
fileContent = fileContent.replace(
  "import { supabase } from '../../../../lib/supabase';",
  "import { useAuth } from '../../../../contexts/AuthContext';\nimport { storage } from '../../../../lib/firebase';\nimport { ref, uploadBytes } from 'firebase/storage';"
);

// Add useAuth to component
fileContent = fileContent.replace(
  "const { notify } = useNotification();",
  "const { notify } = useNotification();\n  const { user } = useAuth();"
);

// Replace handleUpload implementation
const newUploadImpl = `
    try {
      // Create a unique file path: assignments/userId_assignmentId_timestamp_filename
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = \`\${user?.id || 'student'}_\${assignmentId}_\${Date.now()}.\${fileExt}\`;
      const filePath = \`assignments/submissions/\${fileName}\`;
      
      const storageRef = ref(storage, filePath);
      await uploadBytes(storageRef, selectedFile);
      
      notify({ title: 'Success', message: 'Assignment submitted successfully to Firebase Storage', type: 'success' });
      
      // Update local state to reflect submission
      setAssignments(prev => prev.map(a => 
         a.id === assignmentId 
           ? { ...a, status: 'submitted' } 
           : a
      ));
      
      setActiveUploadId(null);
      setSelectedFile(null);
    } catch (err: any) {
      console.error('Upload error:', err);
      notify({ 
         title: 'Upload Failed', 
         message: err.message || 'Failed to upload assignment to Firebase storage.', 
         type: 'error' 
       });
    } finally {
`;

fileContent = fileContent.replace(
  /try \{\s*\/\/\s*Create a unique file path[\s\S]*?\} catch \(err: any\) \{[\s\S]*?\} finally \{/,
  newUploadImpl
);

fs.writeFileSync('src/pages/dashboards/lms/components/LMSAssignments.tsx', fileContent);
console.log("Firebase storage update completed");
