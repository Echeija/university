const fs = require('fs');

let schema = fs.readFileSync('src/db/schema.ts', 'utf8');

const oldCgpa = `export const cgpaRecords = pgTable('cgpa_records', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  totalCreditUnits: integer('total_credit_units').notNull(),
  totalQualityPoints: doublePrecision('total_quality_points').notNull(),
  cgpa: doublePrecision('cgpa').notNull(),
  academicStanding: text('academic_standing').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});`;

const newCgpa = `export const cgpaRecords = pgTable('cgpa_records', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  totalCreditUnits: integer('total_credit_units').notNull(),
  totalQualityPoints: doublePrecision('total_quality_points').notNull(),
  cgpa: doublePrecision('cgpa').notNull(),
  academicStanding: text('academic_standing').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  cgpaStudentUnique: uniqueIndex('cgpa_student_idx').on(table.studentId)
}));

export const cgpaRecordsRelations = relations(cgpaRecords, ({ one }) => ({
  student: one(users, { fields: [cgpaRecords.studentId], references: [users.id] })
}));`;

schema = schema.replace(oldCgpa, newCgpa);
fs.writeFileSync('src/db/schema.ts', schema);
console.log('CGPA table updated');
