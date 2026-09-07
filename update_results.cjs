const fs = require('fs');

let schema = fs.readFileSync('src/db/schema.ts', 'utf8');

const oldResults = `export const results = pgTable('results', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  courseId: integer('course_id').references(() => courses.id, { onDelete: 'cascade' }).notNull(),
  academicSession: text('academic_session').notNull().default('2025/2026'),
  semester: text('semester').notNull(),
  caScore: doublePrecision('ca_score'),
  examScore: doublePrecision('exam_score'),
  score: doublePrecision('score'),
  grade: text('grade'),
  gradePoint: doublePrecision('grade_point'),
  qualityPoint: doublePrecision('quality_point'),
  status: text('status', { enum: ['draft', 'submitted', 'returned', 'hod_approved', 'registrar_approved', 'published', 'locked'] }).notNull().default('draft'),
  returnReason: text('return_reason'),
  approvedByHodId: integer('approved_by_hod_id').references(() => users.id),
  approvedByRegistrarId: integer('approved_by_registrar_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});`;

const newResults = `export const results = pgTable('results', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  courseId: integer('course_id').references(() => courses.id, { onDelete: 'cascade' }).notNull(),
  academicSession: text('academic_session').notNull().default('2025/2026'),
  semester: text('semester').notNull(),
  caScore: doublePrecision('ca_score'),
  examScore: doublePrecision('exam_score'),
  score: doublePrecision('score'),
  grade: text('grade'),
  gradePoint: doublePrecision('grade_point'),
  qualityPoint: doublePrecision('quality_point'),
  status: text('status', { enum: ['draft', 'submitted', 'returned', 'hod_approved', 'registrar_approved', 'published', 'locked'] }).notNull().default('draft'),
  returnReason: text('return_reason'),
  approvedByHodId: integer('approved_by_hod_id').references(() => users.id),
  approvedByRegistrarId: integer('approved_by_registrar_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  studentCourseSessionUnique: uniqueIndex('results_student_course_session_idx').on(table.studentId, table.courseId, table.academicSession, table.semester),
  statusIdx: index('results_status_idx').on(table.status),
  studentIdx: index('results_student_idx').on(table.studentId)
}));

export const resultsRelations = relations(results, ({ one, many }) => ({
  student: one(users, { fields: [results.studentId], references: [users.id], relationName: 'studentResults' }),
  course: one(courses, { fields: [results.courseId], references: [courses.id] }),
  amendments: many(resultAmendments),
  auditLogs: many(resultAuditLogs)
}));`;

schema = schema.replace(oldResults, newResults);
fs.writeFileSync('src/db/schema.ts', schema);
console.log('Results table updated');
