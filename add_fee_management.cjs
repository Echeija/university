const fs = require('fs');

// 1. UPDATE SERVER.TS
let server = fs.readFileSync('server.ts', 'utf8');

const feeEndpoints = `
  // FEE SETTINGS MANAGEMENT
  app.get("/api/bursary/fee-settings", requireAuth, requireRole(['Bursary', 'Administrator']), async (req, res) => {
    try {
      const { feeSettings } = await import('./src/db/schema');
      const allSettings = await db.select().from(feeSettings);
      res.json(allSettings);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to fetch fee settings" });
    }
  });

  app.post("/api/bursary/fee-settings", requireAuth, requireRole(['Bursary', 'Administrator']), async (req, res) => {
    try {
      const { feeSettings } = await import('./src/db/schema');
      const newSetting = await db.insert(feeSettings).values({
        ...req.body,
        updatedAt: new Date()
      }).returning();
      res.json(newSetting[0]);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to add fee setting" });
    }
  });

  app.delete("/api/bursary/fee-settings/:id", requireAuth, requireRole(['Bursary', 'Administrator']), async (req, res) => {
    try {
      const { feeSettings } = await import('./src/db/schema');
      const { eq } = await import('drizzle-orm');
      await db.delete(feeSettings).where(eq(feeSettings.id, parseInt(req.params.id)));
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to delete fee setting" });
    }
  });
`;

if (!server.includes('/api/bursary/fee-settings')) {
  server = server.replace('// BURSARY ROUTES', '// BURSARY ROUTES\n' + feeEndpoints);
}

// update /api/student/balance to use feeSettings
const oldBalanceEndpoint = `  app.get("/api/student/balance", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { payments } = await import('./src/db/schema');
      const { db } = await import('./src/db');
      
      const studentPayments = await db.select().from(payments).where(eq(payments.studentId, userId));
      const totalPaid = studentPayments
        .filter(p => p.status === 'successful')
        .reduce((sum, p) => sum + p.amount, 0);
        
      const balance = studentPayments
        .filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + p.amount, 0);
        
      const totalExpected = totalPaid + balance;
      
      res.json({ totalExpected, totalPaid, balance });
    } catch (e) {
      res.status(500).json({ error: 'Failed to fetch balance' });
    }
  });`;

const newBalanceEndpoint = `  app.get("/api/student/balance", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { payments, feeSettings, users } = await import('./src/db/schema');
      const { db } = await import('./src/db');
      const { eq, or, and, isNull } = await import('drizzle-orm');
      
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      const department = user?.department || 'Unknown';

      const studentPayments = await db.select().from(payments).where(eq(payments.studentId, userId));
      const totalPaid = studentPayments
        .filter(p => p.status === 'successful')
        .reduce((sum, p) => sum + p.amount, 0);

      // Total Expected is sum of all feeSettings that match the student's department or are for all departments
      const applicableFees = await db.select().from(feeSettings).where(
        or(
          eq(feeSettings.department, department),
          isNull(feeSettings.department),
          eq(feeSettings.department, '')
        )
      );

      const totalExpected = applicableFees.reduce((sum, f) => sum + f.amount, 0);
      const balance = Math.max(0, totalExpected - totalPaid);
      
      res.json({ totalExpected, totalPaid, balance, applicableFees });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch balance' });
    }
  });`;

server = server.replace(oldBalanceEndpoint, newBalanceEndpoint);
fs.writeFileSync('server.ts', server);
console.log('Updated server.ts with Fee Settings and better Balance API.');
