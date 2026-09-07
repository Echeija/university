import fs from 'fs';

let content = fs.readFileSync('src/services/transcriptService.ts', 'utf8');

content = content.replace(
  /export const transcriptService = \{/,
  `import QRCode from 'qrcode';

export const transcriptService = {`
);

content = content.replace(
  /generateOfficialTranscriptPDF: \(data: OfficialTranscriptData\): jsPDF => \{/,
  `generateOfficialTranscriptPDF: async (data: OfficialTranscriptData): Promise<jsPDF> => {`
);

// Add QR Code logic
const qrLogic = `
    const verificationUrl = \`\${window.location.origin}/verify-transcript?id=\${profile.user.matricNo}\`;
    try {
      const qrDataUrl = await QRCode.toDataURL(verificationUrl, { margin: 1, width: 80 });
      doc.addImage(qrDataUrl, 'PNG', 14, 250, 25, 25);
      doc.setFontSize(8);
      doc.text('Scan to Verify', 26.5, 278, { align: 'center' });
    } catch (e) {
      console.error('Failed to generate QR code', e);
    }

    doc.text('This is an electronically generated official transcript.', pageWidth / 2, 280, { align: 'center' });
`;

content = content.replace(
  /doc\.text\('This is an electronically generated official transcript.', pageWidth \/ 2, 280, \{ align: 'center' \}\);/,
  qrLogic
);

content = content.replace(
  /downloadOfficialTranscript: \(data: OfficialTranscriptData, filename\?: string\) => \{/,
  `downloadOfficialTranscript: async (data: OfficialTranscriptData, filename?: string) => {`
);

content = content.replace(
  /const doc = transcriptService\.generateOfficialTranscriptPDF\(data\);/,
  `const doc = await transcriptService.generateOfficialTranscriptPDF(data);`
);

fs.writeFileSync('src/services/transcriptService.ts', content);
