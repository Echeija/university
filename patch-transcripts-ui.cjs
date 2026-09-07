const fs = require('fs');
let code = fs.readFileSync('src/pages/dashboards/admin/Transcripts.tsx', 'utf8');

const importTarget = `import { Search, Printer, FileText, Download, Building } from 'lucide-react';`;
const importReplacement = `import { Search, Printer, FileText, Download, Building, ShieldCheck } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';`;
if (code.includes(importTarget)) code = code.replace(importTarget, importReplacement);

const fetchTarget = `      const res = await fetch(\`/api/admin/transcripts/student?matricNumber=\${encodeURIComponent(matricNumber)}\`, {
        headers: { Authorization: \`Bearer \${token}\` }
      });`;
const fetchReplacement = `      const res = await fetch('/api/admin/transcripts/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: \`Bearer \${token}\`
        },
        body: JSON.stringify({ matricNumber })
      });`;
if (code.includes(fetchTarget)) code = code.replace(fetchTarget, fetchReplacement);

const metaTarget = `                  <h2 className="text-xl font-semibold uppercase tracking-wide text-slate-700">Official Academic Transcript</h2>
                </div>`;
const metaReplacement = `                  <h2 className="text-xl font-semibold uppercase tracking-wide text-slate-700 mb-2">Official Academic Transcript</h2>
                  <div className="flex items-center justify-center gap-2 text-sm text-slate-500 font-medium font-mono">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>TR NO: {transcriptData.metadata?.transcriptNumber}</span>
                  </div>
                </div>`;
if (code.includes(metaTarget)) code = code.replace(metaTarget, metaReplacement);

const finalMetaTarget = `                  <div className="text-center w-48">
                    <div className="border-t border-slate-800 pt-2 font-bold text-sm">Date</div>
                  </div>
                </div>`;
const finalMetaReplacement = `                  <div className="text-center w-48">
                    <div className="border-t border-slate-800 pt-2 font-bold text-sm">Date</div>
                  </div>
                </div>
                
                {transcriptData.metadata?.verificationCode && (
                  <div className="mt-12 pt-6 border-t border-slate-300 flex items-center justify-between text-xs text-slate-500 break-inside-avoid">
                    <div className="flex items-center gap-4">
                      <QRCodeSVG value={\`\${window.location.origin}/verify-transcript/\${transcriptData.metadata.verificationCode}\`} size={64} level="M" />
                      <div>
                        <p className="font-bold text-slate-700 mb-1">Verify this Transcript</p>
                        <p>Scan the QR code or visit:</p>
                        <p className="font-mono text-emerald-700 break-all max-w-[300px]">
                            {window.location.origin}/verify-transcript/{transcriptData.metadata.verificationCode}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                        <p>Generated At: {new Date(transcriptData.metadata.generatedAt).toLocaleString()}</p>
                        <p>TR No: {transcriptData.metadata.transcriptNumber}</p>
                    </div>
                  </div>
                )}`;
if (code.includes(finalMetaTarget)) code = code.replace(finalMetaTarget, finalMetaReplacement);

fs.writeFileSync('src/pages/dashboards/admin/Transcripts.tsx', code);
console.log('Successfully patched Transcripts.tsx');
