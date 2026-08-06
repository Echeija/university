const fs = require('fs');
let schema = fs.readFileSync('src/db/schema.ts', 'utf8');

if (!schema.includes('systemSettings')) {
  schema += `\nexport const systemSettings = pgTable('system_settings', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow()
});\n`;
  fs.writeFileSync('src/db/schema.ts', schema);
}
