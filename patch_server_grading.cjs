const fs = require('fs');
let server = fs.readFileSync('server.ts', 'utf8');

const routeToInsert = `
  app.get("/api/grading-rules", requireAuth, async (req, res) => {
    try {
      const rules = await db.select().from(schema.gradingRules).orderBy(schema.gradingRules.minScore);
      res.json(rules);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: "Failed to load grading rules" });
    }
  });

  // Save/Submit Course Results`;

server = server.replace('  // Save/Submit Course Results', routeToInsert);
fs.writeFileSync('server.ts', server);
console.log('Added /api/grading-rules');
