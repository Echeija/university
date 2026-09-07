const fs = require('fs');
let schema = fs.readFileSync('src/db/schema.ts', 'utf8');

const oldAudit = `export const resultAuditLogs = pgTable('result_audit_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  role: text('role').notNull(),
  studentId: integer('student_id').references(() => users.id).notNull(),
  courseId: integer('course_id').references(() => courses.id).notNull(),
  action: text('action').notNull(),
  oldCa: doublePrecision('old_ca'),
  newCa: doublePrecision('new_ca'),
  oldExam: doublePrecision('old_exam'),
  newExam: doublePrecision('new_exam'),
  oldGrade: text('old_grade'),
  newGrade: text('new_grade'),
  reason: text('reason'),
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});`;

const newAudit = `export const resultAuditLogs = pgTable('result_audit_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  role: text('role').notNull(),
  studentId: integer('student_id').references(() => users.id).notNull(),
  courseId: integer('course_id').references(() => courses.id).notNull(),
  action: text('action').notNull(),
  oldCa: doublePrecision('old_ca'),
  newCa: doublePrecision('new_ca'),
  oldExam: doublePrecision('old_exam'),
  newExam: doublePrecision('new_exam'),
  oldGrade: text('old_grade'),
  newGrade: text('new_grade'),
  reason: text('reason'),
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  studentIdx: index('result_audit_student_idx').on(table.studentId),
  courseIdx: index('result_audit_course_idx').on(table.courseId)
}));

export const resultAuditLogsRelations = relations(resultAuditLogs, ({ one }) => ({
  user: one(users, { fields: [resultAuditLogs.userId], references: [users.id], relationName: 'auditLogUser' }),
  student: one(users, { fields: [resultAuditLogs.studentId], references: [users.id], relationName: 'auditLogStudent' }),
  course: one(courses, { fields: [resultAuditLogs.courseId], references: [courses.id] })
}));`;

schema = schema.replace(oldAudit, newAudit);
fs.writeFileSync('src/db/schema.ts', schema);
console.log('resultAuditLogs table updated');
