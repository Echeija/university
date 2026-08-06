const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const route1 = `  app.get("/api/student/profile", requireAuth, requireRole(['Student']), async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { users } = await import('./src/db/schema');
      const { db } = await import('./src/db');
      const { eq } = await import('drizzle-orm');
      
      const [userProfile] = await db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        username: users.username,
        phone: users.phone,
        profilePicture: users.profilePicture
      }).from(users).where(eq(users.id, userId));
      
      if (!userProfile) return res.status(404).json({ error: 'User not found' });
      
      // Calculate progress (mocked based on profile completeness)
      const fields = ['phone', 'profilePicture'];
      const completed = fields.filter(f => userProfile[f as keyof typeof userProfile]).length;
      const progress = Math.round(((fields.length + completed) / (fields.length * 2)) * 100);
      
      res.json({ ...userProfile, profileProgress: progress });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch progress' });
    }
  });`;

const route2 = `  app.get("/api/student/profile", requireAuth, async (req, res) => {
    try {
      const studentId = (req as any).user.id;
      const { users, studentMedicalProfiles } = await import('./src/db/schema');
      const { db } = await import('./src/db');
      const { eq } = await import('drizzle-orm');
      
      const userRes = await db.select().from(users).where(eq(users.id, studentId));
      if (!userRes.length) return res.status(404).json({ error: 'User not found' });
      const user = userRes[0];
      
      const medRes = await db.select().from(studentMedicalProfiles).where(eq(studentMedicalProfiles.studentId, studentId));
      const medProfile: any = medRes[0] || {};
      
      res.json({
        phone: user.phone || '',
        profilePicture: user.profilePicture || '',
        emergencyContactName: medProfile.emergencyContactName || '',
        emergencyContactPhone: medProfile.emergencyContactPhone || '',
        emergencyContactRelation: medProfile.emergencyContactRelation || '',
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  });`;

const combinedRoute = `  app.get("/api/student/profile", requireAuth, async (req, res) => {
    try {
      const studentId = (req as any).user.id;
      const { users, studentMedicalProfiles } = await import('./src/db/schema');
      const { db } = await import('./src/db');
      const { eq } = await import('drizzle-orm');
      
      const userRes = await db.select().from(users).where(eq(users.id, studentId));
      if (!userRes.length) return res.status(404).json({ error: 'User not found' });
      const user = userRes[0];
      
      const medRes = await db.select().from(studentMedicalProfiles).where(eq(studentMedicalProfiles.studentId, studentId));
      const medProfile: any = medRes[0] || {};
      
      const fields = ['phone', 'profilePicture'];
      const completed = fields.filter(f => user[f as keyof typeof user]).length;
      const progress = Math.round(((fields.length + completed) / (fields.length * 2)) * 100);

      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        phone: user.phone || '',
        profilePicture: user.profilePicture || '',
        profileProgress: progress,
        emergencyContactName: medProfile.emergencyContactName || '',
        emergencyContactPhone: medProfile.emergencyContactPhone || '',
        emergencyContactRelation: medProfile.emergencyContactRelation || '',
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  });`;

if (code.includes(route1) && code.includes(route2)) {
  code = code.replace(route1, "");
  code = code.replace(route2, combinedRoute);
  fs.writeFileSync('server.ts', code);
  console.log("Fixed duplicate routes in server.ts");
} else {
  console.log("Could not find routes to replace");
}
