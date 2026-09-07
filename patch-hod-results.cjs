const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetRegex = /const { resultIds, action, reason } = req\.body; \/\/ action: 'approve' or 'return'\s*const actorId = \(req as any\)\.user\.id;\s*const newStatus = action === 'approve' \? 'hod_approved' : 'returned';/g;

const replacementString = `const { resultIds, action, reason } = req.body; // action: 'approve' or 'return'
      const actorId = (req as any).user.id;
      const actorRole = (req as any).user.role;
      const actorDepartment = (req as any).user.department;

      // HOD Authorization Check
      if (actorRole !== 'Administrator') {
          // Check if all results belong to the HOD's department
          const resultsToCheck = await db.select({
              courseDepartmentId: schema.courses.departmentId,
              departmentName: schema.departments.name
          }).from(schema.results)
          .innerJoin(schema.courses, eq(schema.results.courseId, schema.courses.id))
          .leftJoin(schema.departments, eq(schema.courses.departmentId, schema.departments.id))
          .where(inArray(schema.results.id, resultIds));

          for (const res of resultsToCheck) {
              if (res.departmentName !== actorDepartment) {
                  return res.status(403).json({ error: "Unauthorized: You can only review results for your department." });
              }
          }
      }

      const newStatus = action === 'approve' ? 'hod_approved' : 'returned';`;

if (targetRegex.test(code)) {
    code = code.replace(targetRegex, replacementString);
    fs.writeFileSync('server.ts', code);
    console.log('Patched HOD results route');
} else {
    console.log('Target not found for HOD results using regex');
}
