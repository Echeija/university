const fs = require('fs');
let serverCode = fs.readFileSync('server.ts', 'utf8');

const apiCode = `
// --- Notifications API ---
app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const { notifications } = await import("./src/db/schema");
    const userNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, req.user.id))
      .orderBy(desc(notifications.createdAt))
      .limit(20);
    res.json(userNotifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

app.put('/api/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const { notifications } = await import("./src/db/schema");
    await db
      .update(notifications)
      .set({ isRead: 'true' })
      .where(and(eq(notifications.id, parseInt(req.params.id)), eq(notifications.userId, req.user.id)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

app.put('/api/notifications/read-all', authenticateToken, async (req, res) => {
  try {
    const { notifications } = await import("./src/db/schema");
    await db
      .update(notifications)
      .set({ isRead: 'true' })
      .where(eq(notifications.userId, req.user.id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
});

app.post('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const { title, message, type, userId } = req.body;
    const { notifications } = await import("./src/db/schema");
    
    // Allow admins to send to anyone, otherwise only system
    if (req.user.role !== 'Admin' && req.user.role !== 'Registrar' && req.user.role !== 'Bursar') {
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
// ------------------------------------
`;

if (!serverCode.includes('/api/notifications')) {
  serverCode = serverCode.replace('app.get("/api/health", (req, res) => {', apiCode + '\napp.get("/api/health", (req, res) => {');
  fs.writeFileSync('server.ts', serverCode);
  console.log('Patched server.ts');
} else {
  console.log('Already patched');
}
