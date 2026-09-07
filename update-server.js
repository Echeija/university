const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const newEndpoint = `
  app.get("/api/course-catalog", async (req, res) => {
    try {
      const { courses, departments, courseAllocations, users } = await import('./src/db/schema');
      const { db } = await import('./src/db');
      const { eq } = await import('drizzle-orm');
      
      const allCourses = await db.select({
        id: courses.id,
        code: courses.code,
        title: courses.title,
        credits: courses.credits,
        semester: courses.semester,
        prerequisites: courses.prerequisites,
        department: departments.name,
      }).from(courses)
        .leftJoin(departments, eq(courses.departmentId, departments.id));

      const allocations = await db.select({
        courseId: courseAllocations.courseId,
        lecturerName: users.name,
      }).from(courseAllocations)
        .leftJoin(users, eq(courseAllocations.lecturerId, users.id));

      const allocationsMap = allocations.reduce((acc, curr) => {
        if (!acc[curr.courseId]) acc[curr.courseId] = [];
        if (curr.lecturerName && !acc[curr.courseId].includes(curr.lecturerName)) {
           acc[curr.courseId].push(curr.lecturerName);
        }
        return acc;
      }, {});

      const result = allCourses.map(c => ({
        ...c,
        instructors: allocationsMap[c.id] || []
      }));
      
      res.json(result);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch course catalog' });
    }
  });
`;

code = code.replace('app.get("/api/courses", async (req, res) => {', newEndpoint + '\n  app.get("/api/courses", async (req, res) => {');

fs.writeFileSync('server.ts', code);
