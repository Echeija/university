const fs = require('fs');

let schema = fs.readFileSync('src/db/schema.ts', 'utf8');

const oldGpa = `export const semesterGpaRecords = pgTable('semester_gpa_records', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  academicSession: text('academic_session').notNull(),
  semester: text('semester').notNull(),
  totalCreditUnits: integer('total_credit_units').notNull(),
  totalQualityPoints: doublePrecision('total_quality_points').notNull(),
  gpa: doublePrecision('gpa').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});`;

const newGpa = `export const semesterGpaRecords = pgTable('semester_gpa_records', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  academicSession: text('academic_session').notNull(),
  semester: text('semester').notNull(),
  totalCreditUnits: integer('total_credit_units').notNull(),
  totalQualityPoints: doublePrecision('total_quality_points').notNull(),
  gpa: doublePrecision('gpa').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  semesterGpaStudentSessionUnique: uniqueIndex('semester_gpa_student_session_idx').on(table.studentId, table.academicSession, table.semester)
}));

export const semesterGpaRecordsRelations = relations(semesterGpaRecords, ({ one }) => ({
  student: one(users, { fields: [semesterGpaRecords.studentId], references: [users.id] })
}));`;

schema = schema.replace(oldGpa, newGpa);
fs.writeFileSync('src/db/schema.ts', schema);
console.log('GPA table updated');
