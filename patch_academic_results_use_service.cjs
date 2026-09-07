const fs = require('fs');
let content = fs.readFileSync('src/pages/dashboards/student/AcademicResults.tsx', 'utf8');

if (!content.includes('import { transcriptService } from')) {
    content = content.replace("import jsPDF from 'jspdf';", "import { transcriptService } from '../../../services/transcriptService';\nimport jsPDF from 'jspdf';");
}

const oldFuncStart = content.indexOf('const generatePDFTranscript = () => {');
if (oldFuncStart !== -1) {
    const endFunc = content.indexOf('};', content.indexOf('doc.save(', oldFuncStart)) + 2;
    const oldBlock = content.substring(oldFuncStart, endFunc);
    
    const newBlock = `const generatePDFTranscript = () => {
    if (!profile || !transcriptData) return;
    transcriptService.downloadOfficialTranscript({ profile, transcriptData });
  };`;
    
    content = content.replace(oldBlock, newBlock);
}

fs.writeFileSync('src/pages/dashboards/student/AcademicResults.tsx', content);
console.log('patched AcademicResults PDF logic');
