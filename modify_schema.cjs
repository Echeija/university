const fs = require('fs');

let schema = fs.readFileSync('src/db/schema.ts', 'utf8');

const originalResults = `export const results = pgTable('results', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  courseId: integer('course_id').references(() => courses.id, { onDelete: 'cascade' }).notNull(),
  score: doublePrecision('score').notNull(),
  grade: text('grade').notNull(),
  semester: text('semester').notNull(),
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
});`;

if (schema.includes("export const results = pgTable('results', {")) {
  // Using replace to swap the exact block
  schema = schema.replace(originalResults, newResults);
  
  if (!schema.includes("export const gradingRules")) {
    schema += `

export const gradingRules = pgTable('grading_rules', {
  id: serial('id').primaryKey(),
  minScore: doublePrecision('min_score').notNull(),
  maxScore: doublePrecision('max_score').notNull(),
  grade: text('grade').notNull(),
  gradePoint: doublePrecision('grade_point').notNull(),
  description: text('description').notNull(),
  isPass: boolean('is_pass').notNull().default(true),
});

export const semesterGpaRecords = pgTable('semester_gpa_records', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  academicSession: text('academic_session').notNull(),
  semester: text('semester').notNull(),
  totalCreditUnits: integer('total_credit_units').notNull(),
  totalQualityPoints: doublePrecision('total_quality_points').notNull(),
  gpa: doublePrecision('gpa').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const cgpaRecords = pgTable('cgpa_records', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  totalCreditUnits: integer('total_credit_units').notNull(),
  totalQualityPoints: doublePrecision('total_quality_points').notNull(),
  cgpa: doublePrecision('cgpa').notNull(),
  academicStanding: text('academic_standing').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const resultAmendments = pgTable('result_amendments', {
  id: serial('id').primaryKey(),
  resultId: integer('result_id').references(() => results.id, { onDelete: 'cascade' }).notNull(),
  requestedById: integer('requested_by_id').references(() => users.id).notNull(),
  oldCa: doublePrecision('old_ca'),
  newCa: doublePrecision('new_ca'),
  oldExam: doublePrecision('old_exam'),
  newExam: doublePrecision('new_exam'),
  reason: text('reason').notNull(),
  status: text('status', { enum: ['pending', 'approved', 'rejected'] }).notNull().default('pending'),
  approvedById: integer('approved_by_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const resultAuditLogs = pgTable('result_audit_logs', {
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
});

export const transcripts = pgTable('transcripts', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => users.id).notNull(),
  generatedById: integer('generated_by_id').references(() => users.id).notNull(),
  verificationCode: text('verification_code').unique().notNull(),
  status: text('status', { enum: ['valid', 'revoked'] }).notNull().default('valid'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
`;
  }
  
  fs.writeFileSync('src/db/schema.ts', schema);
  console.log('Schema updated successfully');
} else {
  console.log('Original results table not found exactly as specified.');
}
