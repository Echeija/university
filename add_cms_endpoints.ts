import * as fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf8');

const endpoints = `
  // --- CMS Endpoints ---
  app.get("/api/cms/content_blocks", requireAuth, async (req, res) => {
    try {
      const section = req.query.section as string;
      const { contentBlocks } = await import('./src/db/schema');
      const { db } = await import('./src/db');
      const { eq, desc } = await import('drizzle-orm');
      let query = db.select().from(contentBlocks).orderBy(desc(contentBlocks.createdAt));
      if (section) {
        query = db.select().from(contentBlocks).where(eq(contentBlocks.section, section)).orderBy(desc(contentBlocks.createdAt)) as any;
      }
      const data = await query;
      res.json(data);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch content blocks' });
    }
  });

  app.get("/api/cms/content_blocks/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { contentBlocks } = await import('./src/db/schema');
      const { db } = await import('./src/db');
      const { eq } = await import('drizzle-orm');
      const [block] = await db.select().from(contentBlocks).where(eq(contentBlocks.id, parseInt(id)));
      if (!block) return res.status(404).json({ error: 'Not found' });
      res.json(block);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch content block' });
    }
  });

  app.post("/api/cms/content_blocks", requireAuth, requireRole(['Administrator', 'Admin', 'ICT Admin', 'Portal']), async (req, res) => {
    try {
      const { contentBlocks } = await import('./src/db/schema');
      const { db } = await import('./src/db');
      const [newBlock] = await db.insert(contentBlocks).values({
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      res.json(newBlock);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to create content block' });
    }
  });

  app.put("/api/cms/content_blocks/:id", requireAuth, requireRole(['Administrator', 'Admin', 'ICT Admin', 'Portal']), async (req, res) => {
    try {
      const { id } = req.params;
      const { contentBlocks } = await import('./src/db/schema');
      const { db } = await import('./src/db');
      const { eq } = await import('drizzle-orm');
      const [updated] = await db.update(contentBlocks)
        .set({ ...req.body, updatedAt: new Date() })
        .where(eq(contentBlocks.id, parseInt(id)))
        .returning();
      res.json(updated);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to update content block' });
    }
  });

  app.delete("/api/cms/content_blocks/:id", requireAuth, requireRole(['Administrator', 'Admin', 'ICT Admin', 'Portal']), async (req, res) => {
    try {
      const { id } = req.params;
      const { contentBlocks } = await import('./src/db/schema');
      const { db } = await import('./src/db');
      const { eq } = await import('drizzle-orm');
      await db.delete(contentBlocks).where(eq(contentBlocks.id, parseInt(id)));
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to delete content block' });
    }
  });

  app.get("/api/cms/news_events", requireAuth, async (req, res) => {
    try {
      const type = req.query.type as string;
      const includeFuture = req.query.includeFuture === 'true';
      const { cmsNewsEvents } = await import('./src/db/schema');
      const { db } = await import('./src/db');
      const { eq, desc, and, or, isNull, lte } = await import('drizzle-orm');
      
      let conditions = [];
      if (type) conditions.push(eq(cmsNewsEvents.type, type));
      if (!includeFuture) {
        conditions.push(or(isNull(cmsNewsEvents.publishDate), lte(cmsNewsEvents.publishDate, new Date())));
      }
      
      let query = db.select().from(cmsNewsEvents).orderBy(desc(cmsNewsEvents.date));
      if (conditions.length > 0) {
        query = db.select().from(cmsNewsEvents).where(and(...conditions)).orderBy(desc(cmsNewsEvents.date)) as any;
      }
      
      const data = await query;
      res.json(data);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch news/events' });
    }
  });

  app.get("/api/cms/news_events/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { cmsNewsEvents } = await import('./src/db/schema');
      const { db } = await import('./src/db');
      const { eq } = await import('drizzle-orm');
      const [item] = await db.select().from(cmsNewsEvents).where(eq(cmsNewsEvents.id, parseInt(id)));
      if (!item) return res.status(404).json({ error: 'Not found' });
      res.json(item);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch news/event' });
    }
  });

  app.post("/api/cms/news_events", requireAuth, requireRole(['Administrator', 'Admin', 'ICT Admin', 'Portal']), async (req, res) => {
    try {
      const { cmsNewsEvents } = await import('./src/db/schema');
      const { db } = await import('./src/db');
      const [newItem] = await db.insert(cmsNewsEvents).values({
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      res.json(newItem);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to create news/event' });
    }
  });

  app.put("/api/cms/news_events/:id", requireAuth, requireRole(['Administrator', 'Admin', 'ICT Admin', 'Portal']), async (req, res) => {
    try {
      const { id } = req.params;
      const { cmsNewsEvents } = await import('./src/db/schema');
      const { db } = await import('./src/db');
      const { eq } = await import('drizzle-orm');
      
      // Fix dates mapping
      const updateData = { ...req.body };
      if (updateData.date) updateData.date = new Date(updateData.date);
      if (updateData.publishDate) updateData.publishDate = new Date(updateData.publishDate);
      if (updateData.publish_date) {
        updateData.publishDate = new Date(updateData.publish_date);
        delete updateData.publish_date;
      }
      
      const [updated] = await db.update(cmsNewsEvents)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(cmsNewsEvents.id, parseInt(id)))
        .returning();
      res.json(updated);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to update news/event' });
    }
  });

  app.delete("/api/cms/news_events/:id", requireAuth, requireRole(['Administrator', 'Admin', 'ICT Admin', 'Portal']), async (req, res) => {
    try {
      const { id } = req.params;
      const { cmsNewsEvents } = await import('./src/db/schema');
      const { db } = await import('./src/db');
      const { eq } = await import('drizzle-orm');
      await db.delete(cmsNewsEvents).where(eq(cmsNewsEvents.id, parseInt(id)));
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to delete news/event' });
    }
  });

  app.get("/api/cms/activity", requireAuth, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const { contentBlocks, cmsNewsEvents } = await import('./src/db/schema');
      const { db } = await import('./src/db');
      const { desc } = await import('drizzle-orm');
      
      const blocks = await db.select().from(contentBlocks).orderBy(desc(contentBlocks.createdAt)).limit(limit);
      const news = await db.select().from(cmsNewsEvents).orderBy(desc(cmsNewsEvents.createdAt)).limit(limit);
      
      const mappedBlocks = blocks.map(b => ({
        id: \`block-\${b.id}\`,
        originalId: b.id,
        title: b.title,
        type: \`Content Block (\${b.section})\`,
        status: b.status,
        date: b.createdAt,
        action: 'Updated'
      }));
      
      const mappedNews = news.map(n => ({
        id: \`news-\${n.id}\`,
        originalId: n.id,
        title: n.title,
        type: n.type === 'news' ? 'News Article' : 'Event',
        status: n.status,
        date: n.createdAt,
        action: 'Updated'
      }));
      
      const all = [...mappedBlocks, ...mappedNews].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      res.json(all.slice(0, limit));
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch activity log' });
    }
  });
`;

// Insert the endpoints right before app.listen
content = content.replace(/(\n\s*if \(process\.env\.NODE_ENV !== "production"\) \{)/, endpoints + '$1');

fs.writeFileSync('server.ts', content);
console.log('Added CMS endpoints to server.ts');
