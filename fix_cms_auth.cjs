const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'app.get("/api/cms/content_blocks", requireAuth, async (req, res) => {',
  'app.get("/api/cms/content_blocks", async (req, res) => {'
);
code = code.replace(
  'app.get("/api/cms/content_blocks/:id", requireAuth, async (req, res) => {',
  'app.get("/api/cms/content_blocks/:id", async (req, res) => {'
);
code = code.replace(
  'app.get("/api/cms/news_events", requireAuth, async (req, res) => {',
  'app.get("/api/cms/news_events", async (req, res) => {'
);
code = code.replace(
  'app.get("/api/cms/news_events/:id", requireAuth, async (req, res) => {',
  'app.get("/api/cms/news_events/:id", async (req, res) => {'
);

fs.writeFileSync('server.ts', code);
console.log('Fixed CMS GET endpoints to be public');
