const fs = require('fs');
let serverCode = fs.readFileSync('server.ts', 'utf8');

const postCode = `
app.post('/api/notifications', requireAuth, async (req, res) => {
  try {
    const { title, message, type, userId } = req.body;
    const { notifications } = await import('./src/db/schema');
    const { db } = await import('./src/db');
    
    // Only admins or system can create notifications for others
    const reqUserId = (req).user.id;
    const role = (req).user.role;
    
    if (userId !== reqUserId && role !== 'Admin' && role !== 'Registrar' && role !== 'Bursar') {
       return res.status(403).json({ error: 'Forbidden' });
    }

    const [newNotification] = await db.insert(notifications).values({
      userId,
      title,
      message,
      type
    }).returning();
    
    res.json(newNotification);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create notification' });
  }
});
`;

if (!serverCode.includes("app.post('/api/notifications'")) {
  serverCode = serverCode.replace('app.get("/api/notifications", requireAuth, async (req, res) => {', postCode + '\n  app.get("/api/notifications", requireAuth, async (req, res) => {');
  fs.writeFileSync('server.ts', serverCode);
}
