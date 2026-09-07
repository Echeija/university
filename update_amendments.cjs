const fs = require('fs');
let schema = fs.readFileSync('src/db/schema.ts', 'utf8');

const oldAmend = `export const resultAmendments = pgTable('result_amendments', {
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
});`;

const newAmend = `export const resultAmendments = pgTable('result_amendments', {
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
}, (table) => ({
  statusIdx: index('result_amendments_status_idx').on(table.status),
  resultIdx: index('result_amendments_result_idx').on(table.resultId)
}));

export const resultAmendmentsRelations = relations(resultAmendments, ({ one }) => ({
  result: one(results, { fields: [resultAmendments.resultId], references: [results.id] }),
  requestedBy: one(users, { fields: [resultAmendments.requestedById], references: [users.id], relationName: 'amendmentRequestedBy' }),
  approvedBy: one(users, { fields: [resultAmendments.approvedById], references: [users.id], relationName: 'amendmentApprovedBy' })
}));`;

schema = schema.replace(oldAmend, newAmend);
fs.writeFileSync('src/db/schema.ts', schema);
console.log('resultAmendments table updated');
