import fs from 'fs';

let content = fs.readFileSync('src/services/transcriptService.ts', 'utf8');

// We need to add `token: string` to the download method or generate method.
content = content.replace(
  /generateOfficialTranscriptPDF: async \(data: OfficialTranscriptData\): Promise<jsPDF> => \{/,
  `generateOfficialTranscriptPDF: async (data: OfficialTranscriptData, token?: string): Promise<jsPDF> => {`
);

// add fetch for verificationCode
const codeLogic = `
    let verificationCode = data.profile.user.matricNo; // fallback
    if (token) {
        try {
            const res = await fetch('/api/student/transcripts/generate', {
                method: 'POST',
                headers: { Authorization: \`Bearer \${token}\` }
            });
            if (res.ok) {
                const resData = await res.json();
                if (resData.verificationCode) verificationCode = resData.verificationCode;
            }
        } catch(e) {
            console.error('Failed to register transcript', e);
        }
    }
    const verificationUrl = \`\${window.location.origin}/verify-transcript/\${verificationCode}\`;
`;

content = content.replace(
  /const verificationUrl = `\$\{window\.location\.origin\}\/verify-transcript\?id=\$\{profile\.user\.matricNo\}`;/,
  codeLogic
);

content = content.replace(
  /downloadOfficialTranscript: async \(data: OfficialTranscriptData, filename\?: string\) => \{/,
  `downloadOfficialTranscript: async (data: OfficialTranscriptData, token?: string, filename?: string) => {`
);

content = content.replace(
  /const doc = await transcriptService\.generateOfficialTranscriptPDF\(data\);/,
  `const doc = await transcriptService.generateOfficialTranscriptPDF(data, token);`
);

fs.writeFileSync('src/services/transcriptService.ts', content);
