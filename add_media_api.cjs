const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const apiString = `
  app.get("/api/cms/media", requireAuth, (req, res) => {
    try {
      const files = fs.readdirSync(uploadDir);
      const images = files
        .filter(f => f.match(/\\.(jpg|jpeg|png|gif|webp|svg)$/i))
        .map(f => ({ url: \`/uploads/\${f}\`, name: f }));
      res.json(images);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to read media' });
    }
  });
`;

code = code.replace(
  '  app.post("/api/upload", requireAuth, upload.single(\'document\'), (req, res) => {',
  apiString + '\n  app.post("/api/upload", requireAuth, upload.single(\'document\'), (req, res) => {'
);

fs.writeFileSync('server.ts', code);
console.log('Added media endpoint');
