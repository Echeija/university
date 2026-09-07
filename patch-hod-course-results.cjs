const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetRegex = /const courseId = parseInt\(req\.params\.courseId\);\s*const statusFilter = req\.query\.status as string; \/\/ 'submitted' or 'hod_approved'\s*const results = await db\.select\(/g;

const replacementString = `const courseId = parseInt(req.params.courseId);
      const statusFilter = req.query.status as string; // 'submitted' or 'hod_approved'
        
      const actorRole = (req as any).user.role;
      const actorDepartment = (req as any).user.department;

      if (actorRole === 'HOD') {
          const [course] = await db.select({ departmentName: schema.departments.name })
              .from(schema.courses)
              .leftJoin(schema.departments, eq(schema.courses.departmentId, schema.departments.id))
              .where(eq(schema.courses.id, courseId));
              
          if (!course || course.departmentName !== actorDepartment) {
              return res.status(403).json({ error: "Unauthorized: Course not in your department." });
          }
      }

      const results = await db.select(`;

if (targetRegex.test(code)) {
    code = code.replace(targetRegex, replacementString);
    fs.writeFileSync('server.ts', code);
    console.log('Patched HOD course results route');
} else {
    console.log('Target not found for HOD course results using regex');
}
