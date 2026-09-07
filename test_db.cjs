async function run() {
  const { db } = await import('./src/db/index.js');
  const schema = await import('./src/db/schema.js');
  const { eq, and, sql } = await import('drizzle-orm');
  
  try {
      const [activeSession] = await db.select().from(schema.academicSessions).where(eq(schema.academicSessions.isActive, true));
      const currentSessionName = activeSession?.name || '2024/2025';

      let baseQuery = db.select({
        id: schema.courses.id,
        code: schema.courses.code,
        title: schema.courses.title,
        credits: schema.courses.credits,
        departmentId: schema.courses.departmentId,
        semester: schema.courses.semester,
        studentsCount: sql`count(${schema.studentCourses.studentId})`.mapWith(Number)
      })
      .from(schema.courses)
      .innerJoin(schema.courseAllocations, eq(schema.courses.id, schema.courseAllocations.courseId))
      .leftJoin(schema.studentCourses, and(
          eq(schema.courses.id, schema.studentCourses.courseId),
          eq(schema.studentCourses.status, 'registered')
      ))
      .where(and(
             eq(schema.courseAllocations.lecturerId, 74),
             eq(schema.courseAllocations.academicYear, currentSessionName)
      ))
      .groupBy(schema.courses.id, schema.courseAllocations.id);
      
      const allCourses = await baseQuery;
      console.log(allCourses);
  } catch(e) {
      console.error(e);
  }
}
run();
