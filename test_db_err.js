import { db } from './src/db/index.js';
import { cmsNewsEvents } from './src/db/schema.js';
try {
  const insertData = {
    title: 'Test News',
    type: 'news',
    content: 'Test content',
    status: 'Published',
    date: '2026-07-24T12:00:00Z',
    publishDate: '2026-07-24T12:00:00Z'
  };
  if (insertData.date) insertData.date = new Date(insertData.date);
  if (insertData.publishDate) insertData.publishDate = new Date(insertData.publishDate);
  insertData.createdAt = new Date();
  insertData.updatedAt = new Date();
  
  await db.insert(cmsNewsEvents).values(insertData);
  console.log("Success");
} catch(e) {
  console.error(e.message);
}
process.exit(0);
