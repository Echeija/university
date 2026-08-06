import * as fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf8');

const replacement = `
  app.post("/api/cms/news_events", requireAuth, requireRole(['Administrator', 'Admin', 'ICT Admin', 'Portal']), async (req, res) => {
    try {
      const { cmsNewsEvents } = await import('./src/db/schema');
      const { db } = await import('./src/db');
      
      const insertData = { ...req.body };
      if (insertData.date) insertData.date = new Date(insertData.date);
      if (insertData.publishDate) insertData.publishDate = new Date(insertData.publishDate);
      if (insertData.publish_date) {
        insertData.publishDate = new Date(insertData.publish_date);
        delete insertData.publish_date;
      }
      if (insertData.endDate) insertData.endDate = new Date(insertData.endDate);
      if (insertData.end_date) {
        insertData.endDate = new Date(insertData.end_date);
        delete insertData.end_date;
      }
      
      const [newItem] = await db.insert(cmsNewsEvents).values({
        ...insertData,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      res.json(newItem);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to create news/event' });
    }
  });
`;

content = content.replace(/app\.post\("\/api\/cms\/news_events"[\s\S]*?res\.status\(500\)\.json\(\{ error: 'Failed to create news\/event' \}\);\s*\}\s*\}\);/, replacement.trim());

fs.writeFileSync('server.ts', content);
console.log('Fixed cms_news_events POST endpoint');
