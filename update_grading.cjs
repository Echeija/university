const fs = require('fs');
let schema = fs.readFileSync('src/db/schema.ts', 'utf8');

const oldGrading = `export const gradingRules = pgTable('grading_rules', {
  id: serial('id').primaryKey(),
  minScore: doublePrecision('min_score').notNull(),
  maxScore: doublePrecision('max_score').notNull(),
  grade: text('grade').notNull(),
  gradePoint: doublePrecision('grade_point').notNull(),
  description: text('description').notNull(),
  isPass: boolean('is_pass').notNull().default(true),
});`;

const newGrading = `export const gradingRules = pgTable('grading_rules', {
  id: serial('id').primaryKey(),
  minScore: doublePrecision('min_score').notNull(),
  maxScore: doublePrecision('max_score').notNull(),
  grade: text('grade').notNull(),
  gradePoint: doublePrecision('grade_point').notNull(),
  description: text('description').notNull(),
  isPass: boolean('is_pass').notNull().default(true),
}, (table) => ({
  gradeUnique: uniqueIndex('grading_rules_grade_idx').on(table.grade)
}));`;

schema = schema.replace(oldGrading, newGrading);
fs.writeFileSync('src/db/schema.ts', schema);
console.log('gradingRules table updated');
