const fs = require('fs');

let fileContent = fs.readFileSync('src/pages/lms/LmsAssignments.tsx', 'utf8');

// Add Firebase storage imports
fileContent = fileContent.replace(
  "import { useState } from 'react';",
  "import { useState, useRef } from 'react';\nimport { storage } from '../../lib/firebase';\nimport { ref, uploadBytes } from 'firebase/storage';\nimport { Loader2 } from 'lucide-react';"
);

const newLogic = `
  const [activeTab, setActiveTab] = useState('Pending');
  const [isUploading, setIsUploading] = useState<number | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadId, setActiveUploadId] = useState<number | null>(null);
  
  const [assignments, setAssignments] = useState([
`;

fileContent = fileContent.replace(
  "const [activeTab, setActiveTab] = useState('Pending');\n  const [assignments, setAssignments] = useState([",
  newLogic
);

const handleFileChange = `
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || activeUploadId === null) return;
    
    setIsUploading(activeUploadId);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = \`student_\${activeUploadId}_\${Date.now()}.\${fileExt}\`;
      const filePath = \`assignments/submissions/\${fileName}\`;
      
      const storageRef = ref(storage, filePath);
      await uploadBytes(storageRef, file);
      
      setAssignments(assignments.map(a => 
        a.id === activeUploadId ? { ...a, status: 'submitted' } : a
      ));
      
      alert('Assignment submitted successfully via Firebase Storage!');
    } catch (err) {
      console.error(err);
      alert('Failed to upload assignment.');
    } finally {
      setIsUploading(null);
      setActiveUploadId(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (id: number) => {
    setActiveUploadId(id);
    fileInputRef.current?.click();
  };
`;

fileContent = fileContent.replace(
  /const handleSubmit = \(id: number\) => \{[\s\S]*?alert\('Assignment submitted successfully!'\);\s*\};/,
  handleFileChange.trim()
);

// Add invisible file input
const newButton = `
                    <input 
                      type="file" 
                      className="hidden" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                    />
                    {assignment.grade && (
`;

fileContent = fileContent.replace("{assignment.grade && (", newButton.trim());

// Update button for loading state
fileContent = fileContent.replace(
  "<UploadCloud className=\"w-4 h-4\" /> Submit Work",
  "{isUploading === assignment.id ? <Loader2 className=\"w-4 h-4 animate-spin\" /> : <UploadCloud className=\"w-4 h-4\" />} {isUploading === assignment.id ? 'Uploading...' : 'Submit Work'}"
);
fileContent = fileContent.replace(
  "onClick={() => handleSubmit(assignment.id)}",
  "onClick={() => handleSubmit(assignment.id)}\n                        disabled={isUploading !== null}"
);

fs.writeFileSync('src/pages/lms/LmsAssignments.tsx', fileContent);
console.log("Updated LmsAssignments.tsx");
