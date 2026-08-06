import * as fs from 'fs';

let content = fs.readFileSync('src/db/schema.ts', 'utf8');

content = content.replace(
  /export const cmsNewsEvents = pgTable\('cms_news_events', \{([\s\S]*?)updatedAt: timestamp\('updated_at'\)\.defaultNow\(\),\n\}\);/g,
  `export const cmsNewsEvents = pgTable('cms_news_events', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  type: text('type').notNull(),
  content: text('content').notNull(),
  summary: text('summary'),
  imageUrl: text('image_url'),
  date: timestamp('date'),
  endDate: timestamp('end_date'),
  location: text('location'),
  status: text('status').default('Draft'),
  publishDate: timestamp('publish_date'),
  authorId: text('author_id'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});`
);

fs.writeFileSync('src/db/schema.ts', content);
console.log('Fixed schema.ts again');
