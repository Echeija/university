const fs = require('fs');

let schema = fs.readFileSync('src/db/schema.ts', 'utf8');

const examTable = `
export const examSchedules = pgTable('exam_schedules', {
  id: serial('id').primaryKey(),
  courseId: integer('course_id').references(() => courses.id, { onDelete: 'cascade' }).notNull(),
  examDate: text('exam_date').notNull(),
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
  venue: text('venue').notNull(),
  invigilatorId: integer('invigilator_id').references(() => users.id),
  instructions: text('instructions'),
  status: text('status').default('Scheduled').notNull(), // 'Scheduled', 'Completed', 'Cancelled'
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
`;

if (!schema.includes('examSchedules')) {
  schema += '\n' + examTable;
  fs.writeFileSync('src/db/schema.ts', schema);
  console.log('examSchedules table added.');
} else {
  console.log('examSchedules already exists.');
}
