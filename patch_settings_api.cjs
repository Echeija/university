const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const apiBlock = `
// System Settings API
app.get('/api/settings/:key', requireAuth, async (req, res) => {
  try {
    const setting = await db.query.systemSettings.findFirst({
      where: eq(schema.systemSettings.key, req.params.key)
    });
    if (setting) {
      res.json(JSON.parse(setting.value));
    } else {
      res.status(404).json({ error: 'Setting not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/settings/:key', requireAuth, requireRole(['Administrator', 'Admin']), async (req, res) => {
  try {
    const existing = await db.query.systemSettings.findFirst({
      where: eq(schema.systemSettings.key, req.params.key)
    });
    
    if (existing) {
      await db.update(schema.systemSettings)
        .set({ value: JSON.stringify(req.body), updatedAt: new Date() })
        .where(eq(schema.systemSettings.key, req.params.key));
    } else {
      await db.insert(schema.systemSettings).values({
        key: req.params.key,
        value: JSON.stringify(req.body)
      });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});
`;

if (!content.includes('/api/settings/:key')) {
  content = content.replace('// Dashboard Analytics', apiBlock + '\n// Dashboard Analytics');
  fs.writeFileSync('server.ts', content);
  console.log('Added settings API');
} else {
  console.log('Settings API already exists');
}
