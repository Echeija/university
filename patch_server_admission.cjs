const fs = require('fs');
let serverCode = fs.readFileSync('server.ts', 'utf8');

const apiCode = `
// --- Admission Letter Template API ---
const templatePath = path.join(process.cwd(), 'admission_template.json');
app.get('/api/registrar/admission-template', authenticateToken, (req, res) => {
  if (req.user.role !== 'Registrar') return res.status(403).json({ error: 'Forbidden' });
  try {
    if (fs.existsSync(templatePath)) {
      const data = fs.readFileSync(templatePath, 'utf8');
      res.json(JSON.parse(data));
    } else {
      res.json({ content: 'We are pleased to inform you that you have been offered provisional admission to the University of Excellence to pursue a degree in **[PROGRAM]**.\\n\\nThis offer is subject to the verification of your qualifications and payment of the required acceptance fees. Please log in to your portal to complete the necessary registration processes.\\n\\nCongratulations on your admission, and we look forward to welcoming you to our campus.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to read template' });
  }
});

app.post('/api/registrar/admission-template', authenticateToken, (req, res) => {
  if (req.user.role !== 'Registrar') return res.status(403).json({ error: 'Forbidden' });
  try {
    const { content } = req.body;
    fs.writeFileSync(templatePath, JSON.stringify({ content }));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save template' });
  }
});
// ------------------------------------
`;

if (!serverCode.includes('/api/registrar/admission-template')) {
  serverCode = serverCode.replace('// --- Start of Express App ---', '// --- Start of Express App ---\n' + apiCode);
  fs.writeFileSync('server.ts', serverCode);
  console.log('Patched server.ts');
} else {
  console.log('Already patched');
}
