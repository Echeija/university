import fs from 'fs';

let content = fs.readFileSync('src/pages/dashboards/student/AcademicResults.tsx', 'utf8');

content = content.replace(
  /const generatePDFTranscript = \(\) => \{/,
  `const generatePDFTranscript = async () => {`
);
content = content.replace(
  /transcriptService\.downloadOfficialTranscript\(\{ profile, transcriptData \}\);/,
  `await transcriptService.downloadOfficialTranscript({ profile, transcriptData });`
);

fs.writeFileSync('src/pages/dashboards/student/AcademicResults.tsx', content);
