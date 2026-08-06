import * as fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf8');

// Fix content_blocks PUT
content = content.replace(
  /const \[updated\] = await db\.update\(contentBlocks\)\s*\.set\(\{ \.\.\.req\.body, updatedAt: new Date\(\) \}\)/,
  `
      const updateData = { ...req.body };
      if (updateData.createdAt) updateData.createdAt = new Date(updateData.createdAt);
      if (updateData.updatedAt) updateData.updatedAt = new Date(updateData.updatedAt);
      
      const [updated] = await db.update(contentBlocks)
        .set({ ...updateData, updatedAt: new Date() })`
);

// Fix news_events PUT
content = content.replace(
  /const updateData = \{ \.\.\.req\.body \};\s*if \(updateData\.date\)/,
  `const updateData = { ...req.body };
      if (updateData.createdAt) updateData.createdAt = new Date(updateData.createdAt);
      if (updateData.updatedAt) updateData.updatedAt = new Date(updateData.updatedAt);
      if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);
      if (updateData.date)`
);

fs.writeFileSync('server.ts', content);
console.log('Fixed PUT endpoints for date parsing');
